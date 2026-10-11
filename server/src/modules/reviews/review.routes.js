import { Router } from 'express';
import {
  checkEligibility,
  createReview,
  getReviews,
  report,
  moderate,
} from './review.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  submitReviewSchema,
  reportReviewSchema,
  moderateReviewSchema,
} from './review.validation.js';
import { authenticate } from '../../middleware/auth.js';

const reviewRoutes = Router();

reviewRoutes.post(
  '/:reviewId/report',
  authenticate,
  validateRequest({ body: reportReviewSchema }),
  report
);

reviewRoutes.post(
  '/:reviewId/moderate',
  authenticate,
  validateRequest({ body: moderateReviewSchema }),
  moderate
);

export const reviewEditionRoutes = Router();

reviewEditionRoutes.get('/:id/reviews/eligibility', authenticate, checkEligibility);

reviewEditionRoutes.post(
  '/:id/reviews',
  authenticate,
  validateRequest({ body: submitReviewSchema }),
  createReview
);

reviewEditionRoutes.get('/:id/reviews', getReviews);

export default reviewRoutes;