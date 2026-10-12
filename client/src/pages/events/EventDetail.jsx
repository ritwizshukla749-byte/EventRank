import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventsApi } from '../../api/eventsApi';
import { scoringApi, registrationsApi } from '../../api/featuresApi';
import { useAuth } from '../../context/AuthContext';
import { useCompare } from '../../context/CompareContext';
import { useToast } from '../../hooks/useToast';
import { buildLoginUrl } from '../../utils/redirectHelpers';
import { DualScoreCard } from '../../components/scores/DualScoreCard';
import { ReviewsSection } from '../../components/reviews/ReviewsSection';
import { BookmarkButton } from '../../components/events/BookmarkButton';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { SkeletonDetail } from '../../components/common/SkeletonDetail';
import { NotFound } from '../errors/NotFound';
import { Calendar, MapPin, Users, Award, ArrowLeft, Layers, CheckCircle, ShieldCheck } from 'lucide-react';

export function EventDetail({ isSaved = false, onToggleBookmark }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isSelected, toggleEvent } = useCompare();
  const { error: showError, success: showSuccess } = useToast();

  const [edition, setEdition] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [signals, setSignals] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    console.log('[EventDetail] Loading event detail for ID:', id, 'isAuthenticated:', isAuthenticated);

    Promise.allSettled([
      eventsApi.getById(id),
      scoringApi.getScore(id),
      registrationsApi.getSignals(id),
      isAuthenticated ? registrationsApi.getStatus(id) : Promise.resolve(null),
    ]).then(([eventRes, scoreRes, signalRes, regRes]) => {
      if (isCancelled) return;

      if (eventRes.status === 'fulfilled') {
        const editionData = eventRes.value.edition;
        console.log('[EventDetail] Event data loaded:', editionData?.event?.title);
        setEdition(editionData);
        // Don't set isRegistered here, wait for regRes
      } else {
        // Check if it's a 404 error
        if (eventRes.reason?.message?.includes('not found') || eventRes.reason?.status === 404) {
          setNotFound(true);
        } else {
          setError('Failed to load event details.');
        }
      }

      if (scoreRes.status === 'fulfilled') {
        setScoreData(scoreRes.value);
      }

      if (signalRes.status === 'fulfilled') {
        setSignals(signalRes.value.signals);
      }

      // Set registration status from the dedicated API call
      if (isAuthenticated && regRes?.status === 'fulfilled' && regRes.value) {
        console.log('[EventDetail] Registration status response:', regRes.value);
        setIsRegistered(!!regRes.value.isRegistered);
        console.log('[EventDetail] Initial isRegistered set to:', !!regRes.value.isRegistered);
      } else {
        console.log('[EventDetail] Not authenticated or no registration response, setting isRegistered to false');
        setIsRegistered(false);
      }

      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [id, isAuthenticated]);

  const handleRegisterToggle = async () => {
    console.log('[EventDetail] handleRegisterToggle called, isAuthenticated:', isAuthenticated, 'isRegistered:', isRegistered);
    
    if (!isAuthenticated) {
      // Redirect to login with current path
      navigate(buildLoginUrl(`/events/${id}`));
      return;
    }
    
    setIsRegistering(true);
    console.log('[EventDetail] Starting registration action, current isRegistered:', isRegistered);
    
    try {
      if (isRegistered) {
        console.log('[EventDetail] Cancelling registration for edition:', id);
        await registrationsApi.cancel(id);
        setIsRegistered(false);
        showSuccess('Registration cancelled successfully');
      } else {
        console.log('[EventDetail] Registering for edition:', id);
        const result = await registrationsApi.register(id);
        console.log('[EventDetail] Registration API response:', result);
        setIsRegistered(true);
        showSuccess('Successfully registered for event!');
      }
      
      // Refetch registration status to ensure consistency
      try {
        console.log('[EventDetail] Fetching fresh registration status');
        const statusRes = await registrationsApi.getStatus(id);
        console.log('[EventDetail] Fresh registration status:', statusRes);
        if (statusRes?.isRegistered !== undefined) {
          console.log('[EventDetail] About to update isRegistered from', isRegistered, 'to', statusRes.isRegistered);
          setIsRegistered(statusRes.isRegistered);
        }
      } catch (statusErr) {
        console.error('[EventDetail] Failed to refresh registration status', statusErr);
      }
    } catch (err) {
      console.error('[EventDetail] Registration action failed:', err);
      showError(err.message || 'Registration action failed');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!isAuthenticated) {
      showError('Please sign in to save events');
      return;
    }

    if (!onToggleBookmark) return;

    setIsBookmarking(true);
    try {
      await onToggleBookmark(id, eventSeries.title || edition.title || 'Event');
    } finally {
      setIsBookmarking(false);
    }
  };

  if (isLoading) {
    return <SkeletonDetail />;
  }

  if (notFound) {
    return <NotFound />;
  }

  if (error || !edition) {
    return (
      <div className="p-6 rounded-2xl border border-rose-200 bg-rose-50 text-center text-xs text-rose-800 shadow-xs">
        {error || 'Event not found.'}
        <div className="mt-4">
          <Link to="/discover" className="underline font-medium hover:text-rose-950">
            Return to discovery
          </Link>
        </div>
      </div>
    );
  }

  const eventSeries = edition.event || {};
  const organizer = eventSeries.organizerId || {};
  const college = edition.hostCollege || {};
  const isComparing = isSelected(edition._id);
  const currencySymbol = edition.currency === 'USD' ? '$' : '₹';
  const cost = edition.costAmount ?? 0;

  const peerSignal = signals?.peersGoing || null;
  const pastRating = signals?.pastEditionRating || null;
  const organizerHistory = signals?.organizerHistory || null;

  const formatDate = (date) => {
    if (!date) return 'TBD';
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Log render to track state changes
  console.log('[EventDetail] Rendering with isRegistered:', isRegistered, 'isRegistering:', isRegistering);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to="/discover"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Discover</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-xs relative overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="college">{college.name || 'Participating College'}</Badge>
          <Badge variant="info">
            {edition.allowedColleges?.length ? 'Restricted to listed colleges' : 'Open to all participating colleges'}
          </Badge>
          {eventSeries.eventType && <Badge>{eventSeries.eventType}</Badge>}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-2">
          {eventSeries.title}
        </h1>

        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed mb-6">
          {eventSeries.description || 'No detailed description available.'}
        </p>

        <p className="text-xs text-slate-500 mb-4">
          <strong className="text-slate-800">Organizer:</strong> {organizer.name || 'Student Chapter'}
        </p>

        {eventSeries.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {eventSeries.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Key Event Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-200 text-xs">
          <div>
            <span className="block text-slate-500 text-[10px] uppercase font-mono">Date & Time</span>
            <span className="font-medium text-slate-800">{formatDate(edition.startAt)}</span>
          </div>
          <div>
            <span className="block text-slate-500 text-[10px] uppercase font-mono">Location</span>
            <span className="font-medium text-slate-800 truncate block">
              {edition.venue || 'Campus Venue'}
            </span>
          </div>
          <div>
            <span className="block text-slate-500 text-[10px] uppercase font-mono">Cost</span>
            <span className="font-medium text-emerald-700 font-mono">
              {cost === 0 ? 'Free ($0)' : `${currencySymbol}${cost}`}
            </span>
          </div>
          <div>
            <span className="block text-slate-500 text-[10px] uppercase font-mono">Capacity</span>
            <span className="font-medium text-slate-800">
              {edition.capacity ? `${edition.capacity} seats` : 'Open'}
            </span>
          </div>
        </div>

        {/* Extended Metadata Grid (Registration Deadline + Eligibility) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs">
          {edition.registrationDeadline && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <span className="block text-[10px] text-amber-700 uppercase font-mono mb-1">
                Registration Deadline
              </span>
              <span className="font-semibold text-amber-900">
                {formatDate(edition.registrationDeadline)}
              </span>
              <p className="text-[10px] text-amber-700 mt-1">
                Register before this date to secure your spot
              </p>
            </div>
          )}
          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
            <span className="block text-[10px] text-indigo-700 uppercase font-mono mb-1">
              Eligibility
            </span>
            {edition.allowedColleges?.length > 0 ? (
              <div>
                <span className="font-semibold text-indigo-900 block mb-1">
                  Restricted Access
                </span>
                <span className="text-[11px] text-indigo-700">
                  Open to: {edition.allowedColleges.map(c => c.name || c).join(', ')}
                </span>
              </div>
            ) : (
              <div>
                <span className="font-semibold text-indigo-900 block">
                  Open to All Colleges
                </span>
                <span className="text-[11px] text-indigo-700">
                  Students from any participating college can register
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                variant={isRegistered ? 'danger' : 'primary'}
                isLoading={isRegistering}
                onClick={handleRegisterToggle}
              >
                {isRegistered ? 'Cancel Registration' : 'Register for Event'}
              </Button>
            ) : (
              <Link to="/login">
                <Button variant="primary">Sign In to Register</Button>
              </Link>
            )}

            <Button
              variant="secondary"
              onClick={() => toggleEvent(edition)}
              className="gap-2"
            >
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>{isComparing ? 'Remove from Compare' : 'Add to Compare'}</span>
            </Button>

            <BookmarkButton
              isSaved={isSaved}
              onToggle={handleBookmarkToggle}
              isLoading={isBookmarking}
              showLabel={true}
              size="md"
            />
          </div>

          {isRegistered && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>You are registered for this event</span>
            </div>
          )}
        </div>
      </div>

      {/* Dual Score Evaluation Section */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900">
          Independent Decision Scores
        </h2>
        <DualScoreCard
          quality={scoreData?.eventQuality || null}
          fit={scoreData?.fitForYou || null}
          isAuthenticated={isAuthenticated}
        />
      </section>

      {/* Pre-Event Trust Signals & Peer Attendance (privacy-safe) */}
      <section className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-600" />
          <span>Pre-Event Community & Trust Signals</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="block text-[11px] text-slate-500">Total Registered</span>
            <span className="text-lg font-bold font-mono text-slate-900">
              {signals?.totalRegistrations ?? edition.registrationCount ?? 0}
            </span>
            <span className="block text-[10px] text-slate-500 mt-1">
              Registration count is a social signal, not event quality.
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="block text-[11px] text-slate-500">
              <ShieldCheck className="w-3 h-3 inline -mt-0.5 mr-1 text-emerald-600" />
              Privacy-Safe Peer Signal
            </span>
            {peerSignal ? (
              <>
                <span className="font-mono font-bold text-slate-900 text-base">
                  {peerSignal.countDisplay} peer{peerSignal.countDisplay === '1' ? '' : 's'}
                </span>
                <span className="block text-[10px] text-slate-500 mt-1">
                  {peerSignal.privacyProtected
                    ? 'Small peer counts are privacy-protected.'
                    : 'Students from your college attending.'}
                </span>
              </>
            ) : (
              <span className="text-xs font-medium text-slate-700 mt-1 block">
                Sign in to view peer attendance from your college.
              </span>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="block text-[11px] text-slate-500">Organizer Track Record</span>
            {organizerHistory ? (
              <>
                <span className="font-mono font-bold text-slate-900 text-base">
                  {organizerHistory.completedEditionsCount} completed edition(s)
                </span>
                <span className="block text-[10px] text-slate-500 mt-1">
                  Across {organizerHistory.totalEventsCount} event series by {organizer.name || 'this organizer'}.
                </span>
              </>
            ) : (
              <span className="text-xs font-medium text-slate-700 mt-1 block">
                {organizer.name || 'Verified College Organizer'}
              </span>
            )}
          </div>
        </div>

        {pastRating && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
            <Award className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="text-amber-900">
              Past editions of this event series average{' '}
              <strong className="font-mono">{pastRating.averageRating}/5</strong> from{' '}
              {pastRating.reviewCount} verified review(s).
            </span>
          </div>
        )}
      </section>

      {/* Verified Reviews Section */}
      {edition && edition._id && (
        <ReviewsSection
          eventEditionId={edition._id}
          eventTitle={eventSeries.title}
          isAuthenticated={isAuthenticated}
        />
      )}
    </div>
  );
}