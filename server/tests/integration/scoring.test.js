import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { seedDatabase } from '../../src/seeds/seed.js';
import { EventEdition, User } from '../../src/models/index.js';
import { signToken } from '../../src/utils/token.js';

describe('Scoring API Endpoints & Invariants (/api/v1/scoring)', () => {
  const app = createApp();

  beforeEach(async () => {
    await seedDatabase({ silent: true });
  });

  it('returns distinct Event Quality, Fit for You, and Pre-event signals', async () => {
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
      .get(`/api/v1/scoring/events/${hackathonEdition._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const { data } = res.body;

    // INVARIANT 1: Event Quality is present with status and explanations
    expect(data).toHaveProperty('eventQuality');
    expect(data.eventQuality).toHaveProperty('status');
    expect(['provisional', 'review_supported', 'insufficient_evidence']).toContain(
      data.eventQuality.status
    );
    expect(data.eventQuality.explanationCodes.length).toBeGreaterThan(0);

    // INVARIANT 2: Fit for You is returned as a separate, personalized score
    expect(data).toHaveProperty('fitForYou');
    expect(data.fitForYou).toHaveProperty('score');
    expect(data.fitForYou.score).toBeGreaterThanOrEqual(0);
    expect(data.fitForYou.score).toBeLessThanOrEqual(100);
    expect(data.fitForYou.reasonCodes.length).toBeGreaterThan(0);

    // INVARIANT 3: Pre-event signals are explicitly separated
    expect(data).toHaveProperty('preEventSignals');
    expect(data.preEventSignals).toHaveProperty('totalRegistrations');
    expect(data.preEventSignals).toHaveProperty('peersGoing');
  });

  it('returns null Fit for You when caller is unauthenticated while keeping Event Quality intact', async () => {
    const hackathonEdition = await EventEdition.findOne({
      editionLabel: '2026 Edition',
      eligibility: 'all_active_colleges',
    });

    const res = await request(app).get(`/api/v1/scoring/events/${hackathonEdition._id}`);

    expect(res.status).toBe(200);
    const { data } = res.body;

    // Quality score is computed from community/historical evidence
    expect(data.eventQuality).toBeDefined();
    expect(data.eventQuality.status).toBeDefined();

    // Fit for You is null because unauthenticated caller has no student profile
    expect(data.fitForYou).toBeNull();
  });
});
