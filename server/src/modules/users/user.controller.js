import { updateUserProfile, getMyRegistrations } from './user.service.js';
import { successResponse } from '../../utils/response.js';

export async function updateMe(req, res, next) {
  try {
    const result = await updateUserProfile(req.user._id, req.body);
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}

export async function myRegistrations(req, res, next) {
  try {
    const result = await getMyRegistrations(req.user._id);
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}