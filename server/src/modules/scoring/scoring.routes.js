import { Router } from 'express';
import { getEventScores } from './scoring.controller.js';
import { optionalAuthenticate } from '../../middleware/auth.js';

const router = Router();

// GET /api/v1/scoring/events/:id - Get Event Quality, Fit for You, and Pre-event signals
router.get('/events/:id', optionalAuthenticate, getEventScores);

export default router;
