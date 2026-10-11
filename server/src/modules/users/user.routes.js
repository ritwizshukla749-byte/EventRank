import { Router } from 'express';
import { updateMe, myRegistrations } from './user.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import { updateProfileSchema } from './user.validation.js';

const router = Router();

// GET /api/v1/users/me/registrations - Current user's registrations
router.get('/me/registrations', authenticate, myRegistrations);

// PATCH /api/v1/users/me - Current user's profile update
router.patch('/me', authenticate, validateRequest({ body: updateProfileSchema }), updateMe);

export default router;