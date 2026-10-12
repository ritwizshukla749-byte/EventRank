import {
  listUserSavedEvents,
  saveEvent,
  removeSavedEvent,
  checkSavedStatus,
  batchCheckSavedStatus,
} from './savedEvent.service.js';
import { successResponse } from '../../utils/response.js';

/**
 * GET /saved-events
 * List all saved events for authenticated user
 */
export async function listSavedEvents(req, res, next) {
  try {
    const userId = req.user._id;
    const { page, limit } = req.query;
    
    const result = await listUserSavedEvents(userId, { page, limit });
    
    return successResponse(res, { savedEvents: result.savedEvents }, { pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /saved-events
 * Save an event (bookmark)
 */
export async function createSavedEvent(req, res, next) {
  try {
    const userId = req.user._id;
    const { editionId } = req.body;
    
    const result = await saveEvent(userId, editionId);
    
    return successResponse(res, result, {}, 201);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /saved-events/:editionId
 * Remove saved event (unbookmark)
 */
export async function deleteSavedEvent(req, res, next) {
  try {
    const userId = req.user._id;
    const { editionId } = req.params;
    
    const result = await removeSavedEvent(userId, editionId);
    
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /saved-events/:editionId/status
 * Check if event is saved
 */
export async function getSavedStatus(req, res, next) {
  try {
    const userId = req.user._id;
    const { editionId } = req.params;
    
    const result = await checkSavedStatus(userId, editionId);
    
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /saved-events/batch-status
 * Batch check saved status for multiple events
 */
export async function getBatchSavedStatus(req, res, next) {
  try {
    const userId = req.user._id;
    const { editionIds } = req.body;
    
    const result = await batchCheckSavedStatus(userId, editionIds);
    
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}
