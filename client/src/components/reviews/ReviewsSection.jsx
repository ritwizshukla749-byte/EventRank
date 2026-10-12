import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReviewList } from './ReviewList';
import { DimensionRating } from './DimensionRating';
import { reviewsApi } from '../../api/reviewsApi';
import { useToast } from '../../hooks/useToast';
import { Button } from '../common/Button';
import { MessageSquare, Star } from 'lucide-react';

/**
 * Reviews section container with header, summary bar, list, and "Write a Review" CTA.
 *
 * The server returns: { reviews: [...], summary: { averageOverall, averageOrganization,
 * averageContentValue, averageNetworking, averageTimeCostValue, reviewCount } }
 * apiClient unwraps data.data, so we receive that object directly.
 */
export function ReviewsSection({ eventEditionId, canWriteReview = false, onWriteReview }) {
  const navigate = useNavigate();
  const { error: showError, success: showSuccess } = useToast();

  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!eventEditionId) {
      setError('Event ID not provided');
      setIsLoading(false);
      return;
    }
    fetchReviews();
  }, [eventEditionId]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // apiClient unwraps the standard { data: {...} } envelope,
      // so response IS { reviews: [], summary: {...} } directly.
      const response = await reviewsApi.list(eventEditionId, { limit: 20 });
      setReviews(response?.reviews ?? []);
      setSummary(response?.summary ?? null);
    } catch (err) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReport = async (reviewId) => {
    try {
      await reviewsApi.report(reviewId, 'User reported inappropriate content');
      showSuccess('Review reported successfully');
    } catch (err) {
      showError(err.message || 'Failed to report review');
    }
  };

  const handleWriteReview = () => {
    if (onWriteReview) {
      onWriteReview();
    } else {
      navigate(`/events/${eventEditionId}/review`);
    }
  };

  const reviewCount = summary?.reviewCount ?? reviews.length;

  return (
    <section
      className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-5"
      aria-labelledby="reviews-heading"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-slate-600" aria-hidden="true" />
          <h2
            id="reviews-heading"
            className="text-sm font-semibold text-slate-900"
          >
            Verified Attendee Reviews
            {reviewCount > 0 && (
              <span className="ml-2 text-slate-500 font-normal">
                ({reviewCount})
              </span>
            )}
          </h2>
        </div>

        {canWriteReview && (
          <Button variant="primary" size="sm" onClick={handleWriteReview}>
            Write a Review
          </Button>
        )}
      </div>

      {/* Aggregate Summary Bar — only shown when there are reviews */}
      {summary && reviewCount > 0 && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-xs font-semibold text-slate-800">
              Overall average: {summary.averageOverall}/5
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              from {reviewCount} verified review{reviewCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <DimensionRating label="Organization" value={summary.averageOrganization} />
            <DimensionRating label="Content / Value" value={summary.averageContentValue} />
            <DimensionRating label="Networking" value={summary.averageNetworking} />
            <DimensionRating label="Time / Cost Value" value={summary.averageTimeCostValue} />
          </div>
        </div>
      )}

      {/* Individual Review List */}
      <ReviewList
        reviews={reviews}
        isLoading={isLoading}
        error={error}
        onRetry={fetchReviews}
        onReport={handleReport}
      />
    </section>
  );
}
