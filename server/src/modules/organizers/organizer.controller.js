import {
  listOrganizers,
  getOrganizerProfileAndHistory,
  getOrganizerForUser,
  updateOrganizerProfile,
} from './organizer.service.js';
import { successResponse } from '../../utils/response.js';

export async function getOrganizers(req, res, next) {
  try {
    const result = await listOrganizers(req.query);
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getMyOrganizer(req, res, next) {
  try {
    const result = await getOrganizerForUser(req.user);
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getOrganizerById(req, res, next) {
  try {
    const result = await getOrganizerProfileAndHistory(req.params.organizerId);
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}

export async function updateOrganizer(req, res, next) {
  try {
    const result = await updateOrganizerProfile(req.params.organizerId, req.user, req.body);
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}
