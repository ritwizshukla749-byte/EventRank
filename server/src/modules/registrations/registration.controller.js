import {
  registerForEvent,
  cancelRegistration,
  getRegistrationStatus,
  getPreEventSignals,
} from './registration.service.js';
import { successResponse } from '../../utils/response.js';

export async function createRegistration(req, res, next) {
  try {
    const result = await registerForEvent(req.user, req.params.id);
    return successResponse(res, result, {}, 201);
  } catch (err) {
    next(err);
  }
}

export async function deleteRegistration(req, res, next) {
  try {
    const result = await cancelRegistration(req.user, req.params.id);
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getStatus(req, res, next) {
  try {
    const result = await getRegistrationStatus(req.user || null, req.params.id);
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getSignals(req, res, next) {
  try {
    const result = await getPreEventSignals(req.params.id, req.user || null);
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}
