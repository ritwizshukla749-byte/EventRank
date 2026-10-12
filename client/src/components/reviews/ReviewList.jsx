import React from 'react';
import { ReviewCard } from './ReviewCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { EmptyState } from '../common/EmptyState';
import { MessageSquare } from 'lucide-react';

/**
 * List of reviews with loading, empty, and error states
 */
export function ReviewList({ reviews, isLoading, error, onRetry, onReport }) {
  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <LoadingSpinner message="Loading reviews..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl border border-rose-200 bg-rose-50 text-center">
        <p className="text-rose-700 text-sm mb-3">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm text-rose-600 hover:text-rose-700 font-medium underline"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No verified reviews yet"
        description="Reviews are submitted by verified attendees after the event. Check back once the event has completed."
      />
    );
  }

  return (
    <div className="space-y-4" role="list" aria-label="Event reviews">
      {reviews.map((review) => (
        <ReviewCard 
          key={review._id} 
          review={review}
          onReport={onReport}
        />
      ))}
    </div>
  );
}
