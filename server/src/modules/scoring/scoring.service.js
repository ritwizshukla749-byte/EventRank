import {
  EventEdition,
  Review,
  Organizer,
  Event,
  User,
} from '../../models/index.js';
import {
  calculateEventQuality,
  DEFAULT_NEUTRAL_ORGANIZER_RATING,
} from './qualityScore.js';
import { calculateFitForYou } from './fitScore.js';
import { getPreEventSignals } from '../registrations/registration.service.js';
import { NotFoundError } from '../../utils/errors.js';

/**
 * Gathers the review/history evidence used for Event Quality for one edition.
 * Shared by single-edition scoring and batch summaries for lists/compare.
 */
export async function gatherQualityEvidence(edition, eventSeries, organizer) {
  // A. Current eligible reviews for this edition
  const currentReviews = await Review.find({
    eventEditionId: edition._id,
    status: 'published',
  });

  // B. Historical ratings from previous editions of the SAME event series
  let pastEditionsData = null;
  if (eventSeries?._id) {
    const pastEditions = await EventEdition.find({
      eventId: eventSeries._id,
      _id: { $ne: edition._id },
      status: 'completed',
    }).select('_id');

    if (pastEditions.length > 0) {
      const pastEditionIds = pastEditions.map((e) => e._id);
      const pastReviews = await Review.find({
        eventEditionId: { $in: pastEditionIds },
        status: 'published',
      }).select('overallRating');

      if (pastReviews.length > 0) {
        const sum = pastReviews.reduce((acc, r) => acc + r.overallRating, 0);
        pastEditionsData = {
          averageRating: sum / pastReviews.length,
          reviewCount: pastReviews.length,
          editionCount: pastEditions.length,
        };
      }
    }
  }

  // C. Organizer track record across completed events
  let organizerHistoryData = null;
  if (organizer?._id) {
    const orgEvents = await Event.find({ organizerId: organizer._id }).select('_id');
    const orgEventIds = orgEvents.map((e) => e._id);

    const completedEditions = await EventEdition.find({
      eventId: { $in: orgEventIds },
      status: 'completed',
    }).select('_id');

    if (completedEditions.length > 0) {
      const completedEditionIds = completedEditions.map((e) => e._id);
      const allOrgReviews = await Review.find({
        eventEditionId: { $in: completedEditionIds },
        status: 'published',
      }).select('overallRating');

      if (allOrgReviews.length > 0) {
        const sum = allOrgReviews.reduce((acc, r) => acc + r.overallRating, 0);
        organizerHistoryData = {
          averageRating: sum / allOrgReviews.length,
          completedEventsCount: completedEditions.length,
        };
      } else {
        organizerHistoryData = {
          averageRating: DEFAULT_NEUTRAL_ORGANIZER_RATING,
          completedEventsCount: completedEditions.length,
        };
      }
    }
  }

  return { currentReviews, pastEditionsData, organizerHistoryData };
}

/**
 * Computes Event Quality and Fit for You for many editions without pre-event
 * signals. Used by event list and compare endpoints. Fit stays null when no
 * authenticated student is provided (privacy invariant: no anonymous fit).
 */
export async function scoreEditionSummaries(editions, currentStudentUser = null) {
  const summaries = await Promise.all(
    editions.map(async (edition) => {
      const eventSeries = edition.eventId;
      const organizer = eventSeries?.organizerId;

      const { currentReviews, pastEditionsData, organizerHistoryData } =
        await gatherQualityEvidence(edition, eventSeries, organizer);

      const eventQuality = calculateEventQuality({
        reviews: currentReviews,
        pastEditions: pastEditionsData,
        organizerHistory: organizerHistoryData,
      });

      let fitForYou = null;
      if (currentStudentUser) {
        fitForYou = calculateFitForYou({
          student: currentStudentUser,
          event: eventSeries,
          edition,
        });
      }

      return { eventQuality, fitForYou };
    })
  );

  return summaries;
}

/**
 * Computes Event Quality, Fit for You (if student provided), and Pre-Event Signals
 * for a specific event edition, maintaining strict separation between Quality and Fit.
 */
export async function getScoredEventEdition(editionId, currentStudentUser = null) {
  const edition = await EventEdition.findById(editionId)
    .populate({
      path: 'eventId',
      populate: { path: 'organizerId' },
    })
    .populate('collegeId')
    .populate('allowedCollegeIds');

  if (!edition) {
    throw new NotFoundError('Event edition not found');
  }

  const eventSeries = edition.eventId;
  const organizer = eventSeries?.organizerId;

  const { currentReviews, pastEditionsData, organizerHistoryData } =
    await gatherQualityEvidence(edition, eventSeries, organizer);

  // Calculate Event Quality via Pure Function
  const eventQuality = calculateEventQuality({
    reviews: currentReviews,
    pastEditions: pastEditionsData,
    organizerHistory: organizerHistoryData,
  });

  // 2. Calculate Fit for You (Personalized for Current Student)
  let fitForYou = null;
  if (currentStudentUser) {
    fitForYou = calculateFitForYou({
      student: currentStudentUser,
      event: eventSeries,
      edition,
    });
  }

  // 3. Pre-event signals
  const signalsResult = await getPreEventSignals(edition._id, currentStudentUser);

  return {
    edition,
    eventQuality,
    fitForYou,
    preEventSignals: signalsResult.signals,
  };
}
