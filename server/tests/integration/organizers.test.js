import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { seedDatabase } from '../../src/seeds/seed.js';
import { Organizer, User, College } from '../../src/models/index.js';
import { signToken } from '../../src/utils/token.js';

describe('Organizer API & Institution-Scoped History Integration Tests (/api/v1/organizers)', () => {
  const app = createApp();

  beforeEach(async () => {
    await seedDatabase({ silent: true });
  });

  it('lists approved organizers and supports college filtering', async () => {
    const res = await request(app).get('/api/v1/organizers');

    expect(res.status).toBe(200);
    expect(res.body.data.organizers.length).toBeGreaterThanOrEqual(3);

    // Filter by Apex College
    const apex = await College.findOne({ slug: 'apex-tech' });
    const filteredRes = await request(app).get(`/api/v1/organizers?collegeId=${apex._id}`);

    expect(filteredRes.status).toBe(200);
    expect(filteredRes.body.data.organizers.length).toBe(1);
    expect(filteredRes.body.data.organizers[0].name).toBe('Coding Club');
    expect(filteredRes.body.data.organizers[0].collegeId._id.toString()).toBe(apex._id.toString());
  });

  it('ensures similarly named organizers at different colleges have strictly isolated histories', async () => {
    // Both Apex and Metro have an organizer named "Coding Club"
    const apexOrg = await Organizer.findOne({ name: 'Coding Club' }).populate('collegeId');
    const metroOrg = await Organizer.findOne({
      name: 'Coding Club',
      _id: { $ne: apexOrg._id },
    }).populate('collegeId');

    expect(apexOrg.collegeId.slug).toBe('apex-tech');
    expect(metroOrg.collegeId.slug).toBe('metro-state');

    // Query Apex organizer profile
    const apexRes = await request(app).get(`/api/v1/organizers/${apexOrg._id}`);
    expect(apexRes.status).toBe(200);
    const apexData = apexRes.body.data.organizer;

    // Apex Coding Club has Hackathon 2026 (published) and Bootcamp (published); no completed editions yet
    expect(apexData.metrics.completedEditionsCount).toBe(0);
    expect(apexData.metrics.totalEventsCreated).toBe(2);

    // Query Metro organizer profile
    const metroRes = await request(app).get(`/api/v1/organizers/${metroOrg._id}`);
    expect(metroRes.status).toBe(200);
    const metroData = metroRes.body.data.organizer;

    // Metro Coding Club has only Metro Data Science Summit (0 completed editions)
    expect(metroData.metrics.completedEditionsCount).toBe(0);
    expect(metroData.metrics.totalEventsCreated).toBe(1);

    // Verify events from Apex do NOT leak into Metro's profile
    const metroEventTitles = metroData.events.map((e) => e.title);
    expect(metroEventTitles).not.toContain('Apex Inter-College Hackathon');
    expect(metroEventTitles).toContain('Metro Data Science Summit');
  });

  it('allows authorized users to update organizer description and blocks unauthorized users', async () => {
    const organizerUser = await User.findOne({ email: 'organizer@apex.test' });
    const studentUser = await User.findOne({ email: 'student.apex@eventrank.test' });
    const apexOrg = await Organizer.findOne({ name: 'Coding Club', collegeId: organizerUser.collegeId });

    const authHeader = `Bearer ${signToken({
      id: organizerUser._id,
      collegeId: organizerUser.collegeId,
      collegeRole: 'organizer',
    })}`;

    const studentHeader = `Bearer ${signToken({
      id: studentUser._id,
      collegeId: studentUser.collegeId,
      collegeRole: 'student',
    })}`;

    // Authorized update
    const updateRes = await request(app)
      .patch(`/api/v1/organizers/${apexOrg._id}`)
      .set('Authorization', authHeader)
      .send({ description: 'Updated community description for Apex coders.' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.organizer.description).toBe('Updated community description for Apex coders.');

    // Unauthorized update (student) -> 403 Forbidden
    const unauthRes = await request(app)
      .patch(`/api/v1/organizers/${apexOrg._id}`)
      .set('Authorization', studentHeader)
      .send({ description: 'Hacked description' });

    expect(unauthRes.status).toBe(403);
    expect(unauthRes.body.error.code).toBe('FORBIDDEN');
  });
});
