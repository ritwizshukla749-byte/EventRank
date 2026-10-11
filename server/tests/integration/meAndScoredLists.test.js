import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { seedDatabase } from '../../src/seeds/seed.js';
import { User, EventEdition } from '../../src/models/index.js';
import { signToken } from '../../src/utils/token.js';

function authHeader(user, collegeRole = 'student') {
  return `Bearer ${signToken({ id: user._id, collegeId: user.collegeId, collegeRole })}`;
}

describe('Phase 5: /users/me, /organizers/me and Scored Event Lists', () => {
  const app = createApp();

  beforeEach(async () => {
    await seedDatabase({ silent: true });
  });

  it('GET /users/me/registrations returns the caller-typed registrations with attendance flags', async () => {
    const alex = await User.findOne({ email: 'alex.rivera@cascade.edu' });

    const res = await request(app)
      .get('/api/v1/users/me/registrations')
      .set('Authorization', authHeader(alex));

    expect(res.status).toBe(200);
    expect(res.body.data.registrations).toHaveLength(3);

    const genAIRow = res.body.data.registrations.find(
      (r) => r.edition?.editionLabel === 'Spring 2026 Retrospective'
    );
    expect(genAIRow).toBeDefined();
    expect(genAIRow.hasAttendance).toBe(true);
    expect(genAIRow.event.title).toBe('Generative AI Workflows for Product Designers');
    expect(genAIRow.hostCollege.name).toBe('St. Jude College of Art & Design');
    expect(genAIRow.edition.venue).toBe('St. Jude Virtual Auditorium & Studio 4');
  });

  it('PATCH /users/me updates whitelisted profile fields and refuses role escalation', async () => {
    const alex = await User.findOne({ email: 'alex.rivera@cascade.edu' });

    // Legit profile update
    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', authHeader(alex))
      .send({ department: 'Software Engineering', interests: ['Game Dev', 'XR'], budgetMax: 100 });

    expect(res.status).toBe(200);
    expect(res.body.data.user.department).toBe('Software Engineering');
    expect(res.body.data.user.budgetMax).toBe(100);
    expect(res.body.data.user.collegeRole).toBe('student');

    // Role escalation attempt is rejected by the strict whitelist schema
    const badRes = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', authHeader(alex))
      .send({ collegeRole: 'college_admin' });

    expect(badRes.status).toBe(400);
    expect(badRes.body.error.code).toBe('VALIDATION_ERROR');

    const reloaded = await User.findById(alex._id);
    expect(reloaded.collegeRole).toBe('student');
    expect(reloaded.globalRole).toBe('user');
  });

  it('GET /organizers/me resolves the caller\'s organizer and 404s for students', async () => {
    const organizer = await User.findOne({ email: 'organizer@apex.test' });
    const student = await User.findOne({ email: 'student.apex@eventrank.test' });

    const res = await request(app)
      .get('/api/v1/organizers/me')
      .set('Authorization', authHeader(organizer, 'organizer'));

    expect(res.status).toBe(200);
    expect(res.body.data.organizer.name).toBe('Coding Club');
    expect(res.body.data.organizer.hostCollege.slug).toBe('apex-tech');

    const blockedRes = await request(app)
      .get('/api/v1/organizers/me')
      .set('Authorization', authHeader(student));

    expect(blockedRes.status).toBe(404);
  });

  it('GET /events?includeScores=true attaches strictly separate quality and fit summaries', async () => {
    const alex = await User.findOne({ email: 'alex.rivera@cascade.edu' });

    const res = await request(app)
      .get('/api/v1/events?includeScores=true&limit=50')
      .set('Authorization', authHeader(alex));

    expect(res.status).toBe(200);
    expect(res.body.data.events.length).toBeGreaterThanOrEqual(7);

    for (const item of res.body.data.events) {
      expect(item.event.title).toBeTruthy();
      expect(item.hostCollege.name).toBeTruthy();
      expect(item.organizer.name).toBeTruthy();
      expect(item.registrationCount).toBeTypeOf('number');

      // Event Quality and Fit are distinct score concepts: quality carries evidence
      // explanation codes; fit must NOT be hijacked with quality-only fields.
      expect(item.quality).toBeDefined();
      expect(item.quality.scoreVersion).toBeTruthy();
      expect(Array.isArray(item.quality.explanationCodes)).toBe(true);
      expect(item.fit).not.toHaveProperty('explanationCodes');
      expect(item.fit).not.toHaveProperty('eligibleReviewCount');
    }
  });

  it('GET /events?sort=quality ranks scored events stably (nulls last)', async () => {
    const alex = await User.findOne({ email: 'alex.rivera@cascade.edu' });

    const res = await request(app)
      .get('/api/v1/events?sort=quality&limit=50')
      .set('Authorization', authHeader(alex));

    expect(res.status).toBe(200);
    const items = res.body.data.events;
    expect(items.length).toBeGreaterThanOrEqual(7);

    const scores = items.map((item) => item.quality?.score ?? -1);
    const allScored = scores.filter((s) => s >= 0);
    for (let i = 1; i < scores.length; i += 1) {
      // Scores non-increasing; unscored (null => -1) items always sort last
      expect(scores[i - 1]).toBeGreaterThanOrEqual(scores[i]);
    }
    expect(allScored.length).toBeLessThanOrEqual(scores.length);
  });

  it('POST /compare returns quality and fit per row and null fit when anonymous', async () => {
    const alex = await User.findOne({ email: 'alex.rivera@cascade.edu' });
    const hackfest = await EventEdition.findOne({ editionLabel: 'Annual 16th Collegiate Hackathon' });
    const drone = await EventEdition.findOne({ editionLabel: 'Fall 2026 Lab Intensive' });
    const editionIds = [hackfest._id, drone._id];

    const authedRes = await request(app)
      .post('/api/v1/compare')
      .set('Authorization', authHeader(alex))
      .send({ editionIds });

    expect(authedRes.status).toBe(200);
    expect(authedRes.body.data.comparison).toHaveLength(2);

    for (const row of authedRes.body.data.comparison) {
      expect(row.title).toBeTruthy();
      expect(row.hostCollege).toBeTruthy();
      expect(row.quality).toBeDefined();
      expect(row.quality.scoreVersion).toBeTruthy();
      expect(row.fit).toBeDefined();
      expect(row.fit).not.toHaveProperty('explanationCodes');
    }

    // Anonymous comparison: quality still computed, fit is explicitly null
    const anonRes = await request(app).post('/api/v1/compare').send({ editionIds });

    expect(anonRes.status).toBe(200);
    for (const row of anonRes.body.data.comparison) {
      expect(row.quality).toBeDefined();
      expect(row.fit).toBeNull();
    }
  });
});