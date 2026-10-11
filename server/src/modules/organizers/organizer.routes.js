import { Router } from 'express';
import {
  getOrganizers,
  getMyOrganizer,
  getOrganizerById,
  updateOrganizer,
} from './organizer.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/', getOrganizers);
// Must be registered before '/:organizerId' so 'me' is not parsed as an ID
router.get('/me', authenticate, getMyOrganizer);
router.get('/:organizerId', getOrganizerById);
router.patch('/:organizerId', authenticate, updateOrganizer);

export default router;
