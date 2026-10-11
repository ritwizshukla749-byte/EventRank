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

  // 1. Seed 3 Participating Colleges
  const collegesData = [
    {
      name: 'Cascade Polytechnic',
      slug: 'cascade-poly',
      status: 'active',
      city: 'Seattle',
      region: 'WA',
      website: 'https://cascade.edu',
      allowedEmailDomains: ['cascade.edu'],
    },
    {
      name: 'Northbridge University',
      slug: 'northbridge-univ',
      status: 'active',
      city: 'Bellevue',
      region: 'WA',
      website: 'https://northbridge.edu',
      allowedEmailDomains: ['northbridge.edu'],
    },
    {
      name: 'St. Jude College of Art & Design',
      slug: 'st-jude-art',
      status: 'active',
      city: 'Portland',
      region: 'OR',
      website: 'https://stjude.edu',
      allowedEmailDomains: ['stjude.edu'],
    },
    // Backwards-compatible legacy slugs
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

  // 2. Seed Users
  const usersData = [
    {
      name: 'Alex Rivera',
      email: 'alex.rivera@cascade.edu',
      password: 'Password123!',
      collegeId: colleges['cascade-poly']._id,
      role: 'student',
      profile: {
        academicYear: 2,
        department: 'Computer Science & AI',
        skills: ['Python', 'ROS2', 'PyTorch', 'React', 'Embedded C++'],
        interests: ['Robotics', 'Artificial Intelligence', 'Autonomous Systems', 'Hackathons'],
        experienceLevel: 'intermediate',
        budget: 50,
      },
    },
    {
      name: 'Cascade ACM Officer',
      email: 'acm@cascade.edu',
      password: 'Password123!',
      collegeId: colleges['cascade-poly']._id,
      role: 'organizer',
    },
    {
      name: 'Northbridge Venture Lead',
      email: 'venture@northbridge.edu',
      password: 'Password123!',
      collegeId: colleges['northbridge-univ']._id,
      role: 'organizer',
    },
    {
      name: 'St. Jude Design Guild Admin',
      email: 'design@stjude.edu',
      password: 'Password123!',
      collegeId: colleges['st-jude-art']._id,
      role: 'organizer',
    },
    {
      name: 'St. Jude College Admin',
      email: 'admin@stjude.edu',
      password: 'Password123!',
      collegeId: colleges['st-jude-art']._id,
      role: 'college_admin',
    },
    // Legacy test users
    {
      name: 'Student Apex',
      email: 'student.apex@eventrank.test',
      password: 'Password123!',
      collegeId: colleges['apex-tech']._id,
      role: 'student',
    },
    {
      name: 'Organizer Apex',
      email: 'organizer@apex.test',
      password: 'Password123!',
      collegeId: colleges['apex-tech']._id,
      role: 'organizer',
    },
    {
      name: 'Admin Apex',
      email: 'admin@apex.test',
      password: 'Password123!',
      collegeId: colleges['apex-tech']._id,
      role: 'college_admin',
    },
    {
      name: 'Student Metro',
      email: 'student.metro@eventrank.test',
      password: 'Password123!',
      collegeId: colleges['metro-state']._id,
      role: 'student',
    },
    {
      name: 'Organizer Metro',
      email: 'organizer@metro.test',
      password: 'Password123!',
      collegeId: colleges['metro-state']._id,
      role: 'organizer',
    },
    {
      name: 'Student Cascade',
      email: 'student.cascade@eventrank.test',
      password: 'Password123!',
      collegeId: colleges['cascade-eng']._id,
      role: 'student',
    },
    {
      name: 'Platform Admin',
      email: 'superadmin@eventrank.test',
      password: 'Password123!',
      role: 'platform_admin',
    },
  ];

  const users = {};
  for (const item of usersData) {
    const passwordHash = await User.hashPassword(item.password);
    const { password, role, ...dataToSave } = item;
    dataToSave.passwordHash = passwordHash;

    // Map the fixture "role" onto the real User schema fields (collegeRole/globalRole)
    if (role === 'platform_admin') {
      dataToSave.globalRole = 'platform_admin';
    } else {
      dataToSave.collegeRole = role || 'student';
    }

    const user = await User.findOneAndUpdate(
      { email: item.email },
      { $set: dataToSave },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    users[item.email] = user;
  }
  log(`✓ Seeded ${Object.keys(users).length} users across roles and colleges.`);

  // 3. Seed Organizers
  const organizersData = [
    {
      name: 'Cascade ACM Chapter',
      type: 'club',
      description: 'Official collegiate ACM chapter at Cascade Polytechnic.',
      collegeId: colleges['cascade-poly']._id,
      authorizedUserIds: [users['acm@cascade.edu']._id],
      status: 'approved',
    },
    {
      name: 'Robotics & Embedded Systems Lab',
      type: 'lab',
      description: 'Autonomous robotics and micro-aerial vehicle research community.',
      collegeId: colleges['cascade-poly']._id,
      authorizedUserIds: [users['acm@cascade.edu']._id],
      status: 'approved',
    },
    {
      name: 'Northbridge Venture Collective',
      type: 'guild',
      description: 'Inter-campus student venture and founder ecosystem.',
      collegeId: colleges['northbridge-univ']._id,
      authorizedUserIds: [users['venture@northbridge.edu']._id],
      status: 'approved',
    },
    {
      name: 'St. Jude Interactive Design Guild',
      type: 'guild',
      description: 'Human-computer interaction and generative design studio.',
      collegeId: colleges['st-jude-art']._id,
      authorizedUserIds: [users['design@stjude.edu']._id],
      status: 'approved',
    },
    {
      name: 'Inter-Collegiate Indie Game Collective',
      type: 'collective',
      description: 'Multi-campus game jam and experimental engine group.',
      collegeId: colleges['cascade-poly']._id,
      authorizedUserIds: [users['acm@cascade.edu']._id],
      status: 'approved',
    },
    // Legacy organizers
    {
      name: 'Coding Club',
      type: 'club',
      description: 'Official developer community at Apex Institute of Technology.',
      collegeId: colleges['apex-tech']._id,
      authorizedUserIds: [users['organizer@apex.test']._id],
      status: 'approved',
    },
    {
      name: 'Coding Club',
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

  // 4. Seed Rich Event Series matching UI design
  const eventsData = [
    {
      title: 'Cascade HackFest 2026',
      description: 'The Pacific Northwest’s flagship 36-hour collegiate hackathon bringing together 400+ developers, designers, and student founders.',
      organizerId: organizers[`Cascade ACM Chapter_${colleges['cascade-poly']._id}`]._id,
      collegeId: colleges['cascade-poly']._id,
      eventType: 'hackathon',
      tags: ['hackathon', 'ai', 'cloud', 'startups', 'free-food'],
      prerequisites: ['Open to all majors'],
      expectedOutcomes: ['Ship working MVP', '$250 AWS Cloud Credits', 'Network with Tier-1 recruiters'],
      createdBy: users['acm@cascade.edu']._id,
      status: 'active',
    },
    {
      title: 'Autonomous Drone Systems & ROS2 Hands-On',
      description: 'Hands-on hardware lab building flight controllers and state estimators using Robot Operating System (ROS2) on quadrotor hardware.',
      organizerId: organizers[`Robotics & Embedded Systems Lab_${colleges['cascade-poly']._id}`]._id,
      collegeId: colleges['cascade-poly']._id,
      eventType: 'workshop',
      tags: ['robotics', 'ros2', 'embedded', 'hardware', 'cert-provided'],
      prerequisites: ['C++ or Python basics'],
      expectedOutcomes: ['Hardware Flight Kit Provided', 'Lab Bench Certificate'],
      createdBy: users['acm@cascade.edu']._id,
      status: 'active',
    },
    {
      title: 'Decentralized Autonomous Computing Symposium',
      description: 'A deep-dive technical symposium exploring consensus algorithms, zero-knowledge proofs, and decentralized compute nodes.',
      organizerId: organizers[`Cascade ACM Chapter_${colleges['cascade-poly']._id}`]._id,
      collegeId: colleges['cascade-poly']._id,
      eventType: 'conference',
      tags: ['systems', 'cryptography', 'distributed-systems', 'free-food'],
      prerequisites: ['Data Structures'],
      expectedOutcomes: ['Free Lunch Buffet', 'Preprint Research Bound Copies'],
      createdBy: users['acm@cascade.edu']._id,
      status: 'active',
    },
    {
      title: 'Generative AI Workflows for Product Designers',
      description: 'A completed intensive examining prompt workflows, latent diffusion for rapid moodboards, and ethical provenance for UI/UX teams.',
      organizerId: organizers[`St. Jude Interactive Design Guild_${colleges['st-jude-art']._id}`]._id,
      collegeId: colleges['st-jude-art']._id,
      eventType: 'workshop',
      tags: ['ui-ux', 'design', 'generative-ai', 'figma'],
      prerequisites: ['Figma familiarity'],
      expectedOutcomes: ['Diffusion Studio Credits', 'Design Token Starter Pack'],
      createdBy: users['design@stjude.edu']._id,
      status: 'active',
    },
    {
      title: 'Zero-G: Experimental 48-Hour Mechanic Jam',
      description: 'Build an original single-button or non-traditional gameplay prototype in 48 hours. Hosted by the newly founded inter-campus collective.',
      organizerId: organizers[`Inter-Collegiate Indie Game Collective_${colleges['cascade-poly']._id}`]._id,
      collegeId: colleges['cascade-poly']._id,
      eventType: 'hackathon',
      tags: ['game-dev', 'indie-games', 'unity', 'godot'],
      prerequisites: ['Any game engine'],
      expectedOutcomes: ['Steam Key Giveaways', 'Energy Drinks & Snacks Provided'],
      createdBy: users['acm@cascade.edu']._id,
      status: 'active',
    },
    {
      title: 'Venture Catalyst: Collegiate Pitch Showcase',
      description: 'Selected collegiate founders from Cascade Poly, Northbridge, and St. Jude pitch pre-seed ventures before a panel of 12 regional venture partners.',
      organizerId: organizers[`Northbridge Venture Collective_${colleges['northbridge-univ']._id}`]._id,
      collegeId: colleges['northbridge-univ']._id,
      eventType: 'conference',
      tags: ['venture', 'startups', 'pitching', 'networking'],
      prerequisites: ['Pitch deck or prototype'],
      expectedOutcomes: ['Catered 3-Course Dinner', 'VC Contact Directory'],
      createdBy: users['venture@northbridge.edu']._id,
      status: 'active',
    },
    // Legacy Events
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

  // 5. Seed Event Editions (Active & Published)
  const now = new Date();
  const d1 = new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000);
  const d2 = new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000);
  const d3 = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000);
  const d4 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Past, reviewed
  const d5 = new Date(now.getTime() + 32 * 24 * 60 * 60 * 1000);
  const d6 = new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000);

  const editionsData = [
    {
      eventId: events['Cascade HackFest 2026']._id,
      collegeId: colleges['cascade-poly']._id,
      editionLabel: 'Annual 16th Collegiate Hackathon',
      eligibility: 'all_active_colleges',
      startAt: d1,
      endAt: new Date(d1.getTime() + 36 * 60 * 60 * 1000),
      timezone: 'America/Los_Angeles',
      venue: 'Cascade Innovation Pavilion & Engineering Center',
      costAmount: 0,
      currency: 'USD',
      registrationMode: 'platform',
      capacity: 450,
      status: 'published',
      perks: ['Free Pizza & Boba 🧋', '$250 AWS Cloud Credits'],
      imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    },
    {
      eventId: events['Autonomous Drone Systems & ROS2 Hands-On']._id,
      collegeId: colleges['cascade-poly']._id,
      editionLabel: 'Fall 2026 Lab Intensive',
      eligibility: 'all_active_colleges',
      startAt: d2,
      endAt: new Date(d2.getTime() + 4 * 60 * 60 * 1000),
      timezone: 'America/Los_Angeles',
      venue: 'Robotics Mechatronics Lab, Room 302',
      costAmount: 15,
      currency: 'USD',
      registrationMode: 'platform',
      capacity: 35,
      status: 'published',
      perks: ['Hardware Flight Kits Provided', 'Lab Bench Certificate'],
      imageUrl: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80',
    },
    {
      eventId: events['Decentralized Autonomous Computing Symposium']._id,
      collegeId: colleges['cascade-poly']._id,
      editionLabel: 'Inaugural Colloquium',
      eligibility: 'all_active_colleges',
      startAt: d3,
      endAt: new Date(d3.getTime() + 8 * 60 * 60 * 1000),
      timezone: 'America/Los_Angeles',
      venue: 'Cascade Sciences Amphitheater B',
      costAmount: 0,
      currency: 'USD',
      registrationMode: 'platform',
      capacity: 180,
      status: 'published',
      perks: ['Free Lunch Buffet', 'Preprint Research Bound Copies'],
      imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    },
    {
      eventId: events['Generative AI Workflows for Product Designers']._id,
      collegeId: colleges['st-jude-art']._id,
      editionLabel: 'Spring 2026 Retrospective',
      eligibility: 'all_active_colleges',
      startAt: d4,
      endAt: new Date(d4.getTime() + 5 * 60 * 60 * 1000),
      timezone: 'America/Los_Angeles',
      venue: 'St. Jude Virtual Auditorium & Studio 4',
      costAmount: 15,
      currency: 'USD',
      registrationMode: 'platform',
      capacity: 100,
      status: 'completed',
      perks: ['Diffusion Studio Credits', 'Design Token Starter Pack'],
      imageUrl: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&q=80',
    },
    {
      eventId: events['Zero-G: Experimental 48-Hour Mechanic Jam']._id,
      collegeId: colleges['cascade-poly']._id,
      editionLabel: 'Jam Edition 01',
      eligibility: 'all_active_colleges',
      startAt: d5,
      endAt: new Date(d5.getTime() + 48 * 60 * 60 * 1000),
      timezone: 'America/Los_Angeles',
      venue: 'Cascade Student Center Commons',
      costAmount: 0,
      currency: 'USD',
      registrationMode: 'platform',
      capacity: 120,
      status: 'published',
      perks: ['Steam Key Giveaways', 'Energy Drinks & Snacks ⚡'],
      imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    },
    {
      eventId: events['Venture Catalyst: Collegiate Pitch Showcase']._id,
      collegeId: colleges['northbridge-univ']._id,
      editionLabel: '2026 Inter-Campus Demo Day',
      eligibility: 'all_active_colleges',
      startAt: d6,
      endAt: new Date(d6.getTime() + 6 * 60 * 60 * 1000),
      timezone: 'America/Los_Angeles',
      venue: 'Northbridge School of Management Auditorium',
      costAmount: 25,
      currency: 'USD',
      registrationMode: 'platform',
      capacity: 200,
      status: 'published',
      perks: ['Catered 3-Course Dinner 🍷', 'VC Contact Directory'],
      imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
    },
    // Legacy editions
    {
      eventId: events['Apex Inter-College Hackathon']._id,
      collegeId: colleges['apex-tech']._id,
      editionLabel: '2026 Edition',
      eligibility: 'all_active_colleges',
      startAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 32 * 24 * 60 * 60 * 1000),
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
      eligibility: 'host_college_only',
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
  log(`✓ Seeded ${Object.keys(editions).length} event editions.`);

  // 6. Seed Registrations for Cascade HackFest & Other Editions
  const hackfest = editions[`${events['Cascade HackFest 2026']._id}_Annual 16th Collegiate Hackathon`];
  const droneWorkshop = editions[`${events['Autonomous Drone Systems & ROS2 Hands-On']._id}_Fall 2026 Lab Intensive`];
  const designGenAI = editions[`${events['Generative AI Workflows for Product Designers']._id}_Spring 2026 Retrospective`];

  const registrationsData = [
    {
      eventEditionId: hackfest._id,
      userId: users['alex.rivera@cascade.edu']._id,
      collegeId: colleges['cascade-poly']._id,
      status: 'registered',
      registeredAt: new Date(),
    },
    {
      eventEditionId: droneWorkshop._id,
      userId: users['alex.rivera@cascade.edu']._id,
      collegeId: colleges['cascade-poly']._id,
      status: 'registered',
      registeredAt: new Date(),
    },
    {
      eventEditionId: designGenAI._id,
      userId: users['alex.rivera@cascade.edu']._id,
      collegeId: colleges['cascade-poly']._id,
      status: 'attended',
      registeredAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const item of registrationsData) {
    await Registration.findOneAndUpdate(
      { eventEditionId: item.eventEditionId, userId: item.userId },
      { $set: item },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  // 7. Seed Attendance Verification & Verified Review for past edition
  const pastVerification = await AttendanceVerification.findOneAndUpdate(
    { eventEditionId: designGenAI._id, userId: users['alex.rivera@cascade.edu']._id },
    {
      $set: {
        method: 'organizer_checkin',
        status: 'verified',
        verifiedAt: new Date(),
        verifiedBy: users['design@stjude.edu']._id,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Review.findOneAndUpdate(
    { eventEditionId: designGenAI._id, userId: users['alex.rivera@cascade.edu']._id },
    {
      $set: {
        eventId: events['Generative AI Workflows for Product Designers']._id,
        attendanceVerificationId: pastVerification._id,
        dimensions: {
          organization: 5,
          contentValue: 5,
          networking: 4,
          timeCostValue: 5,
        },
        overallRating: 4.8,
        text: 'Brilliant hands-on workflow. The prompt latent diffusion techniques were directly applicable to our design tokens.',
        status: 'published',
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  log('✨ Multi-college database seeding completed idempotently!');
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    }
  })();
}
