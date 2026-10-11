import { Router } from 'express';
import { isDbConnected } from '../config/db.js';
import { successResponse } from '../utils/response.js';

const router = Router();

router.get('/health', (req, res) => {
  const dbConnected = isDbConnected();

  return successResponse(res, {
    status: dbConnected ? 'ok' : 'degraded',
    service: 'eventrank-api',
    version: '0.1.0',
    database: {
      status: dbConnected ? 'connected' : 'disconnected',
    },
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

export default router;
