import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { seedDatabase } from '../../src/seeds/seed.js';
import { EventEdition, User, College, Registration } from '../../src/models/index.js';
import { signToken } from '../../src/utils/token.js';

describe('Registration Lifecycle & Peer Signals API Tests (/api/v1/event-editions)', () => {
  const app = createApp();

  beforeEach(async () => {
    await seedDatabase({ silent: true });
  });

  it('allows cross-college registration for events open to all active colleges', async () => {
    // Metro student registering for Apex Hackathon
    const metroStudent = await User.findOne({ email: 'student.metro@eventrank.test' });
    const hackathonEdition = await EventEdition.findOne({ eligibility: 'all_active_colleges' });

    // Ensure student is not already registered
    await Registration.deleteMany({ eventEditionId: hackathonEdition._id, userId: metroStudent._id });

    const token = signToken({
      id: metroStudent._id,
      collegeId: metroStudent.collegeId,
      collegeRole: 'student',
    });

    const res = await request(app)
      .post(`/api/v1/event-editions/${hackathonEdition._id}/registrations`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(201);
    expect(res.body.data.registration.status).toBe('registered');
    expect(res.body.data.registration.userId.toString()).toBe(metroStudent._id.toString());
  });

  it('BLOCKS students from other colleges from registering for host-college-only events (403 Forbidden)', async () => {
    // Metro student attempts to register for Apex internal bootcamp (host_college_only)
    const metroStudent = await User.findOne({ email: 'student.metro@eventrank.test' });
    const hostOnlyEdition = await EventEdition.findOne({ eligibility: 'host_college_only' });

    const token = signToken({
      id: metroStudent._id,
      collegeId: metroStudent.collegeId,
      collegeRole: 'student',
    });

    const res = await request(app)
      .post(`/api/v1/event-editions/${hostOnlyEdition._id}/registrations`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(res.body.error.message).toMatch(/Eligibility restriction.*restricted to students of/i);
  });

  it('allows host college students to register for host-college-only events', async () => {
    // Apex student registering for Apex internal bootcamp
    const apexStudent = await User.findOne({ email: 'student.apex@eventrank.test' });
    const hostOnlyEdition = await EventEdition.findOne({ eligibility: 'host_college_only' });

    await Registration.deleteMany({ eventEditionId: hostOnlyEdition._id, userId: apexStudent._id });

    const token = signToken({
      id: apexStudent._id,
      collegeId: apexStudent.collegeId,
      collegeRole: 'student',
    });

    const res = await request(app)
      .post(`/api/v1/event-editions/${hostOnlyEdition._id}/registrations`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(201);
    expect(res.body.data.registration.status).toBe('registered');
  });

  it('rejects duplicate active registration for the same student (409 Conflict)', async () => {
    const student = await User.findOne({ email: 'student.cascade@eventrank.test' });
    const edition = await EventEdition.findOne({ eligibility: 'all_active_colleges' });

    const token = signToken({
      id: student._id,
      collegeId: student.collegeId,
      collegeRole: 'student',
    });

    // Ensure already registered
    await Registration.findOneAndUpdate(
      { eventEditionId: edition._id, userId: student._id },
      { $set: { status: 'registered', collegeId: student.collegeId } },
      { upsert: true }
    );

    // Attempt second registration
    const res = await request(app)
      .post(`/api/v1/event-editions/${edition._id}/registrations`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_REGISTRATION');
  });

  it('allows a student to cancel their registration and re-register later', async () => {
    const student = await User.findOne({ email: 'student.cascade@eventrank.test' });
    const edition = await EventEdition.findOne({ eligibility: 'all_active_colleges' });

    const token = signToken({
      id: student._id,
      collegeId: student.collegeId,
      collegeRole: 'student',
    });

    // Cancel registration
    const cancelRes = await request(app)
      .delete(`/api/v1/event-editions/${edition._id}/registrations/me`)
      .set('Authorization', `Bearer ${token}`);

    expect(cancelRes.status).toBe(200);

    // Verify registration status is now cancelled
    const statusRes = await request(app)
      .get(`/api/v1/event-editions/${edition._id}/registration-status`)
      .set('Authorization', `Bearer ${token}`);

    expect(statusRes.status).toBe(200);
    expect(statusRes.body.data.isRegistered).toBe(false);
    expect(statusRes.body.data.registrationStatus).toBe('cancelled');

    // Re-register
    const reregisterRes = await request(app)
      .post(`/api/v1/event-editions/${edition._id}/registrations`)
      .set('Authorization', `Bearer ${token}`);

    expect(reregisterRes.status).toBe(201);
    expect(reregisterRes.body.data.registration.status).toBe('registered');
  });

  it('returns pre-event signals with authoritative registrations, scoped peer counts, and privacy thresholds', async () => {
    const student = await User.findOne({ email: 'student.apex@eventrank.test' });
    const hackathonEdition = await EventEdition.findOne({
      editionLabel: '2026 Edition',
      eligibility: 'all_active_colleges',
    });

    const token = signToken({
      id: student._id,
      collegeId: student.collegeId,
      collegeRole: 'student',
    });

    const res = await request(app)
      .get(`/api/v1/event-editions/${hackathonEdition._id}/signals`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const { signals } = res.body.data;

    // Total registrations computed authoritatively
    expect(signals.totalRegistrations).toBeGreaterThanOrEqual(1);

    // Peer signal: Scoped to student's college with privacy threshold
    expect(signals.peersGoing).toBeDefined();
    expect(signals.peersGoing.scopedCollegeId.toString()).toBe(student.collegeId.toString());

    // Because only 1 Apex peer is registered (< 5), privacy protection must mask the raw count
    expect(signals.peersGoing.privacyProtected).toBe(true);
    expect(signals.peersGoing.countDisplay).toBe('< 5');
    expect(signals.peersGoing.rawCount).toBeNull(); // Private count suppressed

    // Organizer track record
    expect(signals.organizerHistory.totalEventsCount).toBeGreaterThan(0);
    expect(signals.organizerHistory.completedEditionsCount).toBe(1);

    // Past edition rating (derived from Hackathon 2025 Edition)
    expect(signals.pastEditionRating).toBeDefined();
    expect(signals.pastEditionRating.averageRating).toBe(4.8);
    expect(signals.pastEditionRating.reviewCount).toBe(1);
  });
});
