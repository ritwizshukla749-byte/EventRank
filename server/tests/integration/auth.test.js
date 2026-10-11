import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { College, User } from '../../src/models/index.js';

describe('Auth API Integration Tests (/api/v1/auth)', () => {
  const app = createApp();
  let testCollege;

  beforeEach(async () => {
    testCollege = await College.create({
      name: 'St. Andrews Institute',
      slug: 'st-andrews',
      status: 'active',
      city: 'Kolkata',
    });
  });

  it('registers a new student with college association and sets auth cookie', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Sarah Connor',
        email: 'sarah@standrews.test',
        password: 'securepassword123',
        collegeId: testCollege._id.toString(),
        department: 'Cybernetics',
        academicYear: 2,
        interests: ['AI', 'Robotics'],
        skills: ['C++', 'Python'],
        preferredEventTypes: ['hackathon'],
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toBe('sarah@standrews.test');
    expect(res.body.data.user.passwordHash).toBeUndefined(); // Never return password hash!
    expect(res.body.data.user.collegeId.toString()).toBe(testCollege._id.toString());

    // Verify cookie set
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toMatch(/token=/);
  });

  it('rejects registration with duplicate email (409 Conflict)', async () => {
    // First registration
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'First User',
        email: 'duplicate@test.com',
        password: 'password123',
        collegeId: testCollege._id.toString(),
      });

    // Duplicate email
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Second User',
        email: 'duplicate@test.com',
        password: 'password123',
        collegeId: testCollege._id.toString(),
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_EMAIL');
  });

  it('rejects registration if the selected college is suspended', async () => {
    const suspendedCollege = await College.create({
      name: 'Suspended College',
      slug: 'suspended-col',
      status: 'suspended',
    });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test Student',
        email: 'student@suspended.test',
        password: 'password123',
        collegeId: suspendedCollege._id.toString(),
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('authenticates user on login and rejects invalid credentials', async () => {
    // Register user
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Login User',
        email: 'login@test.com',
        password: 'correctpassword',
        collegeId: testCollege._id.toString(),
      });

    // Wrong password
    const wrongRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'login@test.com',
        password: 'wrongpassword',
      });
    expect(wrongRes.status).toBe(401);
    expect(wrongRes.body.error.code).toBe('UNAUTHORIZED');

    // Correct password
    const successRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'login@test.com',
        password: 'correctpassword',
      });
    expect(successRes.status).toBe(200);
    expect(successRes.body.data.user.email).toBe('login@test.com');
    expect(successRes.body.data).toHaveProperty('token');
  });

  it('returns current authenticated profile on GET /auth/me', async () => {
    // Register
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Profile User',
        email: 'me@test.com',
        password: 'password123',
        collegeId: testCollege._id.toString(),
      });

    const token = regRes.body.data.token;

    // Test with Bearer Header
    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.email).toBe('me@test.com');
    expect(meRes.body.data.user.collegeId.name).toBe('St. Andrews Institute');

    // Test without token (401)
    const unauthRes = await request(app).get('/api/v1/auth/me');
    expect(unauthRes.status).toBe(401);
  });
});
