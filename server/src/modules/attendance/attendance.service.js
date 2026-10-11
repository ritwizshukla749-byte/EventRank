import jwt from 'jsonwebtoken';
import { config } from '../../config/env.js';
import {
  AttendanceVerification,
  Registration,
  EventEdition,
  Organizer,
} from '../../models/index.js';
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from '../../utils/errors.js';

/**
 * Generates a short-lived, single-purpose check-in token scoped strictly
 * to one event edition. Authorized organizers/admins display this token.
 */
export async function generateEventCheckInToken(user, editionId, expiresInMinutes = 60) {
  const edition = await EventEdition.findById(editionId).populate({
    path: 'eventId',
    select: 'organizerId',
  });

  if (!edition) {
    throw new NotFoundError('Event edition not found');
  }

  const organizer = await Organizer.findById(edition.eventId.organizerId);
  if (!organizer) {
    throw new NotFoundError('Organizer not found');
  }

  // Authorization check
  const isAuthorized =
    user.globalRole === 'platform_admin' ||
    (user.collegeRole === 'college_admin' && user.collegeId?.toString() === edition.collegeId.toString()) ||
    organizer.authorizedUserIds.some((id) => id.toString() === user._id.toString());

  if (!isAuthorized) {
    throw new ForbiddenError('Only authorized organizers or college administrators can generate check-in tokens');
  }

  const payload = {
    purpose: 'event_checkin',
    editionId: edition._id.toString(),
    collegeId: edition.collegeId.toString(),
    generatedBy: user._id.toString(),
  };

  const token = jwt.sign(payload, config.jwtSecret, {
    expiresIn: `${expiresInMinutes}m`,
  });

  return {
    checkInToken: token,
    expiresInMinutes,
    editionId: edition._id,
  };
}

/**
 * Checks in a student using a verified token or trusted method.
 * INVARIANT: Student CANNOT self-verify without trusted check-in token.
 */
export async function checkInStudent(user, editionId, { method = 'dynamic_token', token, evidenceReference = '' } = {}) {
  const edition = await EventEdition.findById(editionId);
  if (!edition) {
    throw new NotFoundError('Event edition not found');
  }

  let verifiedByUserId = user._id;

  if (method === 'dynamic_token') {
    if (!token) {
      throw new ValidationError('Check-in token is required for dynamic token verification');
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      if (decoded.purpose !== 'event_checkin' || decoded.editionId !== edition._id.toString()) {
        throw new ValidationError('Check-in token is invalid or scoped to a different event edition');
      }
      verifiedByUserId = decoded.generatedBy;
    } catch (err) {
      throw new ValidationError(`Check-in token verification failed: ${err.message}`);
    }
  } else {
    // Other methods (e.g. approved_import, organizer_checkin) cannot be called directly by student
    throw new ForbiddenError('Students cannot self-verify using manual or import methods');
  }

  // Check if attendance is already verified
  const existingVerification = await AttendanceVerification.findOne({
    eventEditionId: edition._id,
    userId: user._id,
  });

  if (existingVerification && existingVerification.status === 'verified') {
    return {
      verification: existingVerification,
      message: 'Attendance is already verified',
    };
  }

  // Record Attendance Verification
  const verification = await AttendanceVerification.findOneAndUpdate(
    { eventEditionId: edition._id, userId: user._id },
    {
      $set: {
        method,
        status: 'verified',
        verifiedBy: verifiedByUserId,
        verifiedAt: new Date(),
        evidenceReference: evidenceReference || `TOKEN-${Date.now()}`,
        auditMetadata: {
          clientIp: 'logged',
          timestamp: new Date().toISOString(),
        },
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Update registration record status to 'attended'
  await Registration.findOneAndUpdate(
    { eventEditionId: edition._id, userId: user._id },
    {
      $set: {
        status: 'attended',
        attendanceVerificationId: verification._id,
      },
    }
  );

  return { verification };
}

/**
 * Allows organizer or admin to verify a student's attendance on the roster.
 */
export async function verifyStudentAttendanceManually(actorUser, editionId, studentUserId, { method = 'organizer_checkin', evidenceReference = '' } = {}) {
  const edition = await EventEdition.findById(editionId).populate({
    path: 'eventId',
    select: 'organizerId',
  });

  if (!edition) {
    throw new NotFoundError('Event edition not found');
  }

  const organizer = await Organizer.findById(edition.eventId.organizerId);
  if (!organizer) {
    throw new NotFoundError('Organizer not found');
  }

  // Authorization check
  const isAuthorized =
    actorUser.globalRole === 'platform_admin' ||
    (actorUser.collegeRole === 'college_admin' && actorUser.collegeId?.toString() === edition.collegeId.toString()) ||
    organizer.authorizedUserIds.some((id) => id.toString() === actorUser._id.toString());

  if (!isAuthorized) {
    throw new ForbiddenError('You are not authorized to verify attendance for this event');
  }

  const verification = await AttendanceVerification.findOneAndUpdate(
    { eventEditionId: edition._id, userId: studentUserId },
    {
      $set: {
        method,
        status: 'verified',
        verifiedBy: actorUser._id,
        verifiedAt: new Date(),
        evidenceReference: evidenceReference || `ROSTER-${actorUser._id}`,
        auditMetadata: {
          verifiedByRole: actorUser.collegeRole || actorUser.globalRole,
          timestamp: new Date().toISOString(),
        },
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Registration.findOneAndUpdate(
    { eventEditionId: edition._id, userId: studentUserId },
    {
      $set: {
        status: 'attended',
        attendanceVerificationId: verification._id,
      },
    }
  );

  return { verification };
}

/**
 * Checks current user's attendance status for an event edition.
 */
export async function getMyAttendanceStatus(user, editionId) {
  const verification = await AttendanceVerification.findOne({
    eventEditionId: editionId,
    userId: user._id,
  });

  return {
    isVerified: verification?.status === 'verified',
    status: verification?.status || 'unverified',
    method: verification?.method || null,
    verifiedAt: verification?.verifiedAt || null,
  };
}
