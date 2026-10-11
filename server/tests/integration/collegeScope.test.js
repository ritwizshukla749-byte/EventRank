import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import { College, User } from '../../src/models/index.js';
import {
  authenticate,
  requireCollegeRole,
  requireCollegeScope,
  requireGlobalRole,
} from '../../src/middleware/auth.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';
import { signToken } from '../../src/utils/token.js';
import { successResponse } from '../../src/utils/response.js';

describe('Multi-College Authorization & Scope Boundary Tests', () => {
  let app;
  let collegeA, collegeB;
  let adminA, adminB, platformAdmin, studentA;

  beforeEach(async () => {
    collegeA = await College.create({ name: 'Alpha Institute', slug: 'alpha-inst' });
    collegeB = await College.create({ name: 'Beta Institute', slug: 'beta-inst' });

    const passwordHash = await User.hashPassword('pass123');

    // College A Admin
    adminA = await User.create({
      name: 'Admin Alpha',
      email: 'admin@alpha.test',
      passwordHash,
      collegeId: collegeA._id,
      collegeRole: 'college_admin',
    });

    // College B Admin
    adminB = await User.create({
      name: 'Admin Beta',
      email: 'admin@beta.test',
      passwordHash,
      collegeId: collegeB._id,
      collegeRole: 'college_admin',
    });

    // Platform Admin (Platform-wide scope)
    platformAdmin = await User.create({
      name: 'Global Platform Admin',
      email: 'platform@global.test',
      passwordHash,
      globalRole: 'platform_admin',
      collegeRole: 'student',
    });

    // Student A
    studentA = await User.create({
      name: 'Student Alpha',
      email: 'student@alpha.test',
      passwordHash,
      collegeId: collegeA._id,
      collegeRole: 'student',
    });

    // Setup an Express router testing protected institutional routes
    app = express();
    app.use(express.json());
    app.use(cookieParser());

    // Protected college-admin route for modifying an institution's resources: /admin/colleges/:collegeId/settings
    app.patch(
      '/api/v1/college-admin/:collegeId/settings',
      authenticate,
      requireCollegeRole('college_admin'),
      requireCollegeScope((req) => req.params.collegeId),
      (req, res) => successResponse(res, { updated: true, targetCollegeId: req.params.collegeId })
    );

    // Platform-admin only route: /api/v1/platform-admin/global-audit
    app.get(
      '/api/v1/platform-admin/global-audit',
      authenticate,
      requireGlobalRole('platform_admin'),
      (req, res) => successResponse(res, { audited: true })
    );

    app.use(errorHandler);
  });

  it('allows College Admin A to manage resources in College A', async () => {
    const tokenA = signToken({ id: adminA._id, collegeId: adminA.collegeId, collegeRole: 'college_admin' });

    const res = await request(app)
      .patch(`/api/v1/college-admin/${collegeA._id}/settings`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ policy: 'updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.updated).toBe(true);
  });

  it('BLOCKS College Admin A from accessing or mutating College B resources (403 Forbidden)', async () => {
    const tokenA = signToken({ id: adminA._id, collegeId: adminA.collegeId, collegeRole: 'college_admin' });

    const res = await request(app)
      .patch(`/api/v1/college-admin/${collegeB._id}/settings`) // Attempting to manage College B!
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ policy: 'exploit' });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(res.body.error.message).toMatch(/College scope violation/i);
  });

  it('BLOCKS ordinary students from accessing college administrator endpoints', async () => {
    const studentToken = signToken({ id: studentA._id, collegeId: studentA.collegeId, collegeRole: 'student' });

    const res = await request(app)
      .patch(`/api/v1/college-admin/${collegeA._id}/settings`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.message).toMatch(/Required role: college_admin/i);
  });

  it('allows Platform Admin platform-wide access across colleges', async () => {
    const platformToken = signToken({ id: platformAdmin._id, globalRole: 'platform_admin' });

    // Platform admin accesses College B resource
    const resB = await request(app)
      .patch(`/api/v1/college-admin/${collegeB._id}/settings`)
      .set('Authorization', `Bearer ${platformToken}`);

    expect(resB.status).toBe(200);

    // Platform admin accesses global audit endpoint
    const resAudit = await request(app)
      .get('/api/v1/platform-admin/global-audit')
      .set('Authorization', `Bearer ${platformToken}`);

    expect(resAudit.status).toBe(200);
    expect(resAudit.body.data.audited).toBe(true);
  });

  it('BLOCKS college admins from accessing platform-admin endpoints', async () => {
    const tokenA = signToken({ id: adminA._id, collegeRole: 'college_admin' });

    const res = await request(app)
      .get('/api/v1/platform-admin/global-audit')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(403);
    expect(res.body.error.message).toMatch(/Platform administrator privilege required/i);
  });
});
