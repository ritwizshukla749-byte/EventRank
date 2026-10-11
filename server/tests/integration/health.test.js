import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';

describe('GET /api/v1/health', () => {
  const app = createApp();

  it('should return 200 with standard health check response structure', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');

    const { data } = res.body;
    expect(data.status).toBe('ok');
    expect(data.service).toBe('eventrank-api');
    expect(data.version).toBe('0.1.0');
    expect(data.database).toHaveProperty('status');
    expect(['connected', 'disconnected']).toContain(data.database.status);
    expect(data).toHaveProperty('uptimeSeconds');
    expect(data).toHaveProperty('timestamp');
  });

  it('should return 404 with standard error structure for unknown routes', async () => {
    const res = await request(app).get('/api/v1/non-existent-route');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatchObject({
      code: 'ROUTE_NOT_FOUND',
      message: 'Cannot GET /api/v1/non-existent-route',
    });
  });
});
