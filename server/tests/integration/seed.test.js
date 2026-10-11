import { describe, it, expect } from 'vitest';
import { seedDatabase } from '../../src/seeds/seed.js';
import {
  College,
  User,
  Organizer,
  Event,
  EventEdition,
  Registration,
  AttendanceVerification,
  Review,
} from '../../src/models/index.js';

describe('Seed Script Idempotency & Fixture Integrity Tests', () => {
  it('runs seedDatabase idempotently without creating duplicate records', async () => {
    // First seed execution
    await seedDatabase({ silent: true });

    const collegeCount1 = await College.countDocuments();
    const userCount1 = await User.countDocuments();
    const orgCount1 = await Organizer.countDocuments();
    const eventCount1 = await Event.countDocuments();
    const editionCount1 = await EventEdition.countDocuments();
    const regCount1 = await Registration.countDocuments();
    const reviewCount1 = await Review.countDocuments();

    expect(collegeCount1).toBe(3); // 3 colleges
    expect(userCount1).toBe(8);    // 8 users across roles
    expect(orgCount1).toBe(3);     // 3 organizers
    expect(eventCount1).toBe(3);   // 3 event series
    expect(editionCount1).toBe(3); // 3 editions
    expect(regCount1).toBe(4);     // 4 registrations
    expect(reviewCount1).toBe(1);  // 1 verified review

    // Second seed execution - must be idempotent!
    await seedDatabase({ silent: true });

    const collegeCount2 = await College.countDocuments();
    const userCount2 = await User.countDocuments();
    const orgCount2 = await Organizer.countDocuments();
    const eventCount2 = await Event.countDocuments();
    const editionCount2 = await EventEdition.countDocuments();
    const regCount2 = await Registration.countDocuments();
    const reviewCount2 = await Review.countDocuments();

    expect(collegeCount2).toBe(collegeCount1);
    expect(userCount2).toBe(userCount1);
    expect(orgCount2).toBe(orgCount1);
    expect(eventCount2).toBe(eventCount1);
    expect(editionCount2).toBe(editionCount1);
    expect(regCount2).toBe(regCount1);
    expect(reviewCount2).toBe(reviewCount1);
  });

  it('proves similarly named organizers in different colleges remain distinct entities', async () => {
    await seedDatabase({ silent: true });

    const apexOrg = await Organizer.findOne({ name: 'Coding Club' }).populate('collegeId');
    const metroOrg = await Organizer.findOne({
      name: 'Coding Club',
      _id: { $ne: apexOrg._id },
    }).populate('collegeId');

    expect(apexOrg).toBeDefined();
    expect(metroOrg).toBeDefined();
    expect(apexOrg.collegeId.slug).toBe('apex-tech');
    expect(metroOrg.collegeId.slug).toBe('metro-state');
    expect(apexOrg._id.toString()).not.toBe(metroOrg._id.toString());
  });

  it('proves cross-college eligibility vs host-restricted event editions exist in fixtures', async () => {
    await seedDatabase({ silent: true });

    const openEdition = await EventEdition.findOne({ eligibility: 'all_active_colleges' });
    const restrictedEdition = await EventEdition.findOne({ eligibility: 'host_college_only' });

    expect(openEdition).toBeDefined();
    expect(restrictedEdition).toBeDefined();
    expect(openEdition.status).toBe('published');
    expect(restrictedEdition.status).toBe('published');
  });
});
