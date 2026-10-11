import { Router } from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  compare,
} from './event.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  listEventsQuerySchema,
  createEventSchema,
  compareEventsSchema,
} from './event.validation.js';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/', optionalAuthenticate, validateRequest({ query: listEventsQuerySchema }), getEvents);
router.post('/compare', validateRequest({ body: compareEventsSchema }), compare);
router.post('/', authenticate, validateRequest({ body: createEventSchema }), createEvent);
router.get('/:eventEditionId', optionalAuthenticate, getEventById);

export default router;
