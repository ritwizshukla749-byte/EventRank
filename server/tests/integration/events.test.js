import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { seedDatabase } from '../../src/seeds/seed.js';
import { College, Event, EventEdition, User } from '../../src/models/index.js';
import { signToken } from '../../src/utils/token.js';

describe('Event Discovery & Details API Integration Tests (/api/v1/events)', () => {
  const app = createApp();

  beforeEach(async () => {
    await seedDatabase({ silent: true });
  });

  it('discovers published events across multiple participating colleges by default', async () => {
    const res = await request(app).get('/api/v1/events');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');

    const { events } = res.body.data;
    expect(events.length).toBeGreaterThanOrEqual(2);

    // Verify host college is populated and events originate from different institutions
    const collegesRepresented = new Set(events.map((e) => e.hostCollege.slug));
    expect(collegesRepresented.size).toBeGreaterThanOrEqual(1);
    expect(events[0]).toHaveProperty('registrationCount');
    expect(events[0].hostCollege).toHaveProperty('name');
  });

  it('filters published events by host college', async () => {
    const apex = await College.findOne({ slug: 'apex-tech' });
    expect(apex).toBeDefined();

    const res = await request(app).get(`/api/v1/events?collegeId=${apex._id}`);

    expect(res.status).toBe(200);
    const { events } = res.body.data;
    expect(events.length).toBeGreaterThan(0);
    for (const ev of events) {
      expect(ev.hostCollege._id.toString()).toBe(apex._id.toString());
    }
  });

  it('filters published events by keyword search and event type', async () => {
    const res = await request(app).get('/api/v1/events?q=bootcamp&type=workshop');

    expect(res.status).toBe(200);
    const { events } = res.body.data;
    expect(events.length).toBe(1);
    expect(events[0].event.title).toMatch(/Bootcamp/i);
    expect(events[0].event.eventType).toBe('workshop');
  });

  it('paginates results and returns metadata', async () => {
    const res = await request(app).get('/api/v1/events?page=1&limit=1');

    expect(res.status).toBe(200);
    expect(res.body.data.events.length).toBe(1);
    expect(res.body.meta).toMatchObject({
      page: 1,
      limit: 1,
    });
    expect(res.body.meta.total).toBeGreaterThanOrEqual(2);
  });

  it('returns edition details with host college, organizer, and registration count', async () => {
    const openEdition = await EventEdition.findOne({ eligibility: 'all_active_colleges' });
    expect(openEdition).toBeDefined();

    const res = await request(app).get(`/api/v1/events/${openEdition._id}`);

    expect(res.status).toBe(200);
    const { edition } = res.body.data;
    expect(edition._id.toString()).toBe(openEdition._id.toString());
    expect(edition.hostCollege).toHaveProperty('name');
    expect(edition.event).toHaveProperty('title');
    expect(edition.registrationCount).toBeGreaterThanOrEqual(1);
    expect(edition.isRegistered).toBe(false); // Unauthenticated call
  });

  it('allows authorized organizers to create an event and scheduled edition', async () => {
    const organizerUser = await User.findOne({ email: 'organizer@apex.test' });
    const token = signToken({
      id: organizerUser._id,
      collegeId: organizerUser.collegeId,
      collegeRole: 'organizer',
    });

    const organizerDoc = await User.findOne({ email: 'organizer@apex.test' });

    // Fetch apex organizer
    const apexOrg = await Event.findOne({ createdBy: organizerUser._id });

    const newEventData = {
      title: 'Apex Cloud Architecture Seminar',
      description: 'Comprehensive seminar on cloud microservices and event-driven design.',
      organizerId: apexOrg.organizerId.toString(),
      eventType: 'talk',
      tags: ['cloud', 'aws', 'microservices'],
      prerequisites: ['Basic networking'],
      expectedOutcomes: ['Cloud architecture certificate'],
      editionLabel: 'Autumn 2026',
      eligibility: 'all_active_colleges',
      startAt: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
      endAt: new Date(Date.now() + 41 * 24 * 60 * 60 * 1000).toISOString(),
      venue: 'Seminar Hall 2',
      costAmount: 0,
      currency: 'INR',
    };

    const res = await request(app)
      .post('/api/v1/events')
      .set('Authorization', `Bearer ${token}`)
      .send(newEventData);

    expect(res.status).toBe(201);
    expect(res.body.data.event.title).toBe('Apex Cloud Architecture Seminar');
    expect(res.body.data.edition.editionLabel).toBe('Autumn 2026');
  });

  it('compares up to 3 events and rejects comparisons of more than 3 events (400)', async () => {
    const editions = await EventEdition.find().limit(3);
    const editionIds = editions.map((e) => e._id.toString());

    // Valid comparison (2-3 events)
    const validRes = await request(app)
      .post('/api/v1/compare')
      .send({ editionIds: editionIds.slice(0, 2) });

    expect(validRes.status).toBe(200);
    expect(validRes.body.data.comparison.length).toBe(2);
    expect(validRes.body.data.comparison[0]).toHaveProperty('hostCollege');
    expect(validRes.body.data.comparison[0]).toHaveProperty('cost');

    // Invalid comparison: 4 events should fail validation
    const invalidRes = await request(app)
      .post('/api/v1/compare')
      .send({
        editionIds: [
          ...editionIds,
          '6acb80da493e3f6582380499', // Dummy 4th ID
        ],
      });

    expect(invalidRes.status).toBe(400);
    expect(invalidRes.body.error.code).toBe('VALIDATION_ERROR');
  });
});
