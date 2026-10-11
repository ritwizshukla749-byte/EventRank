import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DualScoreCard } from './DualScoreCard';

describe('DualScoreCard Component — Invariants & Visual Separation', () => {
  it('renders Event Quality and Fit for You with distinct server-issued score summaries', () => {
    const mockQuality = {
      status: 'review_supported',
      score: 88,
      confidence: 'high',
      eligibleReviewCount: 14,
      components: { reviewAggregate: 90, historicalPrior: 82 },
    };
    const mockFit = {
      status: 'personalized',
      score: 92,
      isEligible: true,
      reasonCodes: ['interest_match', 'skill_level_appropriate'],
    };

    render(
      <DualScoreCard
        quality={mockQuality}
        fit={mockFit}
        isAuthenticated={true}
      />
    );

    // Event Quality checks
    expect(screen.getByText('Event Quality')).toBeInTheDocument();
    expect(screen.getByText(/14/)).toBeInTheDocument();
    expect(screen.getByText('Review-backed')).toBeInTheDocument();
    expect(screen.getByText('88')).toBeInTheDocument();

    // Fit for You checks
    expect(screen.getByText('Fit for You')).toBeInTheDocument();
    expect(screen.getByText('92')).toBeInTheDocument();
    expect(screen.getByText('Personalized')).toBeInTheDocument();
    expect(screen.getByText('✓ interest match')).toBeInTheDocument();
  });

  it('prompts unauthenticated users to sign in without displaying a fabricated fit score', () => {
    const mockQuality = {
      status: 'provisional',
      score: 75,
      confidence: 'low',
      eligibleReviewCount: 3,
    };

    render(
      <DualScoreCard
        quality={mockQuality}
        fit={null}
        isAuthenticated={false}
      />
    );

    expect(screen.getByText('Personalization Requires Sign In')).toBeInTheDocument();
    expect(screen.getByText(/Sign in and set up your student profile/i)).toBeInTheDocument();
  });

  it('expands score explanation accordions upon clicking explanation triggers', () => {
    render(
      <DualScoreCard
        quality={{ status: 'review_supported', score: 80, eligibleReviewCount: 5 }}
        fit={{ status: 'personalized', score: 85, reasonCodes: [], isEligible: true }}
        isAuthenticated={true}
      />
    );

    const qualityTrigger = screen.getByText('How is Event Quality calculated?');
    fireEvent.click(qualityTrigger);
    expect(
      screen.getByText(/Uses an empirical Bayesian model: blends prior organizer performance/i)
    ).toBeInTheDocument();

    const fitTrigger = screen.getByText('Why is Fit for You kept separate?');
    fireEvent.click(fitTrigger);
    expect(
      screen.getByText(/EventRank strictly keeps/i)
    ).toBeInTheDocument();
  });
});