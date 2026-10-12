import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { reviewsApi } from '../../api/featuresApi';
import { eventsApi } from '../../api/eventsApi';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ShieldCheck, ArrowLeft, Star, AlertTriangle } from 'lucide-react';

export function SubmitReview() {
  const { id } = useParams(); // editionId
  const navigate = useNavigate();

  const [eventData, setEventData] = useState(null);
  const [isEligible, setIsEligible] = useState(null);
  const [eligibilityReason, setEligibilityReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 4 Core Dimensions (1 to 5)
  const [ratings, setRatings] = useState({
    organization: 5,
    contentValue: 5,
    networking: 5,
    timeCostValue: 5,
  });
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    Promise.allSettled([
      eventsApi.getById(id),
      reviewsApi.checkEligibility(id),
    ]).then(([eventRes, eligRes]) => {
      if (isCancelled) return;

      if (eventRes.status === 'fulfilled') {
        setEventData(eventRes.value.edition || null);
      }

      if (eligRes.status === 'fulfilled') {
        setIsEligible(eligRes.value.isEligible);
        if (!eligRes.value.isEligible) {
          const reasonKey = eligRes.value.ineligibilityReason || 'ATTENDANCE_NOT_VERIFIED';
          const reasonText = {
            EVENT_NOT_COMPLETED: 'This event edition has not yet completed.',
            ATTENDANCE_NOT_VERIFIED: 'Verified on-campus attendance is required to leave an official review.',
            ALREADY_REVIEWED: 'You have already submitted a verified review for this event.',
          }[reasonKey];
          setEligibilityReason(reasonText || 'Attendance verification required.');
        }
      } else {
        setIsEligible(false);
        setEligibilityReason('You must have verified attendance to submit an official review.');
      }

      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await reviewsApi.submit(id, {
        dimensions: {
          organization: Number(ratings.organization),
          contentValue: Number(ratings.contentValue),
          networking: Number(ratings.networking),
          timeCostValue: Number(ratings.timeCostValue),
        },
        text: comment.trim() || undefined,
      });
      navigate(`/events/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isEligible === false) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl border border-amber-200 bg-amber-50 text-center space-y-4 shadow-xs">
        <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
        <h2 className="text-base font-semibold text-amber-900">Review Submission Locked</h2>
        <p className="text-xs text-amber-800 leading-relaxed">
          {eligibilityReason}
        </p>
        <p className="text-[11px] text-slate-500">
          EventRank protects quality metrics: only verified attendees can influence the Bayesian Event Quality score.
        </p>
        <div className="pt-2">
          <Link to="/registrations">
            <Button variant="secondary" size="sm">
              Back to My Registrations
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const dimensionLabels = [
    { key: 'organization', label: 'Organization & Venue Logistics' },
    { key: 'contentValue', label: 'Content Depth & Speaker Value' },
    { key: 'networking', label: 'Peer & Networking Opportunities' },
    { key: 'timeCostValue', label: 'Overall Time & Cost Value' },
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <Link
          to={`/events/${id}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Event</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          <span>Submit Verified Attendee Review</span>
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Your feedback feeds directly into the Bayesian Event Quality calculation for {eventData?.title || 'this event'}.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-6 text-xs">
        {/* Rating Dimensions */}
        <div className="space-y-4">
          {dimensionLabels.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-800">{label}</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRatings((prev) => ({ ...prev, [key]: val }))}
                    className={`p-1.5 rounded transition-colors ${
                      ratings[key] >= val ? 'text-amber-500' : 'text-slate-300 hover:text-slate-400'
                    }`}
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                ))}
                <span className="ml-2 font-mono font-bold text-slate-900 w-4 text-center">
                  {ratings[key]}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Written Review */}
        <div>
          <label className="block text-slate-700 font-medium mb-1">
            Optional Commentary (Max 500 characters)
          </label>
          <textarea
            rows={4}
            maxLength={500}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share constructive insights on workshops, schedule, or mentorship..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
          />
          <span className="text-[10px] text-slate-500 block text-right mt-1">
            {comment.length}/500
          </span>
        </div>

        <Button
          type="submit"
          variant="quality"
          isLoading={isSubmitting}
          className="w-full py-2.5"
        >
          Publish Verified Review
        </Button>
      </form>
    </div>
  );
}
