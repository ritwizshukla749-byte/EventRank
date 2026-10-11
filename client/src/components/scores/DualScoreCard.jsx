import React, { useState } from 'react';
import { ScoreGauge, EvidenceBadge } from './ScoreGauge';
import { ChevronDown, ChevronUp, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

/**
 * Renders the two strictly separate server-issued score summaries:
 * - `quality`: Event Quality (eventQuality) summary
 * - `fit`: Fit for You (fitForYou) summary
 */
export function DualScoreCard({ quality = null, fit = null, isAuthenticated = false }) {
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
      <div className="p-5 rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-950/20 to-black/40 backdrop-blur-md flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-100">Event Quality</h4>
                <p className="text-[11px] text-slate-400">Community & verified Bayesian rating</p>
              </div>
            </div>
            <EvidenceBadge status={qualityStatus} />
          </div>

          <div className="flex items-center gap-5 my-4">
            <ScoreGauge score={qualityValue} type="quality" size="md" />
            <div className="space-y-1 text-xs">
              <p className="text-slate-300">
                <strong className="text-white font-mono">{reviewCount}</strong> verified attendee reviews
              </p>
              <p className="text-slate-400 text-[11px]">
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
            className="w-full pt-3 mt-2 border-t border-emerald-500/10 flex items-center justify-between text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>How is Event Quality calculated?</span>
            {showQualityDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showQualityDetails && (
            <div className="mt-3 p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-xs text-slate-300 space-y-1.5 leading-relaxed">
              <p>• Uses an empirical Bayesian model: blends prior organizer performance with verified peer reviews.</p>
              <p>• Raw attendance count does NOT increase quality; only verified attendee feedback counts.</p>
              {(qualityComponents.reviewAggregate !== undefined ||
                qualityComponents.historicalPrior !== undefined) && (
                <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>Review aggregate: {qualityComponents.reviewAggregate ?? 'N/A'}/100</div>
                  <div>Organizer prior: {qualityComponents.historicalPrior ?? 'N/A'}/100</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Fit for You Panel (Violet Theme) */}
      <div className="p-5 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-purple-950/20 to-black/40 backdrop-blur-md flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-100">Fit for You</h4>
                <p className="text-[11px] text-slate-400">Personalized to skills, interests & schedule</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
              {fitStatus === 'personalized' ? 'Personalized' : 'Limited Profile'}
            </span>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-5 my-4">
              <ScoreGauge score={fitValue} type="fit" size="md" />
              <div className="space-y-1 text-xs">
                <p className="text-slate-300">
                  Calculated against your student profile & preferences.
                </p>
                {fitReasons.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {fitReasons.slice(0, 3).map((reason, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-mono"
                      >
                        ✓ {reason.replace(/_/g, ' ').toLowerCase()}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-[11px]">
                    {fit?.isEligible === false
                      ? 'Not eligible for this event under the current eligibility policy.'
                      : 'Standard alignment with preferences.'}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 my-3 rounded-xl border border-dashed border-purple-500/30 bg-purple-950/10 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-medium text-purple-200">Personalization Requires Sign In</p>
                <p className="text-slate-400 leading-relaxed">
                  Sign in and set up your student profile (skills, department, budget) to see your personalized match score.
                </p>
              </div>
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => setShowFitDetails(!showFitDetails)}
            className="w-full pt-3 mt-2 border-t border-purple-500/10 flex items-center justify-between text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            <span>Why is Fit for You kept separate?</span>
            {showFitDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showFitDetails && (
            <div className="mt-3 p-3 rounded-lg bg-purple-950/30 border border-purple-500/20 text-xs text-slate-300 space-y-1.5 leading-relaxed">
              <p>• A 5-star hackathon is low fit if you're not interested in coding. A high-quality workshop might not match your budget or year.</p>
              <p>• EventRank strictly keeps <strong>Event Quality</strong> (universal peer rating) and <strong>Fit for You</strong> (personal preference) separate so you always see uncompromised data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}