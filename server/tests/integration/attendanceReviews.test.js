import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { seedDatabase } from '../../src/seeds/seed.js';
import {
  EventEdition,
  User,
  AttendanceVerification,
  Review,
} from '../../src/models/index.js';
import { signToken } from '../../src/utils/token.js';

describe('Phase 4: Attendance Verification & Reviews Integration Tests', () => {
  const app = createApp();

  beforeEach(async () => {
    await seedDatabase({ silent: true });
  });

  describe('Attendance Verification Flow', () => {
    it('INVARIANT: student cannot self-verify attendance directly without trusted token', async () => {
      const student = await User.findOne({ email: 'student.apex@eventrank.test' });
      const edition = await EventEdition.findOne({ editionLabel: '2026 Edition' });

      const studentToken = signToken({
        id: student._id,
        collegeId: student.collegeId,
        collegeRole: 'student',
      });

      // Attempt self-verification without token
      const res = await request(app)
        .post(`/api/v1/event-editions/${edition._id}/check-in`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ method: 'dynamic_token' }); // missing token

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');

      // Attempt self-verification with manual method (forbidden for student)
      const resManual = await request(app)
        .post(`/api/v1/event-editions/${edition._id}/check-in`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ method: 'organizer_checkin' });

      expect(resManual.status).toBe(403);
      expect(resManual.body.error.code).toBe('FORBIDDEN');
    });

    it('allows authorized organizer to generate check-in token and student verifies successfully', async () => {
      const organizer = await User.findOne({ email: 'organizer@apex.test' });
      const student = await User.findOne({ email: 'student.apex@eventrank.test' });
      const edition = await EventEdition.findOne({ editionLabel: '2026 Edition' });

      const orgToken = signToken({
        id: organizer._id,
        collegeId: organizer.collegeId,
        collegeRole: 'organizer',
      });

      // 1. Organizer generates single-use/time-scoped token
      const tokenRes = await request(app)
        .post(`/api/v1/event-editions/${edition._id}/check-in-token`)
        .set('Authorization', `Bearer ${orgToken}`)
        .send({ expiresInMinutes: 30 });

      expect(tokenRes.status).toBe(201);
      const { checkInToken } = tokenRes.body.data;
      expect(checkInToken).toBeDefined();

      // 2. Student scans and submits token for check-in
      const studentToken = signToken({
        id: student._id,
        collegeId: student.collegeId,
        collegeRole: 'student',
      });

      const checkInRes = await request(app)
        .post(`/api/v1/event-editions/${edition._id}/check-in`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ method: 'dynamic_token', token: checkInToken });

      expect(checkInRes.status).toBe(200);
      expect(checkInRes.body.data.verification.status).toBe('verified');
      expect(checkInRes.body.data.verification.verifiedBy.toString()).toBe(organizer._id.toString());

      // 3. Verify status endpoint confirms verified attendance
      const statusRes = await request(app)
        .get(`/api/v1/event-editions/${edition._id}/attendance/me`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(statusRes.status).toBe(200);
      expect(statusRes.body.data.isVerified).toBe(true);
      expect(statusRes.body.data.status).toBe('verified');
    });

    it('allows organizer to verify student on roster manually', async () => {
      const organizer = await User.findOne({ email: 'organizer@apex.test' });
      const student = await User.findOne({ email: 'student.cascade@eventrank.test' });
      const edition = await EventEdition.findOne({ editionLabel: '2026 Edition' });

      const orgToken = signToken({
        id: organizer._id,
        collegeId: organizer.collegeId,
        collegeRole: 'organizer',
      });

      const verifyRes = await request(app)
        .post(`/api/v1/event-editions/${edition._id}/attendance/${student._id}/verify`)
        .set('Authorization', `Bearer ${orgToken}`)
        .send({ method: 'organizer_checkin', evidenceReference: 'GATE-DESK-A' });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.data.verification.status).toBe('verified');
      expect(verifyRes.body.data.verification.method).toBe('organizer_checkin');
    });
  });

  describe('Post-Event Review Invariants & Score Refresh', () => {
    it('INVARIANT: review submission fails before event completion', async () => {
      const student = await User.findOne({ email: 'student.apex@eventrank.test' });
      const upcomingEdition = await EventEdition.findOne({ editionLabel: '2026 Edition' });

      const studentToken = signToken({
        id: student._id,
        collegeId: student.collegeId,
        collegeRole: 'student',
      });

      const res = await request(app)
        .post(`/api/v1/event-editions/${upcomingEdition._id}/reviews`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          dimensions: { organization: 5, contentValue: 5, networking: 5, timeCostValue: 5 },
          text: 'Too early!',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/after the event has ended/i);
    });

    it('INVARIANT: unverified attendee cannot submit an official review', async () => {
      const unverifiedStudent = await User.findOne({ email: 'student.metro@eventrank.test' });
      const completedEdition = await EventEdition.findOne({ editionLabel: 'Spring 2026 Retrospective' });

      // Ensure no verified attendance exists for this student
      await AttendanceVerification.deleteMany({
        eventEditionId: completedEdition._id,
        userId: unverifiedStudent._id,
      });

      const studentToken = signToken({
        id: unverifiedStudent._id,
        collegeId: unverifiedStudent.collegeId,
        collegeRole: 'student',
      });

      const res = await request(app)
        .post(`/api/v1/event-editions/${completedEdition._id}/reviews`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          dimensions: { organization: 4, contentValue: 4, networking: 4, timeCostValue: 4 },
          text: 'I was not verified.',
        });

      expect(res.status).toBe(403);
      expect(res.body.error.message).toMatch(/Attendance verification is required/i);
    });

    it('INVARIANT: verified attendee submits review, duplicate is rejected, and score refreshes', async () => {
      const student = await User.findOne({ email: 'student.cascade@eventrank.test' });
      const completedEdition = await EventEdition.findOne({ editionLabel: 'Spring 2026 Retrospective' });

      // Grant verified attendance
      await AttendanceVerification.create({
        eventEditionId: completedEdition._id,
        userId: student._id,
        method: 'organizer_checkin',
        status: 'verified',
        verifiedBy: student._id,
      });

      const studentToken = signToken({
        id: student._id,
        collegeId: student.collegeId,
        collegeRole: 'student',
      });

      // 1. Check eligibility endpoint confirms can review
      const eligRes = await request(app)
        .get(`/api/v1/event-editions/${completedEdition._id}/reviews/eligibility`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(eligRes.status).toBe(200);
      expect(eligRes.body.data.isEligible).toBe(true);

      // 2. Submit official review
      const reviewRes = await request(app)
        .post(`/api/v1/event-editions/${completedEdition._id}/reviews`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          dimensions: { organization: 5, contentValue: 5, networking: 4, timeCostValue: 4 },
          text: 'Great event for engineers across colleges!',
        });

      expect(reviewRes.status).toBe(201);
      expect(reviewRes.body.data.review.overallRating).toBe(4.5);
      expect(reviewRes.body.data.updatedScores.scoreRefreshed).toBe(true);
      expect(reviewRes.body.data.updatedScores.eventQuality.status).toBe('review_supported');

      // 3. INVARIANT: duplicate review submission is rejected (409 Conflict)
      const dupRes = await request(app)
        .post(`/api/v1/event-editions/${completedEdition._id}/reviews`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          dimensions: { organization: 3, contentValue: 3, networking: 3, timeCostValue: 3 },
          text: 'Duplicate try',
        });

      expect(dupRes.status).toBe(409);
      expect(dupRes.body.error.code).toBe('DUPLICATE_REVIEW');
    });

    it('lists published edition reviews with structured dimension averages', async () => {
      const completedEdition = await EventEdition.findOne({ editionLabel: 'Spring 2026 Retrospective' });

      const res = await request(app).get(`/api/v1/event-editions/${completedEdition._id}/reviews`);

      expect(res.status).toBe(200);
      expect(res.body.data.reviews.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.summary).toHaveProperty('averageOverall');
      expect(res.body.data.summary).toHaveProperty('averageOrganization');
      expect(res.body.data.summary.reviewCount).toBeGreaterThanOrEqual(1);
    });

    it('allows reporting and moderator status transition with college scope enforcement', async () => {
      const completedEdition = await EventEdition.findOne({ editionLabel: 'Spring 2026 Retrospective' });
      const review = await Review.findOne({ eventEditionId: completedEdition._id });
      const student = await User.findOne({ email: 'student.apex@eventrank.test' });
      const foreignAdmin = await User.findOne({ email: 'admin@apex.test' });
      const hostCollegeAdmin = await User.findOne({ email: 'admin@stjude.edu' });

      const studentToken = signToken({ id: student._id });
      const foreignAdminToken = signToken({
        id: foreignAdmin._id,
        collegeId: foreignAdmin.collegeId,
        collegeRole: 'college_admin',
      });
      const hostAdminToken = signToken({
        id: hostCollegeAdmin._id,
        collegeId: hostCollegeAdmin.collegeId,
        collegeRole: 'college_admin',
      });

      // 1. Student reports review
      const reportRes = await request(app)
        .post(`/api/v1/reviews/${review._id}/report`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ reason: 'Suspected conflict of interest' });

      expect(reportRes.status).toBe(200);

      // 2. Apex admin attempts to moderate a St. Jude event review -> BLOCKED (403)
      const badModRes = await request(app)
        .post(`/api/v1/reviews/${review._id}/moderate`)
        .set('Authorization', `Bearer ${foreignAdminToken}`)
        .send({ status: 'hidden', moderationReason: 'Flagged inappropriate' });

      expect(badModRes.status).toBe(403);

      // 3. St. Jude admin moderates own college event review -> ALLOWED (200)
      const goodModRes = await request(app)
        .post(`/api/v1/reviews/${review._id}/moderate`)
        .set('Authorization', `Bearer ${hostAdminToken}`)
        .send({ status: 'hidden', moderationReason: 'Policy violation confirmed' });

      expect(goodModRes.status).toBe(200);
      expect(goodModRes.body.data.status).toBe('hidden');
    });
  });
});
