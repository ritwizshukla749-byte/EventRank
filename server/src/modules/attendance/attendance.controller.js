import {
  generateEventCheckInToken,
  checkInStudent,
  verifyStudentAttendanceManually,
  getMyAttendanceStatus,
} from './attendance.service.js';
import { successResponse } from '../../utils/response.js';

export async function createCheckInToken(req, res, next) {
  try {
    const { expiresInMinutes } = req.body || {};
    const result = await generateEventCheckInToken(req.user, req.params.id, expiresInMinutes);
    return successResponse(res, result, {}, 201);
  } catch (err) {
    next(err);
  }
}

export async function checkIn(req, res, next) {
  try {
    const result = await checkInStudent(req.user, req.params.id, req.body);
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}

export async function verifyUserAttendance(req, res, next) {
  try {
    const result = await verifyStudentAttendanceManually(
      req.user,
      req.params.id,
      req.params.userId,
      req.body
    );
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getMyStatus(req, res, next) {
  try {
    const result = await getMyAttendanceStatus(req.user, req.params.id);
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}
