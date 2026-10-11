/**
 * Pure, deterministic implementation of Event Quality scoring
 * per docs/SCORING_SPEC.md.
 * 
 * Invariants:
 * - Event Quality is bounded between 0 and 100.
 * - Missing evidence is honest: returns 'insufficient_evidence' instead of 0 or invented scores.
 * - Pre-event prior P blends past editions (60%) and organizer history (40%).
 * - Bayesian smoothing: Q = (k * P + n_eff * R) / (k + n_eff), with default prior strength k = 5.
 * - Ineligible, unverified, or hidden reviews MUST be excluded.
 * - Popularity / registrations NEVER increase Event Quality.
 */

export const QUALITY_SCORE_VERSION = 'v1.0';
export const DEFAULT_PRIOR_STRENGTH_K = 5;

/**
 * Calibration constant (docs/DECISIONS.md Q-004).
 * Neutral prior rating assigned to an organizer's track record ONLY when the
 * organizer has completed editions but zero published reviews. It is a
 * documented default, not a data point, and is applied in scoring.service.js.
 */
export const DEFAULT_NEUTRAL_ORGANIZER_RATING = 3.5;

/**
 * Normalizes a 1-5 scale to a 0-100 scale: (rating - 1) / 4 * 100
 */
export function normalizeRating1to5(rating) {
  if (rating === null || rating === undefined || Number.isNaN(rating)) return null;
  const clamped = Math.max(1, Math.min(5, Number(rating)));
  return Math.round(((clamped - 1) / 4) * 100 * 10) / 10;
}

/**
 * Calculates Event Quality for an event edition.
 * 
 * @param {Object} params
 * @param {Array<Object>} [params.reviews=[]] - Array of published, verified reviews { dimensions, overallRating, conflictFlags }
 * @param {Object|null} [params.pastEditions=null] - { averageRating: number, reviewCount: number, editionCount: number }
 * @param {Object|null} [params.organizerHistory=null] - { averageRating: number, completedEventsCount: number }
 * @param {number} [params.k=DEFAULT_PRIOR_STRENGTH_K] - Prior strength
 * @returns {Object} Quality score breakdown and evidence status
 */
export function calculateEventQuality({
  reviews = [],
  pastEditions = null,
  organizerHistory = null,
  k = DEFAULT_PRIOR_STRENGTH_K,
} = {}) {
  const explanationCodes = [];

  // Filter only eligible published reviews
  const eligibleReviews = (reviews || []).filter(
    (r) => r && r.status === 'published' && r.dimensions
  );

  const eligibleReviewCount = eligibleReviews.length;
  let reviewAggregateScore = null;

  if (eligibleReviewCount > 0) {
    let totalScore = 0;
    let totalWeight = 0;

    for (const rev of eligibleReviews) {
      const { organization, contentValue, networking, timeCostValue } = rev.dimensions;
      const validDims = [organization, contentValue, networking, timeCostValue].filter(
        (v) => typeof v === 'number' && v >= 1 && v <= 5
      );

      if (validDims.length === 0) continue;

      const dimAvg = validDims.reduce((a, b) => a + b, 0) / validDims.length;
      const normScore = normalizeRating1to5(dimAvg);

      // Weight organizer-affiliated reviews fairly with disclosure flag
      let weight = 1.0;
      if (rev.conflictFlags && rev.conflictFlags.includes('organizer_affiliated')) {
        weight = 0.5;
        if (!explanationCodes.includes('ORGANIZER_AFFILIATED_REVIEWS_ADJUSTED')) {
          explanationCodes.push('ORGANIZER_AFFILIATED_REVIEWS_ADJUSTED');
        }
      }

      totalScore += normScore * weight;
      totalWeight += weight;
    }

    if (totalWeight > 0) {
      reviewAggregateScore = Math.round((totalScore / totalWeight) * 10) / 10;
    }
  }

  // Construct Historical Prior P
  let priorScore = null;
  let priorComponents = 0;
  let priorSum = 0;

  const hasPastEditions =
    pastEditions &&
    typeof pastEditions.averageRating === 'number' &&
    pastEditions.editionCount > 0;

  const hasOrganizerHistory =
    organizerHistory &&
    typeof organizerHistory.averageRating === 'number' &&
    organizerHistory.completedEventsCount > 0;

  if (hasPastEditions) {
    const normPast = normalizeRating1to5(pastEditions.averageRating);
    priorSum += normPast * 0.6;
    priorComponents += 0.6;
    explanationCodes.push('PAST_EDITION_EVIDENCE_INCLUDED');
  }

  if (hasOrganizerHistory) {
    const normOrg = normalizeRating1to5(organizerHistory.averageRating);
    priorSum += normOrg * 0.4;
    priorComponents += 0.4;
    explanationCodes.push('ORGANIZER_TRACK_RECORD_INCLUDED');
  }

  if (priorComponents > 0) {
    priorScore = Math.round((priorSum / priorComponents) * 10) / 10;
  }

  // Determine State and Bayesian Calculation
  // Q = (k * P + n_eff * R) / (k + n_eff)
  if (eligibleReviewCount === 0 && priorScore === null) {
    return {
      status: 'insufficient_evidence',
      score: null,
      scoreVersion: QUALITY_SCORE_VERSION,
      confidence: 'none',
      eligibleReviewCount: 0,
      historicalEditionCount: pastEditions?.editionCount || 0,
      organizerCompletedEventCount: organizerHistory?.completedEventsCount || 0,
      explanationCodes: ['NO_REVIEWS_NO_HISTORY'],
      components: {
        reviewAggregate: null,
        historicalPrior: null,
      },
    };
  }

  if (eligibleReviewCount === 0 && priorScore !== null) {
    return {
      status: 'provisional',
      score: Math.min(100, Math.max(0, priorScore)),
      scoreVersion: QUALITY_SCORE_VERSION,
      confidence: priorComponents >= 0.8 ? 'medium' : 'low',
      eligibleReviewCount: 0,
      historicalEditionCount: pastEditions?.editionCount || 0,
      organizerCompletedEventCount: organizerHistory?.completedEventsCount || 0,
      explanationCodes: [...explanationCodes, 'PRE_EVENT_PROVISIONAL_ESTIMATE'],
      components: {
        reviewAggregate: null,
        historicalPrior: priorScore,
      },
    };
  }

  if (eligibleReviewCount > 0 && priorScore === null) {
    const confidence =
      eligibleReviewCount >= 10 ? 'high' : eligibleReviewCount >= 3 ? 'medium' : 'low';
    return {
      status: 'review_supported',
      score: Math.min(100, Math.max(0, reviewAggregateScore)),
      scoreVersion: QUALITY_SCORE_VERSION,
      confidence,
      eligibleReviewCount,
      historicalEditionCount: pastEditions?.editionCount || 0,
      organizerCompletedEventCount: organizerHistory?.completedEventsCount || 0,
      explanationCodes: [...explanationCodes, 'BASED_ON_ELIGIBLE_ATTENDEE_REVIEWS'],
      components: {
        reviewAggregate: reviewAggregateScore,
        historicalPrior: null,
      },
    };
  }

  // Both Reviews and Prior exist -> Bayesian Smoothing
  const n_eff = eligibleReviewCount;
  const smoothed = (k * priorScore + n_eff * reviewAggregateScore) / (k + n_eff);
  const finalScore = Math.round(Math.min(100, Math.max(0, smoothed)) * 10) / 10;

  explanationCodes.push('BAYESIAN_SMOOTHED_SCORE');
  if (eligibleReviewCount >= 5) {
    explanationCodes.push('STRONG_COMMUNITY_CONSENSUS');
  }

  const confidence = eligibleReviewCount >= 8 ? 'high' : 'medium';

  return {
    status: 'review_supported',
    score: finalScore,
    scoreVersion: QUALITY_SCORE_VERSION,
    confidence,
    eligibleReviewCount,
    historicalEditionCount: pastEditions?.editionCount || 0,
    organizerCompletedEventCount: organizerHistory?.completedEventsCount || 0,
    explanationCodes,
    components: {
      reviewAggregate: reviewAggregateScore,
      historicalPrior: priorScore,
      priorStrengthK: k,
      effectiveWeightRatio: {
        priorWeight: Math.round((k / (k + n_eff)) * 100),
        reviewWeight: Math.round((n_eff / (k + n_eff)) * 100),
      },
    },
  };
}
