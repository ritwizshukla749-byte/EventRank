import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ScoreGauge, EvidenceBadge } from './ScoreGauge';
import { ChevronDown, ChevronUp, ShieldCheck, Sparkles, AlertCircle, LogIn, Check } from 'lucide-react';
import { buildLoginUrl } from '../../utils/redirectHelpers';
import { Button } from '../common/Button';

// Human-readable labels for server-issued fit reason codes (never invented by the client)
const FIT_REASON_LABELS = {
  profile_incomplete_recommendation_approximated: 'Score approximated — profile incomplete',
  partial_interest_alignment: 'Partial match with your interests',
  compatible_with_academic_stage: 'Matches your academic stage',
  interest_match: 'Matches your interests',
  skill_match: 'Matches your skill level',
  budget_compatible: 'Within your budget',
  event_type_preferred: 'Preferred event type',
  ineligible_academic_year: 'Outside your academic year range',
  ineligible_college: 'Event restricted to another college',
  cost_exceeds_budget: 'Cost may exceed your budget',
  no_profile_data: 'Add profile details to personalise your score',
};

function fitReasonLabel(code) {
  return FIT_REASON_LABELS[code] ?? code.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Renders the two strictly separate server-issued score summaries:
 * - `quality`: Event Quality (eventQuality) summary
 * - `fit`: Fit for You (fitForYou) summary
 */
export function DualScoreCard({ quality = null, fit = null, isAuthenticated = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showQualityDetails, setShowQualityDetails] = useState(false);
  const [showFitDetails, setShowFitDetails] = useState(false);

  const qualityStatus = quality?.status || 'insufficient_evidence';
  const qualityValue = typeof quality?.score === 'number' ? quality.score : null;
  const reviewCount = quality?.eligibleReviewCount || 0;
  const qualityComponents = quality?.components || {};

  const fitValue = typeof fit?.score === 'number' ? fit.score : null;
  const fitStatus = fit?.status || 'limited_profile';
  const fitReasons = fit?.reasonCodes || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. Event Quality Panel (Emerald Theme) */}
      <div className="p-5 rounded-2xl border border-emerald-200 bg-white shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Event Quality</h4>
                <p className="text-[11px] text-slate-500">Community & verified Bayesian rating</p>
              </div>
            </div>
            <EvidenceBadge status={qualityStatus} />
          </div>

          <div className="flex items-center gap-5 my-4">
            <ScoreGauge score={qualityValue} type="quality" size="md" />
            <div className="space-y-1 text-xs">
              <p className="text-slate-700">
                <strong className="text-slate-900 font-mono">{reviewCount}</strong> verified attendee reviews
              </p>
              <p className="text-slate-500 text-[11px]">
                {qualityStatus === 'review_supported'
                  ? 'Strong statistical confidence from past attendees.'
                  : qualityStatus === 'provisional'
                  ? 'Provisional score anchored by organizer track record.'
                  : 'Early stage event — relies on organizer signals.'}
              </p>
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={() => setShowQualityDetails(!showQualityDetails)}
            className="w-full pt-3 mt-2 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-700 hover:text-emerald-800 font-medium transition-colors cursor-pointer"
          >
            <span>How is Event Quality calculated?</span>
            {showQualityDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showQualityDetails && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-slate-700 space-y-1.5 leading-relaxed">
              <p>• Uses an empirical Bayesian model: blends prior organizer performance with verified peer reviews.</p>
              <p>• Raw attendance count does NOT increase quality; only verified attendee feedback counts.</p>
              {(qualityComponents.reviewAggregate !== undefined ||
                qualityComponents.historicalPrior !== undefined) && (
                <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] font-mono text-emerald-900">
                  <div>Review aggregate: {qualityComponents.reviewAggregate ?? 'N/A'}/100</div>
                  <div>Organizer prior: {qualityComponents.historicalPrior ?? 'N/A'}/100</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Fit for You Panel (Violet Theme) */}
      <div className="p-5 rounded-2xl border border-purple-200 bg-white shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Fit for You</h4>
                <p className="text-[11px] text-slate-500">Personalized to skills, interests & schedule</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-medium">
              {fitStatus === 'personalized' ? 'Personalized' : 'Limited Profile'}
            </span>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-5 my-4">
              <ScoreGauge score={fitValue} type="fit" size="md" />
              <div className="space-y-1 text-xs">
                <p className="text-slate-700">
                  Calculated against your student profile & preferences.
                </p>
                {fitReasons.length > 0 ? (
                  <div className="flex flex-col gap-1.5 pt-1">
                    {fitReasons.slice(0, 4).map((reason, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 text-[11px] text-slate-700"
                      >
                        <Check className="w-3 h-3 text-purple-500 shrink-0" />
                        <span>{fitReasonLabel(reason)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-[11px]">
                    {fit?.isEligible === false
                      ? 'Not eligible for this event under the current eligibility policy.'
                      : 'Standard alignment with preferences.'}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="my-3 space-y-3">
              <div className="p-4 rounded-xl border border-dashed border-purple-200 bg-purple-50/50 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-purple-900">Unlock Your Personalized Match Score</p>
                  <p className="text-slate-600 leading-relaxed">
                    See how well this event matches your interests, skills, and schedule based on your student profile.
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(buildLoginUrl(location.pathname))}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white border-0 font-medium"
              >
                <LogIn className="w-4 h-4 mr-1.5" />
                Sign In to See Your Match
              </Button>
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => setShowFitDetails(!showFitDetails)}
            className="w-full pt-3 mt-2 border-t border-purple-100 flex items-center justify-between text-xs text-purple-700 hover:text-purple-800 font-medium transition-colors cursor-pointer"
          >
            <span>Why is Fit for You kept separate?</span>
            {showFitDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showFitDetails && (
            <div className="mt-3 p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-xs text-slate-700 space-y-2 leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5 shrink-0">→</span>
                <span>A 5-star hackathon is low fit if you're not interested in coding. A great workshop might not match your budget or academic year.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5 shrink-0">→</span>
                <span>EventRank keeps <strong>Event Quality</strong> (universal peer rating) and <strong>Fit for You</strong> (your personal preferences) strictly separate — so you always see uncompromised data.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}