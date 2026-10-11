import { connectDB, disconnectDB } from '../config/db.js';
import {
  College,
  User,
  Organizer,
  Event,
  EventEdition,
  Registration,
  AttendanceVerification,
  Review,
} from '../models/index.js';

export async function seedDatabase({ silent = false } = {}) {
  const log = (...args) => {
    if (!silent) console.log(...args);
  };

  log('🌱 Starting idempotent multi-college database seeding...');

  // 1. Seed 3 Fictional Participating Colleges
  const collegesData = [
    {
      name: 'Apex Institute of Technology',
      slug: 'apex-tech',
      status: 'active',
      city: 'Bangalore',
      region: 'Karnataka',
      website: 'https://apex.test',
      allowedEmailDomains: ['apex.test', 'apex.edu'],
    },
    {
      name: 'Metro State University',
      slug: 'metro-state',
      status: 'active',
      city: 'Mumbai',
      region: 'Maharashtra',
      website: 'https://metro.test',
      allowedEmailDomains: ['metro.test', 'metro.edu'],
    },
    {
      name: 'Cascade Engineering College',
      slug: 'cascade-eng',
      status: 'active',
      city: 'Pune',
      region: 'Maharashtra',
      website: 'https://cascade.test',
      allowedEmailDomains: ['cascade.test', 'cascade.edu'],
    },
  ];

  const colleges = {};
  for (const item of collegesData) {
    const college = await College.findOneAndUpdate(
      { slug: item.slug },
      { $set: item },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    colleges[item.slug] = college;
  }
  log(`✓ Seeded ${Object.keys(colleges).length} participating colleges.`);

  // 2. Seed Users (Platform Admin, College Admins, Organizers, Students)
  const defaultPasswordHash = await User.hashPassword('password123');

  const usersData = [
    {
      name: 'Platform Administrator',
      email: 'platform.admin@eventrank.test',
      passwordHash: defaultPasswordHash,
      globalRole: 'platform_admin',
      collegeRole: 'student',
      status: 'active',
    },
    {
      name: 'Apex College Admin',
      email: 'admin@apex.test',
      passwordHash: defaultPasswordHash,
      globalRole: 'user',
      collegeRole: 'college_admin',
      collegeId: colleges['apex-tech']._id,
      department: 'Administration',
      status: 'active',
    },
    {
      name: 'Metro College Admin',
      email: 'admin@metro.test',
      passwordHash: defaultPasswordHash,
      globalRole: 'user',
      collegeRole: 'college_admin',
      collegeId: colleges['metro-state']._id,
      department: 'Administration',
      status: 'active',
    },
    {
      name: 'Apex Organizer Lead',
      email: 'organizer@apex.test',
      passwordHash: defaultPasswordHash,
      globalRole: 'user',
      collegeRole: 'organizer',
      collegeId: colleges['apex-tech']._id,
      department: 'Computer Science',
      status: 'active',
    },
    {
      name: 'Metro Organizer Lead',
      email: 'organizer@metro.test',
      passwordHash: defaultPasswordHash,
      globalRole: 'user',
      collegeRole: 'organizer',
      collegeId: colleges['metro-state']._id,
      department: 'Information Technology',
      status: 'active',
    },
    {
      name: 'Alex Rivera (Apex Student)',
      email: 'student.apex@eventrank.test',
      passwordHash: defaultPasswordHash,
      globalRole: 'user',
      collegeRole: 'student',
      collegeId: colleges['apex-tech']._id,
      department: 'Computer Science',
      academicYear: 3,
      interests: ['AI', 'Web Development', 'Hackathons', 'Cloud'],
      skills: ['JavaScript', 'React', 'Python', 'Node.js'],
      experienceLevel: 'intermediate',
      preferredEventTypes: ['hackathon', 'workshop'],
      budgetMax: 500,
      privacyPreferences: { showInPeerCounts: true },
      status: 'active',
    },
    {
      name: 'Samira Khan (Metro Student)',
      email: 'student.metro@eventrank.test',
      passwordHash: defaultPasswordHash,
      globalRole: 'user',
      collegeRole: 'student',
      collegeId: colleges['metro-state']._id,
      department: 'Data Science',
      academicYear: 2,
      interests: ['Machine Learning', 'Data Science', 'Python', 'Competitive Coding'],
      skills: ['Python', 'SQL', 'Data Analytics'],
      experienceLevel: 'beginner',
      preferredEventTypes: ['workshop', 'talk', 'competition'],
      budgetMax: 300,
      privacyPreferences: { showInPeerCounts: true },
      status: 'active',
    },
    {
      name: 'Rohan Sharma (Cascade Student)',
      email: 'student.cascade@eventrank.test',
      passwordHash: defaultPasswordHash,
      globalRole: 'user',
      collegeRole: 'student',
      collegeId: colleges['cascade-eng']._id,
      department: 'Electronics',
      academicYear: 4,
      interests: ['IoT', 'Robotics', 'Hardware', 'Hackathons'],
      skills: ['C++', 'Embedded Systems', 'IoT'],
      experienceLevel: 'advanced',
      preferredEventTypes: ['hackathon', 'competition'],
      budgetMax: 1000,
      privacyPreferences: { showInPeerCounts: true },
      status: 'active',
    },
  ];

  const users = {};
  for (const item of usersData) {
    const user = await User.findOneAndUpdate(
      { email: item.email },
      { $set: item },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    users[item.email] = user;
  }
  log(`✓ Seeded ${Object.keys(users).length} users across roles and colleges.`);

  // 3. Seed Organizers (Note: Similarly named "Coding Club" in two distinct colleges to test non-merging)
  const organizersData = [
    {
      name: 'Coding Club',
      type: 'club',
      description: 'Official developer community at Apex Institute of Technology.',
      collegeId: colleges['apex-tech']._id,
      authorizedUserIds: [users['organizer@apex.test']._id],
      status: 'approved',
    },
    {
      name: 'Coding Club', // Same name, different college!
      type: 'club',
      description: 'Student software and competitive programming guild at Metro State University.',
      collegeId: colleges['metro-state']._id,
      authorizedUserIds: [users['organizer@metro.test']._id],
      status: 'approved',
    },
    {
      name: 'Robotics Society',
      type: 'society',
      description: 'Autonomous systems and hardware innovation society at Cascade Engineering.',
      collegeId: colleges['cascade-eng']._id,
      authorizedUserIds: [users['student.cascade@eventrank.test']._id],
      status: 'approved',
    },
  ];

  const organizers = {};
  for (const item of organizersData) {
    const org = await Organizer.findOneAndUpdate(
      { collegeId: item.collegeId, name: item.name },
      { $set: item },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    organizers[`${item.name}_${item.collegeId}`] = org;
  }
  log(`✓ Seeded ${Object.keys(organizers).length} organizers with institution-scoped isolation.`);

  // 4. Seed Events (Series)
  const eventsData = [
    {
      title: 'Apex Inter-College Hackathon',
      description: '36-hour premier hackathon open to engineering students across all colleges.',
      organizerId: organizers[`Coding Club_${colleges['apex-tech']._id}`]._id,
      collegeId: colleges['apex-tech']._id,
      eventType: 'hackathon',
      tags: ['hackathon', 'ai', 'web3', 'inter-college'],
      prerequisites: ['Basic programming', 'Git knowledge'],
      expectedOutcomes: ['Working prototype', 'Mentorship access', 'Certificate'],
      createdBy: users['organizer@apex.test']._id,
      status: 'active',
    },
    {
      title: 'Apex Internal Web Development Bootcamp',
      description: 'Intensive React & Node.js hands-on weekend workshop exclusively for Apex students.',
      organizerId: organizers[`Coding Club_${colleges['apex-tech']._id}`]._id,
      collegeId: colleges['apex-tech']._id,
      eventType: 'workshop',
      tags: ['web-development', 'react', 'javascript', 'hands-on'],
      prerequisites: ['HTML and CSS fundamentals'],
      expectedOutcomes: ['Deploy full-stack web application'],
      createdBy: users['organizer@apex.test']._id,
      status: 'active',
    },
    {
      title: 'Metro Data Science Summit',
      description: 'Annual data science conference featuring industry keynotes and case studies.',
      organizerId: organizers[`Coding Club_${colleges['metro-state']._id}`]._id,
      collegeId: colleges['metro-state']._id,
      eventType: 'talk',
      tags: ['data-science', 'machine-learning', 'analytics'],
      prerequisites: ['Interest in data'],
      expectedOutcomes: ['Industry networking', 'Career guidance'],
      createdBy: users['organizer@metro.test']._id,
      status: 'active',
    },
  ];

  const events = {};
  for (const item of eventsData) {
    const ev = await Event.findOneAndUpdate(
      { collegeId: item.collegeId, title: item.title },
      { $set: item },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    events[item.title] = ev;
  }
  log(`✓ Seeded ${Object.keys(events).length} event series.`);

  // 5. Seed Event Editions
  // - Edition A: Upcoming, Open to All Colleges (Apex Inter-College Hackathon 2026)
  // - Edition B: Upcoming, Host College Only (Apex Internal Web Bootcamp 2026)
  // - Edition C: Completed, with verified reviews (Apex Inter-College Hackathon 2025)
  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const nextMonthEnd = new Date(nextMonth.getTime() + 2 * 24 * 60 * 60 * 1000);
  const lastYearStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const lastYearEnd = new Date(lastYearStart.getTime() + 2 * 24 * 60 * 60 * 1000);

  const editionsData = [
    {
      eventId: events['Apex Inter-College Hackathon']._id,
      collegeId: colleges['apex-tech']._id,
      editionLabel: '2026 Edition',
      eligibility: 'all_active_colleges', // Open to all participating colleges!
      startAt: nextMonth,
      endAt: nextMonthEnd,
      timezone: 'Asia/Kolkata',
      venue: 'Apex Innovation Campus, Bangalore',
      costAmount: 0,
      currency: 'INR',
      registrationMode: 'platform',
      capacity: 250,
      status: 'published',
    },
    {
      eventId: events['Apex Internal Web Development Bootcamp']._id,
      collegeId: colleges['apex-tech']._id,
      editionLabel: 'Spring 2026',
      eligibility: 'host_college_only', // Restricted to host college!
      startAt: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000),
      timezone: 'Asia/Kolkata',
      venue: 'Apex Computer Lab 3',
      costAmount: 150,
      currency: 'INR',
      registrationMode: 'platform',
      capacity: 60,
      status: 'published',
    },
    {
      eventId: events['Apex Inter-College Hackathon']._id,
      collegeId: colleges['apex-tech']._id,
      editionLabel: '2025 Edition',
      eligibility: 'all_active_colleges',
      startAt: lastYearStart,
      endAt: lastYearEnd,
      timezone: 'Asia/Kolkata',
      venue: 'Apex Auditorium',
      costAmount: 0,
      currency: 'INR',
      registrationMode: 'platform',
      capacity: 200,
      status: 'completed', // Completed edition for scoring history
    },
  ];

  const editions = {};
  for (const item of editionsData) {
    const ed = await EventEdition.findOneAndUpdate(
      { eventId: item.eventId, editionLabel: item.editionLabel },
      { $set: item },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    editions[`${item.eventId}_${item.editionLabel}`] = ed;
  }
  log(`✓ Seeded ${Object.keys(editions).length} event editions across eligibility policies.`);

  // 6. Seed Registrations
  // Register Apex, Metro, and Cascade students for the upcoming cross-college hackathon
  const hackathon2026 = editions[`${events['Apex Inter-College Hackathon']._id}_2026 Edition`];
  const hackathon2025 = editions[`${events['Apex Inter-College Hackathon']._id}_2025 Edition`];

  const registrationsData = [
    {
      eventEditionId: hackathon2026._id,
      userId: users['student.apex@eventrank.test']._id,
      collegeId: colleges['apex-tech']._id,
      status: 'registered',
      registeredAt: new Date(),
    },
    {
      eventEditionId: hackathon2026._id,
      userId: users['student.metro@eventrank.test']._id,
      collegeId: colleges['metro-state']._id,
      status: 'registered',
      registeredAt: new Date(),
    },
    {
      eventEditionId: hackathon2026._id,
      userId: users['student.cascade@eventrank.test']._id,
      collegeId: colleges['cascade-eng']._id,
      status: 'registered',
      registeredAt: new Date(),
    },
    // Past edition registration for student.apex
    {
      eventEditionId: hackathon2025._id,
      userId: users['student.apex@eventrank.test']._id,
      collegeId: colleges['apex-tech']._id,
      status: 'attended',
      registeredAt: lastYearStart,
    },
  ];

  for (const item of registrationsData) {
    await Registration.findOneAndUpdate(
      { eventEditionId: item.eventEditionId, userId: item.userId },
      { $set: item },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  log(`✓ Seeded ${registrationsData.length} registrations across participating colleges.`);

  // 7. Seed Attendance Verification (for hackathon 2025 attended student)
  const attendanceRecord = await AttendanceVerification.findOneAndUpdate(
    { eventEditionId: hackathon2025._id, userId: users['student.apex@eventrank.test']._id },
    {
      $set: {
        eventEditionId: hackathon2025._id,
        userId: users['student.apex@eventrank.test']._id,
        method: 'organizer_checkin',
        status: 'verified',
        verifiedBy: users['organizer@apex.test']._id,
        verifiedAt: lastYearStart,
        evidenceReference: 'CHK-2025-APEX-001',
        auditMetadata: { scanner: 'gate_1', timestamp: lastYearStart.toISOString() },
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  log('✓ Seeded attendance verification record.');

  // 8. Seed Verified Review (linked to verified attendance record)
  await Review.findOneAndUpdate(
    { eventEditionId: hackathon2025._id, userId: users['student.apex@eventrank.test']._id },
    {
      $set: {
        eventEditionId: hackathon2025._id,
        eventId: events['Apex Inter-College Hackathon']._id,
        userId: users['student.apex@eventrank.test']._id,
        attendanceVerificationId: attendanceRecord._id,
        dimensions: {
          organization: 5,
          contentValue: 4,
          networking: 5,
          timeCostValue: 5,
        },
        overallRating: 4.8,
        text: 'Incredible mentorship, seamless logistics, and intense competition. Worth every hour.',
        status: 'published',
        conflictFlags: [],
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  log('✓ Seeded verified attendee review.');

  log('✨ Multi-college database seeding completed idempotently!');
}

// Allow direct CLI execution: `node src/seeds/seed.js`
if (process.argv[1]?.endsWith('seed.js')) {
  try {
    await connectDB();
    await seedDatabase();
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('Fatal seed error:', err);
    process.exit(1);
  }
}
