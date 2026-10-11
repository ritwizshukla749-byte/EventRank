import { Router } from 'express';
import {
  createRegistration,
  deleteRegistration,
  getStatus,
  getSignals,
} from './registration.controller.js';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.js';

const router = Router();

router.post('/:id/registrations', authenticate, createRegistration);
router.delete('/:id/registrations/me', authenticate, deleteRegistration);
router.get('/:id/registration-status', optionalAuthenticate, getStatus);
router.get('/:id/signals', optionalAuthenticate, getSignals);

export default router;
