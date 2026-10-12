import { Router } from 'express';
import {
  listSavedEvents,
  createSavedEvent,
  deleteSavedEvent,
  getSavedStatus,
  getBatchSavedStatus,
} from './savedEvent.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  createSavedEventSchema,
  listSavedEventsQuerySchema,
  batchStatusSchema,
  editionIdParamSchema,
} from './savedEvent.validation.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

// All saved events routes require authentication
router.use(authenticate);

// List saved events
router.get(
  '/',
  validateRequest({ query: listSavedEventsQuerySchema }),
  listSavedEvents
);

// Batch check saved status (must be before /:editionId routes)
router.post(
  '/batch-status',
  validateRequest({ body: batchStatusSchema }),
  getBatchSavedStatus
);

// Save event
router.post(
  '/',
  validateRequest({ body: createSavedEventSchema }),
  createSavedEvent
);

// Check saved status
router.get(
  '/:editionId/status',
  validateRequest({ params: editionIdParamSchema }),
  getSavedStatus
);

// Remove saved event
router.delete(
  '/:editionId',
  validateRequest({ params: editionIdParamSchema }),
  deleteSavedEvent
);

export default router;
