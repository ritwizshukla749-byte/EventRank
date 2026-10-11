import { describe, it, expect } from 'vitest';
import {
  calculateFitForYou,
  FIT_SCORE_VERSION,
} from '../../src/modules/scoring/fitScore.js';

describe('Fit for You Personalization Engine (Pure Unit Tests)', () => {
  const baseEdition = {
    collegeId: '6acb80da493e3f6582380412',
    eligibility: 'all_active_colleges',
    costAmount: 0,
  };

  const baseEvent = {
    eventType: 'hackathon',
    tags: ['ai', 'python', 'machine-learning'],
    prerequisites: ['python'],
    expectedOutcomes: ['prototype'],
  };

  it('calculates high fit score when student interests, skills, and event type align', () => {
    const student = {
      collegeId: '6acb80da493e3f6582380412',
      interests: ['AI', 'Python', 'Cloud'],
      skills: ['Python', 'AI'],
      preferredEventTypes: ['hackathon'],
      academicYear: 3,
      budgetMax: 500,
    };

    const result = calculateFitForYou({
      student,
      event: baseEvent,
      edition: baseEdition,
    });

    expect(result.status).toBe('personalized');
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.scoreVersion).toBe(FIT_SCORE_VERSION);
    expect(result.isEligible).toBe(true);
    expect(result.reasonCodes).toContain('STRONG_INTEREST_TAG_ALIGNMENT');
    expect(result.reasonCodes).toContain('MATCHES_PREFERRED_EVENT_TYPE');
    expect(result.reasonCodes).toContain('SUITABLE_FOR_YOUR_SKILL_PROFILE');
  });

  it('INVARIANT: returns limited_profile status when user profile lacks sufficient preferences', () => {
    const incompleteStudent = {
      collegeId: '6acb80da493e3f6582380412',
      interests: [], // No interests
      skills: [],
      preferredEventTypes: [], // No event types
    };

    const result = calculateFitForYou({
      student: incompleteStudent,
      event: baseEvent,
      edition: baseEdition,
    });

    expect(result.status).toBe('limited_profile');
    expect(result.reasonCodes).toContain('PROFILE_INCOMPLETE_RECOMMENDATION_APPROXIMATED');
  });

  it('INVARIANT: produces score = 0 and eligibility reason code when event is restricted to host college', () => {
    const otherCollegeStudent = {
      collegeId: '6acb80da493e3f6582380499', // Different college!
      interests: ['ai', 'python'],
      preferredEventTypes: ['hackathon'],
    };

    const hostOnlyEdition = {
      ...baseEdition,
      eligibility: 'host_college_only',
      collegeId: '6acb80da493e3f6582380412',
    };

    const result = calculateFitForYou({
      student: otherCollegeStudent,
      event: baseEvent,
      edition: hostOnlyEdition,
    });

    expect(result.score).toBe(0);
    expect(result.isEligible).toBe(false);
    expect(result.reasonCodes).toContain('ELIGIBILITY_RESTRICTION_HOST_COLLEGE_ONLY');
  });

  it('INVARIANT: budget ceiling reduces score progressively when event cost exceeds limit', () => {
    const frugalStudent = {
      collegeId: '6acb80da493e3f6582380412',
      interests: ['ai'],
      preferredEventTypes: ['hackathon'],
      budgetMax: 100, // Max 100
    };

    const expensiveEdition = {
      ...baseEdition,
      costAmount: 500, // 500 > 100
    };

    const result = calculateFitForYou({
      student: frugalStudent,
      event: baseEvent,
      edition: expensiveEdition,
    });

    expect(result.components.budgetMatch).toBeLessThan(50);
    expect(result.reasonCodes).toContain('EXCEEDS_PREFERRED_BUDGET_CEILING');
  });

  it('INVARIANT: deterministic - same student and event always yield identical score', () => {
    const student = {
      collegeId: '6acb80da493e3f6582380412',
      interests: ['ai'],
      skills: ['python'],
      preferredEventTypes: ['hackathon'],
      academicYear: 2,
    };

    const res1 = calculateFitForYou({ student, event: baseEvent, edition: baseEdition });
    const res2 = calculateFitForYou({ student, event: baseEvent, edition: baseEdition });

    expect(res1.score).toBe(res2.score);
    expect(res1.reasonCodes).toEqual(res2.reasonCodes);
  });
});
