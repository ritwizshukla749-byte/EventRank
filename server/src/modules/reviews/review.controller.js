import {
  getReviewEligibility,
  submitAttendeeReview,
  listEditionReviews,
  reportReview,
  moderateReview,
} from './review.service.js';
import { successResponse } from '../../utils/response.js';

export async function checkEligibility(req, res, next) {
  try {
    const result = await getReviewEligibility(req.user, req.params.id);
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}

export async function createReview(req, res, next) {
  try {
    const result = await submitAttendeeReview(req.user, req.params.id, req.body);
    return successResponse(res, result, {}, 201);
  } catch (err) {
    next(err);
  }
}

export async function getReviews(req, res, next) {
  try {
    const result = await listEditionReviews(req.params.id);
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}

export async function report(req, res, next) {
  try {
    const result = await reportReview(req.user, req.params.reviewId, req.body);
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}

export async function moderate(req, res, next) {
  try {
    const result = await moderateReview(req.user, req.params.reviewId, req.body);
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}
