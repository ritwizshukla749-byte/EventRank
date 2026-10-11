import { Router } from 'express';
import {
  createCheckInToken,
  checkIn,
  verifyUserAttendance,
  getMyStatus,
} from './attendance.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  checkInSchema,
  manualVerifySchema,
  createCheckInTokenSchema,
} from './attendance.validation.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

// Attendance routes
router.post(
  '/:id/check-in-token',
  authenticate,
  validateRequest({ body: createCheckInTokenSchema }),
  createCheckInToken
);

router.post(
  '/:id/check-in',
  authenticate,
  validateRequest({ body: checkInSchema }),
  checkIn
);

router.post(
  '/:id/attendance/:userId/verify',
  authenticate,
  validateRequest({ body: manualVerifySchema }),
  verifyUserAttendance
);

router.get('/:id/attendance/me', authenticate, getMyStatus);

export default router;