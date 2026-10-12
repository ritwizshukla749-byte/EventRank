import React from 'react';
import { CheckCircle, AlertCircle, Flag } from 'lucide-react';
import { DimensionRating } from './DimensionRating';

/**
 * Display a single review with dimension ratings and text feedback
 */
export function ReviewCard({ review, onReport }) {
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 30) return `${diffInDays} days ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const dimensions = review.dimensions || {};
  // The server only returns status:'published' reviews, which are all from verified attendees.
  // There is no client-provided isVerified field — derive trust label from the model invariant.
  const isVerified = review.status === 'published' || review.status == null;

  return (
    <article 
      className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs hover:shadow-sm transition-shadow"
      aria-label={`Review by ${isVerified ? 'verified' : 'unverified'} attendee`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isVerified ? (
            <>
              <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" aria-hidden="true" />
              <span className="text-xs font-semibold text-emerald-700">Verified Attendee</span>
            </>
          ) : (
            <>
              <AlertCircle size={16} className="text-amber-500 flex-shrink-0" aria-hidden="true" />
              <span className="text-xs font-semibold text-amber-700">Unverified</span>
            </>
          )}
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500">
            {formatTimeAgo(review.createdAt)}
          </span>
        </div>
      </div>

      {/* Dimension Ratings */}
      <div className="space-y-2 mb-3" role="list" aria-label="Review dimensions">
        <DimensionRating 
          label="Organization" 
          value={dimensions.organization || 0} 
        />
        <DimensionRating 
          label="Content/Value" 
          value={dimensions.contentValue || 0} 
        />
        <DimensionRating 
          label="Networking" 
          value={dimensions.networking || 0} 
        />
        <DimensionRating 
          label="Time/Cost Value" 
          value={dimensions.timeCostValue || 0} 
        />
      </div>

      {/* Text Feedback */}
      {review.text && (
        <div className="pt-3 border-t border-slate-100">
          <p className="text-sm text-slate-700 leading-relaxed">
            {review.text}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-3 mt-3 border-t border-slate-100">
        <button
          onClick={() => onReport && onReport(review._id)}
          className="text-xs text-slate-500 hover:text-rose-600 transition-colors inline-flex items-center gap-1.5"
          aria-label="Report this review"
        >
          <Flag size={12} />
          <span>Report</span>
        </button>
      </div>
    </article>
  );
}
