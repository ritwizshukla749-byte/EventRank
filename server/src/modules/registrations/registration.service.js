import {
  Registration,
  EventEdition,
  College,
  Event,
  Organizer,
  Review,
  User,
  AttendanceVerification,
} from '../../models/index.js';
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
  AppError,
} from '../../utils/errors.js';

const PEER_PRIVACY_MIN_THRESHOLD = 5;

export async function registerForEvent(user, editionId) {
  const edition = await EventEdition.findById(editionId).populate('collegeId', 'name status');
  if (!edition) {
    throw new NotFoundError('Event edition not found');
  }

  if (edition.status !== 'published') {
    throw new ValidationError(`Cannot register for event with status: ${edition.status}`);
  }

  if (edition.endAt && new Date(edition.endAt) < new Date()) {
    throw new ValidationError('Cannot register for an event that has already ended');
  }

  // Verify student has an assigned college
  if (!user.collegeId) {
    throw new ForbiddenError('You must have an active college association to register');
  }

  const userCollegeIdStr = user.collegeId.toString();
  const hostCollegeIdStr = edition.collegeId._id.toString();

  // Enforce Event Eligibility Policies
  if (edition.eligibility === 'host_college_only') {
    if (userCollegeIdStr !== hostCollegeIdStr) {
      throw new ForbiddenError(
        `Eligibility restriction: This event is restricted to students of ${edition.collegeId.name}`
      );
    }
  } else if (edition.eligibility === 'selected_colleges') {
    const allowed = (edition.allowedCollegeIds || []).map((id) => id.toString());
    if (userCollegeIdStr !== hostCollegeIdStr && !allowed.includes(userCollegeIdStr)) {
      throw new ForbiddenError(
        'Eligibility restriction: Your institution is not in the list of eligible colleges for this event'
      );
    }
  }

  // Check capacity if specified
  if (edition.capacity) {
    const currentCount = await Registration.countDocuments({
      eventEditionId: edition._id,
      status: 'registered',
    });
    if (currentCount >= edition.capacity) {
      throw new AppError('This event has reached full capacity', 409, 'CAPACITY_EXCEEDED');
    }
  }

  // Check existing registration
  const existingReg = await Registration.findOne({
    eventEditionId: edition._id,
    userId: user._id,
  });

  if (existingReg) {
    if (existingReg.status === 'registered') {
      throw new AppError('You are already registered for this event', 409, 'DUPLICATE_REGISTRATION');
    }
    // Re-activate cancelled registration
    existingReg.status = 'registered';
    existingReg.registeredAt = new Date();
    existingReg.cancelledAt = null;
    await existingReg.save();
    return { registration: existingReg };
  }

  // Create fresh registration
  const registration = await Registration.create({
    eventEditionId: edition._id,
    userId: user._id,
    collegeId: user.collegeId,
    status: 'registered',
  });

  return { registration };
}

export async function cancelRegistration(user, editionId) {
  const registration = await Registration.findOne({
    eventEditionId: editionId,
    userId: user._id,
    status: 'registered',
  });

  if (!registration) {
    throw new NotFoundError('Active registration not found');
  }

  registration.status = 'cancelled';
  registration.cancelledAt = new Date();
  await registration.save();

  return { message: 'Registration cancelled successfully' };
}

export async function getRegistrationStatus(user, editionId) {
  const edition = await EventEdition.findById(editionId);
  if (!edition) {
    throw new NotFoundError('Event edition not found');
  }

  const [registration, totalRegistrations] = await Promise.all([
    user ? Registration.findOne({ eventEditionId: editionId, userId: user._id }) : null,
    Registration.countDocuments({ eventEditionId: editionId, status: 'registered' }),
  ]);

  return {
    isRegistered: registration?.status === 'registered',
    registrationStatus: registration?.status || 'none',
    registeredAt: registration?.registeredAt || null,
    totalRegistrations,
  };
}

export async function listForUser(userId) {
  const registrations = await Registration.find({ userId })
    .sort({ registeredAt: -1 })
    .populate({
      path: 'eventEditionId',
      populate: [
        { path: 'eventId', select: 'title eventType tags' },
        { path: 'collegeId', select: 'name slug city' },
      ],
    });

  const editionIds = registrations
    .map((r) => r.eventEditionId?._id)
    .filter(Boolean);

  const verifiedAttendance = await AttendanceVerification.find({
    userId,
    eventEditionId: { $in: editionIds },
    status: 'verified',
  }).select('eventEditionId');
  const verifiedEditionIds = new Set(
    verifiedAttendance.map((v) => v.eventEditionId.toString())
  );

  const rows = registrations.map((registration) => {
    const edition = registration.eventEditionId || null;
    const eventSeries = edition?.eventId || null;
    const hostCollege = edition?.collegeId || null;

    return {
      _id: registration._id,
      eventEditionId: edition?._id || null,
      status: registration.status,
      registeredAt: registration.registeredAt,
      cancelledAt: registration.cancelledAt || null,
      hasAttendance: verifiedEditionIds.has(edition?._id?.toString()),
      edition: edition
        ? {
            _id: edition._id,
            editionLabel: edition.editionLabel,
            startAt: edition.startAt,
            endAt: edition.endAt,
            venue: edition.venue,
            costAmount: edition.costAmount,
            currency: edition.currency,
            eligibility: edition.eligibility,
            status: edition.status,
          }
        : null,
      event: eventSeries
        ? {
            _id: eventSeries._id,
            title: eventSeries.title,
            eventType: eventSeries.eventType,
            tags: eventSeries.tags || [],
          }
        : null,
      hostCollege: hostCollege
        ? {
            _id: hostCollege._id,
            name: hostCollege.name,
            slug: hostCollege.slug,
            city: hostCollege.city,
          }
        : null,
    };
  });

  return { registrations: rows };
}

export async function getPreEventSignals(editionId, currentUser = null) {
  const edition = await EventEdition.findById(editionId).populate('eventId');
  if (!edition) {
    throw new NotFoundError('Event edition not found');
  }

  const eventSeries = edition.eventId;

  // 1. Authoritative Total Registration Count
  const totalRegistrations = await Registration.countDocuments({
    eventEditionId: edition._id,
    status: 'registered',
  });

  // 2. Privacy-Safe Peer Count (scoped to current student's college if authenticated)
  let peerSignal = null;
  if (currentUser && currentUser.collegeId) {
    // Find active registrations from student's college where students opted in to peer counts
    const peerRegistrations = await Registration.find({
      eventEditionId: edition._id,
      collegeId: currentUser.collegeId,
      status: 'registered',
    }).select('userId');

    const peerUserIds = peerRegistrations.map((r) => r.userId);
    const optedInCount = await User.countDocuments({
      _id: { $in: peerUserIds },
      'privacyPreferences.showInPeerCounts': true,
    });

    const isBelowThreshold = optedInCount > 0 && optedInCount < PEER_PRIVACY_MIN_THRESHOLD;

    peerSignal = {
      scopedCollegeId: currentUser.collegeId,
      // Apply privacy threshold: Never reveal small numbers (< 5)
      countDisplay: isBelowThreshold ? `< ${PEER_PRIVACY_MIN_THRESHOLD}` : optedInCount.toString(),
      rawCount: isBelowThreshold ? null : optedInCount,
      privacyProtected: isBelowThreshold,
      thresholdApplied: PEER_PRIVACY_MIN_THRESHOLD,
    };
  }

  // 3. Organizer Track Record (strictly scoped to this organizer ID)
  let organizerHistory = {
    completedEditionsCount: 0,
    totalEventsCount: 0,
  };

  if (eventSeries?.organizerId) {
    const orgEvents = await Event.find({ organizerId: eventSeries.organizerId }).select('_id');
    const orgEventIds = orgEvents.map((e) => e._id);

    const completedCount = await EventEdition.countDocuments({
      eventId: { $in: orgEventIds },
      status: 'completed',
    });

    organizerHistory = {
      totalEventsCount: orgEvents.length,
      completedEditionsCount: completedCount,
    };
  }

  // 4. Past Edition Ratings for this specific Event series
  let pastEditionRating = null;
  if (eventSeries?._id) {
    const pastEditions = await EventEdition.find({
      eventId: eventSeries._id,
      _id: { $ne: edition._id },
      status: 'completed',
    }).select('_id');

    if (pastEditions.length > 0) {
      const pastEditionIds = pastEditions.map((e) => e._id);
      const reviews = await Review.find({
        eventEditionId: { $in: pastEditionIds },
        status: 'published',
      }).select('overallRating');

      if (reviews.length > 0) {
        const sum = reviews.reduce((acc, r) => acc + r.overallRating, 0);
        const avg = Math.round((sum / reviews.length) * 10) / 10;
        pastEditionRating = {
          averageRating: avg,
          reviewCount: reviews.length,
          previousEditionsCount: pastEditions.length,
        };
      }
    }
  }

  return {
    signals: {
      totalRegistrations,
      peersGoing: peerSignal,
      organizerHistory,
      pastEditionRating,
      timestamp: new Date().toISOString(),
    },
  };
}
