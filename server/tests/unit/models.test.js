import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
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

describe('Phase 1 Domain Models & Constraint Validation', () => {
  it('enforces required fields on College and uniqueness on slug', async () => {
    await College.init(); // Ensure indexes are built in MongoDB

    const college = await College.create({
      name: 'Test University',
      slug: 'test-uni',
      city: 'Delhi',
    });

    expect(college._id).toBeDefined();
    expect(college.status).toBe('active');

    // Duplicate slug should be rejected
    await expect(
      College.create({
        name: 'Another University',
        slug: 'test-uni',
      })
    ).rejects.toThrow();
  });

  it('enforces required college association for students, and hashes passwords', async () => {
    const college = await College.create({
      name: 'Engineering College',
      slug: 'eng-col',
    });

    const passwordHash = await User.hashPassword('mypassword123');
    const user = await User.create({
      name: 'John Doe',
      email: 'john@eng.test',
      passwordHash,
      collegeId: college._id,
      collegeRole: 'student',
    });

    expect(user._id).toBeDefined();
    expect(user.passwordHash).not.toBe('mypassword123');
    expect(await user.comparePassword('mypassword123')).toBe(true);
    expect(await user.comparePassword('wrongpassword')).toBe(false);

    // Student without collegeId should fail validation
    await expect(
      User.create({
        name: 'No College Student',
        email: 'nocollege@test.com',
        passwordHash,
        globalRole: 'user',
        collegeRole: 'student',
      })
    ).rejects.toThrow();
  });

  it('allows similarly named organizers in different colleges, but prevents duplicates within the same college', async () => {
    const collegeA = await College.create({ name: 'College A', slug: 'col-a' });
    const collegeB = await College.create({ name: 'College B', slug: 'col-b' });

    // Same organizer name "Coding Club" in College A and College B
    const orgA = await Organizer.create({
      name: 'Coding Club',
      collegeId: collegeA._id,
    });
    const orgB = await Organizer.create({
      name: 'Coding Club',
      collegeId: collegeB._id,
    });

    expect(orgA._id).toBeDefined();
    expect(orgB._id).toBeDefined();
    expect(orgA._id.toString()).not.toBe(orgB._id.toString());

    // Duplicate in same college should fail
    await expect(
      Organizer.create({
        name: 'Coding Club',
        collegeId: collegeA._id,
      })
    ).rejects.toThrow();
  });

  it('enforces compound uniqueness on Registration to prevent duplicate sign-ups', async () => {
    const college = await College.create({ name: 'Tech College', slug: 'tech-col' });
    const user = await User.create({
      name: 'Alice',
      email: 'alice@tech.test',
      passwordHash: 'hash',
      collegeId: college._id,
    });
    const org = await Organizer.create({ name: 'ACM', collegeId: college._id });
    const event = await Event.create({
      title: 'Hackathon',
      description: 'Desc',
      organizerId: org._id,
      collegeId: college._id,
      eventType: 'hackathon',
      createdBy: user._id,
    });
    const edition = await EventEdition.create({
      eventId: event._id,
      collegeId: college._id,
      editionLabel: '2026',
      startAt: new Date(Date.now() + 10000),
      endAt: new Date(Date.now() + 20000),
      venue: 'Main Hall',
    });

    // First registration
    const reg1 = await Registration.create({
      eventEditionId: edition._id,
      userId: user._id,
      collegeId: college._id,
    });
    expect(reg1._id).toBeDefined();

    // Duplicate registration for same edition and user
    await expect(
      Registration.create({
        eventEditionId: edition._id,
        userId: user._id,
        collegeId: college._id,
      })
    ).rejects.toThrow();
  });

  it('calculates Review overallRating from dimensions and enforces one review per user/edition', async () => {
    const college = await College.create({ name: 'Design College', slug: 'des-col' });
    const user = await User.create({
      name: 'Bob',
      email: 'bob@des.test',
      passwordHash: 'hash',
      collegeId: college._id,
    });
    const org = await Organizer.create({ name: 'Design Society', collegeId: college._id });
    const event = await Event.create({
      title: 'Design Workshop',
      description: 'Desc',
      organizerId: org._id,
      collegeId: college._id,
      eventType: 'workshop',
      createdBy: user._id,
    });
    const edition = await EventEdition.create({
      eventId: event._id,
      collegeId: college._id,
      editionLabel: '2025',
      startAt: new Date(Date.now() - 20000),
      endAt: new Date(Date.now() - 10000),
      venue: 'Studio A',
      status: 'completed',
    });

    const verification = await AttendanceVerification.create({
      eventEditionId: edition._id,
      userId: user._id,
      method: 'organizer_checkin',
      verifiedBy: user._id,
    });

    const review = await Review.create({
      eventEditionId: edition._id,
      eventId: event._id,
      userId: user._id,
      attendanceVerificationId: verification._id,
      dimensions: {
        organization: 5,
        contentValue: 4,
        networking: 4,
        timeCostValue: 5,
      },
      text: 'Great session!',
    });

    expect(review.overallRating).toBe(4.5); // (5+4+4+5)/4 = 4.5

    // Prevent duplicate review by same user for same edition
    await expect(
      Review.create({
        eventEditionId: edition._id,
        eventId: event._id,
        userId: user._id,
        attendanceVerificationId: verification._id,
        dimensions: {
          organization: 3,
          contentValue: 3,
          networking: 3,
          timeCostValue: 3,
        },
      })
    ).rejects.toThrow();
  });
});
