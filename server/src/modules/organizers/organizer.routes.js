import { Router } from 'express';
import {
  getOrganizers,
  getOrganizerById,
  updateOrganizer,
} from './organizer.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/', getOrganizers);
router.get('/:organizerId', getOrganizerById);
router.patch('/:organizerId', authenticate, updateOrganizer);

export default router;
