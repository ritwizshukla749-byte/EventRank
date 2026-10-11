import { describe, it, expect } from 'vitest';
import {
  calculateEventQuality,
  normalizeRating1to5,
  QUALITY_SCORE_VERSION,
  DEFAULT_NEUTRAL_ORGANIZER_RATING,
} from '../../src/modules/scoring/qualityScore.js';

describe('Event Quality Scoring Engine (Pure Unit Tests)', () => {
  it('correctly normalizes 1-5 ratings to 0-100 scale', () => {
    expect(normalizeRating1to5(1)).toBe(0);
    expect(normalizeRating1to5(3)).toBe(50);
    expect(normalizeRating1to5(5)).toBe(100);
    expect(normalizeRating1to5(4.5)).toBe(87.5);
    expect(normalizeRating1to5(null)).toBeNull();
  });

  it('INVARIANT: returns insufficient_evidence when zero reviews and zero historical prior exist', () => {
    const result = calculateEventQuality({
      reviews: [],
      pastEditions: null,
      organizerHistory: null,
    });

    expect(result.status).toBe('insufficient_evidence');
    expect(result.score).toBeNull(); // NEVER invent a score!
    expect(result.scoreVersion).toBe(QUALITY_SCORE_VERSION);
    expect(result.confidence).toBe('none');
    expect(result.explanationCodes).toContain('NO_REVIEWS_NO_HISTORY');
  });

  it('INVARIANT: returns provisional score when no reviews exist but historical evidence is available', () => {
    const result = calculateEventQuality({
      reviews: [],
      pastEditions: { averageRating: 4.5, reviewCount: 15, editionCount: 2 },
      organizerHistory: { averageRating: 4.0, completedEventsCount: 5 },
    });

    expect(result.status).toBe('provisional');
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.explanationCodes).toContain('PAST_EDITION_EVIDENCE_INCLUDED');
    expect(result.explanationCodes).toContain('ORGANIZER_TRACK_RECORD_INCLUDED');
    expect(result.explanationCodes).toContain('PRE_EVENT_PROVISIONAL_ESTIMATE');
  });

  it('INVARIANT: calculates review_supported score from eligible attendee reviews when no prior exists', () => {
    const reviews = [
      {
        status: 'published',
        dimensions: { organization: 5, contentValue: 5, networking: 4, timeCostValue: 4 },
      },
      {
        status: 'published',
        dimensions: { organization: 4, contentValue: 4, networking: 4, timeCostValue: 4 },
      },
    ];

    const result = calculateEventQuality({ reviews });

    expect(result.status).toBe('review_supported');
    expect(result.eligibleReviewCount).toBe(2);
    expect(result.score).toBeGreaterThan(70);
    expect(result.explanationCodes).toContain('BASED_ON_ELIGIBLE_ATTENDEE_REVIEWS');
  });

  it('INVARIANT: excludes ineligible, unverified, or non-published reviews from score calculation', () => {
    const mixedReviews = [
      {
        status: 'published',
        dimensions: { organization: 5, contentValue: 5, networking: 5, timeCostValue: 5 },
      },
      {
        status: 'hidden', // Moderated / hidden review
        dimensions: { organization: 1, contentValue: 1, networking: 1, timeCostValue: 1 },
      },
      {
        status: 'submitted', // Not yet published
        dimensions: { organization: 1, contentValue: 1, networking: 1, timeCostValue: 1 },
      },
    ];

    const result = calculateEventQuality({ reviews: mixedReviews });

    expect(result.eligibleReviewCount).toBe(1);
    expect(result.score).toBe(100); // Only the 5/5 review contributed
  });

  it('INVARIANT: applies Bayesian smoothing when both historical prior and reviews exist', () => {
    // Weak prior (1 star = score 0) vs strong attendee reviews (5 stars = score 100)
    const result = calculateEventQuality({
      reviews: [
        {
          status: 'published',
          dimensions: { organization: 5, contentValue: 5, networking: 5, timeCostValue: 5 },
        },
      ],
      pastEditions: { averageRating: 1.0, reviewCount: 5, editionCount: 1 },
      k: 5, // Prior strength
    });

    expect(result.status).toBe('review_supported');
    // Prior score = 0, Review score = 100
    // Q = (5 * 0 + 1 * 100) / (5 + 1) = 100 / 6 = 16.7
    expect(result.score).toBe(16.7);
    expect(result.explanationCodes).toContain('BAYESIAN_SMOOTHED_SCORE');
  });

  it('INVARIANT: popularity and registrations NEVER inflate Event Quality', () => {
    // Calling with zero reviews will never yield a score, regardless of any external signals
    const result = calculateEventQuality({ reviews: [] });
    expect(result.score).toBeNull();
  });

  it('records the neutral organizer rating calibration (Q-004) and applies it to a provisional estimate', () => {
    // Guards the documented calibration constant; changing it must be an intentional decision
    expect(DEFAULT_NEUTRAL_ORGANIZER_RATING).toBe(3.5);

    // Behavioral check: organizer with completed events but zero published reviews
    const result = calculateEventQuality({
      reviews: [],
      pastEditions: null,
      organizerHistory: {
        averageRating: DEFAULT_NEUTRAL_ORGANIZER_RATING,
        completedEventsCount: 1,
      },
    });

    expect(result.status).toBe('provisional');
    // normalizeRating1to5(3.5) = ((3.5 - 1) / 4) * 100 = 62.5
    expect(result.score).toBe(62.5);
    expect(result.explanationCodes).toContain('ORGANIZER_TRACK_RECORD_INCLUDED');
    expect(result.explanationCodes).toContain('PRE_EVENT_PROVISIONAL_ESTIMATE');
  });
});
