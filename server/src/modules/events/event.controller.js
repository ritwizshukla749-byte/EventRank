import {
  listPublishedEvents,
  getEventEditionDetails,
  createEventAndEdition,
  compareEvents,
} from './event.service.js';
import { successResponse } from '../../utils/response.js';

export async function getEvents(req, res, next) {
  try {
    const result = await listPublishedEvents(req.query);
    return successResponse(res, { events: result.events }, result.meta);
  } catch (err) {
    next(err);
  }
}

export async function getEventById(req, res, next) {
  try {
    const currentUserId = req.user?._id || null;
    const result = await getEventEditionDetails(req.params.eventEditionId, currentUserId);
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}

export async function createEvent(req, res, next) {
  try {
    const result = await createEventAndEdition(req.user, req.body);
    return successResponse(res, result, {}, 201);
  } catch (err) {
    next(err);
  }
}

export async function compare(req, res, next) {
  try {
    const result = await compareEvents(req.body.editionIds);
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}
