import {
  Review,
  AttendanceVerification,
  EventEdition,
  Organizer,
  Event,
} from '../../models/index.js';
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
  AppError,
} from '../../utils/errors.js';
import { getScoredEventEdition } from '../scoring/scoring.service.js';

/**
 * Checks whether a student is eligible to review a specific event edition:
 * 1. The event edition MUST be in 'completed' status OR endAt < now.
 * 2. The student MUST have verified attendance (AttendanceVerification.status === 'verified').
 * 3. The student MUST NOT have already submitted a review for this edition.
 */
export async function getReviewEligibility(user, editionId) {
  const edition = await EventEdition.findById(editionId);
  if (!edition) {
    throw new NotFoundError('Event edition not found');
  }

  const isEventCompleted =
    edition.status === 'completed' || (edition.endAt && new Date(edition.endAt) < new Date());

  const verification = await AttendanceVerification.findOne({
    eventEditionId: edition._id,
    userId: user._id,
    status: 'verified',
  });

  const existingReview = await Review.findOne({
    eventEditionId: edition._id,
    userId: user._id,
  });

  const isEligible = isEventCompleted && !!verification && !existingReview;

  let ineligibilityReason = null;
  if (!isEventCompleted) {
    ineligibilityReason = 'EVENT_NOT_COMPLETED';
  } else if (!verification) {
    ineligibilityReason = 'ATTENDANCE_NOT_VERIFIED';
  } else if (existingReview) {
    ineligibilityReason = 'ALREADY_REVIEWED';
  }

  return {
    isEligible,
    ineligibilityReason,
    isEventCompleted,
    isAttendanceVerified: !!verification,
    hasExistingReview: !!existingReview,
    existingReviewId: existingReview?._id || null,
  };
}

/**
 * Submits an official post-event review from a verified attendee.
 * INVARIANT: Unverified attendee CANNOT submit an official review.
 * INVARIANT: One review per eligible student per event edition.
 */
export async function submitAttendeeReview(user, editionId, payload) {
  const eligibility = await getReviewEligibility(user, editionId);

  if (!eligibility.isEligible) {
    if (eligibility.ineligibilityReason === 'EVENT_NOT_COMPLETED') {
      throw new ValidationError('Reviews can only be submitted after the event has ended');
    }
    if (eligibility.ineligibilityReason === 'ATTENDANCE_NOT_VERIFIED') {
      throw new ForbiddenError('Attendance verification is required to submit an official review');
    }
    if (eligibility.ineligibilityReason === 'ALREADY_REVIEWED') {
      throw new AppError('You have already submitted a review for this event edition', 409, 'DUPLICATE_REVIEW');
    }
  }

  const edition = await EventEdition.findById(editionId).populate({
    path: 'eventId',
    select: 'organizerId',
  });

  const verification = await AttendanceVerification.findOne({
    eventEditionId: edition._id,
    userId: user._id,
    status: 'verified',
  });

  // Check for organizer conflict of interest
  const organizer = await Organizer.findById(edition.eventId.organizerId);
  const conflictFlags = [];
  if (
    organizer &&
    organizer.authorizedUserIds.some((id) => id.toString() === user._id.toString())
  ) {
    conflictFlags.push('organizer_affiliated');
  }

  const review = await Review.create({
    eventEditionId: edition._id,
    eventId: edition.eventId._id,
    userId: user._id,
    attendanceVerificationId: verification._id,
    dimensions: payload.dimensions,
    text: payload.text || '',
    status: 'published',
    conflictFlags,
  });

  // Score Refresh: compute updated score breakdown after review acceptance
  const updatedScores = await getScoredEventEdition(edition._id, user);

  return {
    review,
    updatedScores: {
      eventQuality: updatedScores.eventQuality,
      scoreRefreshed: true,
    },
  };
}

/**
 * Lists published reviews and dimension summaries for an edition.
 */
export async function listEditionReviews(editionId) {
  const edition = await EventEdition.findById(editionId);
  if (!edition) {
    throw new NotFoundError('Event edition not found');
  }

  const reviews = await Review.find({
    eventEditionId: edition._id,
    status: 'published',
  })
    .sort({ createdAt: -1 })
    .populate('userId', 'name department academicYear')
    .select('dimensions overallRating text status conflictFlags createdAt');

  // Compute aggregate dimensions summary
  let dimensionsSummary = null;
  if (reviews.length > 0) {
    const sums = { organization: 0, contentValue: 0, networking: 0, timeCostValue: 0, overall: 0 };
    for (const r of reviews) {
      sums.organization += r.dimensions.organization;
      sums.contentValue += r.dimensions.contentValue;
      sums.networking += r.dimensions.networking;
      sums.timeCostValue += r.dimensions.timeCostValue;
      sums.overall += r.overallRating;
    }
    dimensionsSummary = {
      averageOverall: Math.round((sums.overall / reviews.length) * 10) / 10,
      averageOrganization: Math.round((sums.organization / reviews.length) * 10) / 10,
      averageContentValue: Math.round((sums.contentValue / reviews.length) * 10) / 10,
      averageNetworking: Math.round((sums.networking / reviews.length) * 10) / 10,
      averageTimeCostValue: Math.round((sums.timeCostValue / reviews.length) * 10) / 10,
      reviewCount: reviews.length,
    };
  }

  return {
    reviews,
    summary: dimensionsSummary,
  };
}

/**
 * Reports a review for content violation or fraudulent activity.
 */
export async function reportReview(user, reviewId, { reason }) {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new NotFoundError('Review not found');
  }

  if (!review.conflictFlags.includes('reported')) {
    review.conflictFlags.push('reported');
    await review.save();
  }

  return {
    message: 'Review reported for moderation review',
    reviewId: review._id,
  };
}

/**
 * Moderator action to change review publication status (e.g., hidden, under_review).
 */
export async function moderateReview(actorUser, reviewId, { status, moderationReason }) {
  const review = await Review.findById(reviewId).populate({
    path: 'eventEditionId',
    select: 'collegeId',
  });

  if (!review) {
    throw new NotFoundError('Review not found');
  }

  const hostCollegeId = review.eventEditionId.collegeId.toString();

  // Scope check: Platform admin or college admin of that host college
  const isAuthorized =
    actorUser.globalRole === 'platform_admin' ||
    (actorUser.collegeRole === 'college_admin' && actorUser.collegeId?.toString() === hostCollegeId);

  if (!isAuthorized) {
    throw new ForbiddenError('Moderation action denied: outside college administrator authority');
  }

  review.status = status;
  await review.save();

  return {
    message: `Review status transitioned to ${status}`,
    reviewId: review._id,
    status: review.status,
  };
}
