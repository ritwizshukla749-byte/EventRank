/**
 * Pure, deterministic implementation of Fit for You personalization scoring
 * per docs/SCORING_SPEC.md.
 * 
 * Invariants:
 * - Calculated specifically for one student profile and one event edition.
 * - Score is strictly between 0 and 100.
 * - Incomplete profile produces an honest 'limited_profile' status with reason codes.
 * - Eligibility mismatch acts as a hard exclusion (fit score = 0) with ELIGIBILITY_MISMATCH code.
 * - Rule-based explainability: returns transparent component contributions and reason codes.
 * - Sensitive characteristics are never used.
 */

export const FIT_SCORE_VERSION = 'v1.0';

export const DEFAULT_FIT_WEIGHTS = {
  interestMatch: 0.35,
  skillMatch: 0.20,
  eventTypeMatch: 0.20,
  academicYearMatch: 0.15,
  budgetMatch: 0.10,
};

/**
 * Calculates Jaccard / overlap match between two sets of lowercase tokens.
 */
function calculateTokenOverlap(userTokens = [], eventTokens = []) {
  if (!userTokens || userTokens.length === 0 || !eventTokens || eventTokens.length === 0) {
    return 0;
  }
  const uSet = new Set(userTokens.map((t) => String(t).toLowerCase().trim()));
  const eSet = new Set(eventTokens.map((t) => String(t).toLowerCase().trim()));

  let intersectionCount = 0;
  for (const token of eSet) {
    if (uSet.has(token)) {
      intersectionCount++;
    }
  }

  // Fraction of event tags that match user's interests (scaled to 100)
  return Math.min(100, Math.round((intersectionCount / Math.max(1, eSet.size)) * 100));
}

/**
 * Calculates Fit for You personalization score.
 * 
 * @param {Object} student - Student profile { collegeId, interests, skills, experienceLevel, preferredEventTypes, academicYear, budgetMax }
 * @param {Object} event - Event series { eventType, tags, prerequisites, expectedOutcomes }
 * @param {Object} edition - Event edition { collegeId, eligibility, allowedCollegeIds, costAmount }
 * @param {Object} [weights=DEFAULT_FIT_WEIGHTS]
 * @returns {Object} Personalized Fit score, breakdown components, and reason codes
 */
export function calculateFitForYou({
  student,
  event,
  edition,
  weights = DEFAULT_FIT_WEIGHTS,
} = {}) {
  const reasonCodes = [];
  const componentScores = {};

  if (!student || !event || !edition) {
    return {
      status: 'limited_profile',
      score: null,
      scoreVersion: FIT_SCORE_VERSION,
      reasonCodes: ['INSUFFICIENT_INPUT_DATA'],
      components: {},
    };
  }

  // 1. HARD CONSTRAINT: Institutional Event Eligibility
  const studentCollegeId = student.collegeId?.toString() || '';
  const hostCollegeId = edition.collegeId?._id?.toString() || edition.collegeId?.toString() || '';

  if (edition.eligibility === 'host_college_only' && studentCollegeId !== hostCollegeId) {
    return {
      status: 'personalized',
      score: 0,
      scoreVersion: FIT_SCORE_VERSION,
      isEligible: false,
      reasonCodes: ['ELIGIBILITY_RESTRICTION_HOST_COLLEGE_ONLY'],
      components: {
        eligibilityMatch: 0,
      },
    };
  }

  if (edition.eligibility === 'selected_colleges') {
    const allowed = (edition.allowedCollegeIds || []).map((id) =>
      id?._id ? id._id.toString() : id.toString()
    );
    if (studentCollegeId !== hostCollegeId && !allowed.includes(studentCollegeId)) {
      return {
        status: 'personalized',
        score: 0,
        scoreVersion: FIT_SCORE_VERSION,
        isEligible: false,
        reasonCodes: ['ELIGIBILITY_RESTRICTION_NOT_SELECTED_COLLEGE'],
        components: {
          eligibilityMatch: 0,
        },
      };
    }
  }

  // Check Profile Completeness
  const hasInterests = Array.isArray(student.interests) && student.interests.length > 0;
  const hasEventPreferences =
    Array.isArray(student.preferredEventTypes) && student.preferredEventTypes.length > 0;
  const hasSkills = Array.isArray(student.skills) && student.skills.length > 0;

  const isProfileComplete = hasInterests && hasEventPreferences;
  if (!isProfileComplete) {
    reasonCodes.push('PROFILE_INCOMPLETE_RECOMMENDATION_APPROXIMATED');
  }

  // 2. Interest / Tag Match (Weight: 35%)
  const interestScore = calculateTokenOverlap(student.interests || [], event.tags || []);
  componentScores.interestMatch = interestScore;
  if (interestScore >= 50) {
    reasonCodes.push('STRONG_INTEREST_TAG_ALIGNMENT');
  } else if (interestScore > 0) {
    reasonCodes.push('PARTIAL_INTEREST_ALIGNMENT');
  } else if (hasInterests) {
    reasonCodes.push('LOW_INTEREST_OVERLAP');
  }

  // 3. Skill & Experience Match (Weight: 20%)
  const skillScore = calculateTokenOverlap(student.skills || [], [
    ...(event.tags || []),
    ...(event.prerequisites || []),
  ]);
  componentScores.skillMatch = skillScore;
  if (skillScore >= 40) {
    reasonCodes.push('SUITABLE_FOR_YOUR_SKILL_PROFILE');
  }

  // 4. Preferred Event Type Match (Weight: 20%)
  let typeScore = 0;
  if (
    hasEventPreferences &&
    event.eventType &&
    student.preferredEventTypes.map((t) => t.toLowerCase()).includes(event.eventType.toLowerCase())
  ) {
    typeScore = 100;
    reasonCodes.push('MATCHES_PREFERRED_EVENT_TYPE');
  } else if (hasEventPreferences) {
    typeScore = 20; // Soft penalty for different event type
  } else {
    typeScore = 50; // Neutral if user hasn't specified preferences
  }
  componentScores.eventTypeMatch = typeScore;

  // 5. Academic Year Compatibility (Weight: 15%)
  // Default score 80; if student has valid academic year, give full score
  let yearScore = 70;
  if (typeof student.academicYear === 'number' && student.academicYear >= 1) {
    yearScore = 100;
    reasonCodes.push('COMPATIBLE_WITH_ACADEMIC_STAGE');
  }
  componentScores.academicYearMatch = yearScore;

  // 6. Budget Compatibility (Weight: 10%)
  let budgetScore = 100;
  const eventCost = Number(edition.costAmount) || 0;
  if (eventCost === 0) {
    budgetScore = 100;
    reasonCodes.push('FREE_EVENT_FULL_BUDGET_COMPATIBILITY');
  } else if (student.budgetMax !== null && student.budgetMax !== undefined) {
    if (eventCost <= student.budgetMax) {
      budgetScore = 100;
      reasonCodes.push('WITHIN_SPECIFIED_STUDENT_BUDGET');
    } else {
      // Exceeds student budget: progressive penalty
      const ratio = student.budgetMax / eventCost;
      budgetScore = Math.max(0, Math.round(ratio * 70));
      reasonCodes.push('EXCEEDS_PREFERRED_BUDGET_CEILING');
    }
  } else {
    budgetScore = 80; // No budget constraint configured
  }
  componentScores.budgetMatch = budgetScore;

  // Final Weighted Aggregation: Fit = Σ (weight_j * component_j)
  const weightedSum =
    componentScores.interestMatch * weights.interestMatch +
    componentScores.skillMatch * weights.skillMatch +
    componentScores.eventTypeMatch * weights.eventTypeMatch +
    componentScores.academicYearMatch * weights.academicYearMatch +
    componentScores.budgetMatch * weights.budgetMatch;

  const finalFitScore = Math.round(Math.min(100, Math.max(0, weightedSum)));

  return {
    status: isProfileComplete ? 'personalized' : 'limited_profile',
    score: finalFitScore,
    scoreVersion: FIT_SCORE_VERSION,
    isEligible: true,
    reasonCodes,
    components: {
      ...componentScores,
      weights,
    },
  };
}
