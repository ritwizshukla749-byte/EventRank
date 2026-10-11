import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventsApi } from '../../api/eventsApi';
import { scoringApi, registrationsApi } from '../../api/featuresApi';
import { useAuth } from '../../context/AuthContext';
import { useCompare } from '../../context/CompareContext';
import { DualScoreCard } from '../../components/scores/DualScoreCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Calendar, MapPin, Users, Award, ArrowLeft, Layers, CheckCircle, ShieldCheck } from 'lucide-react';

export function EventDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { isSelected, toggleEvent } = useCompare();

  const [edition, setEdition] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [signals, setSignals] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    Promise.allSettled([
      eventsApi.getById(id),
      scoringApi.getScore(id),
      registrationsApi.getSignals(id),
      isAuthenticated ? registrationsApi.getStatus(id) : Promise.resolve(null),
    ]).then(([eventRes, scoreRes, signalRes, regRes]) => {
      if (isCancelled) return;

      if (eventRes.status === 'fulfilled') {
        const editionData = eventRes.value.edition;
        setEdition(editionData);
        setIsRegistered(!!editionData.isRegistered);
      } else {
        setError('Failed to load event details.');
      }

      if (scoreRes.status === 'fulfilled') {
        setScoreData(scoreRes.value);
      }

      if (signalRes.status === 'fulfilled') {
        setSignals(signalRes.value.signals);
      }

      if (regRes?.status === 'fulfilled' && regRes.value) {
        setIsRegistered(!!regRes.value.isRegistered);
      }

      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [id, isAuthenticated]);

  const handleRegisterToggle = async () => {
    if (!isAuthenticated) return;
    setIsRegistering(true);
    try {
      if (isRegistered) {
        await registrationsApi.cancel(id);
        setIsRegistered(false);
      } else {
        await registrationsApi.register(id);
        setIsRegistered(true);
      }
    } catch (err) {
      alert(err.message || 'Registration action failed');
    } finally {
      setIsRegistering(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !edition) {
    return (
      <div className="p-6 rounded-2xl border border-rose-500/20 bg-rose-950/20 text-center text-xs text-rose-300">
        {error || 'Event not found.'}
        <div className="mt-4">
          <Link to="/discover" className="underline hover:text-white">
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

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to="/discover"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Discover</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-[#121826] to-[#0a0d14] relative overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="college">{college.name || 'Participating College'}</Badge>
          <Badge variant="info">
            {edition.allowedColleges?.length ? 'Restricted to listed colleges' : 'Open to all participating colleges'}
          </Badge>
          {eventSeries.eventType && <Badge>{eventSeries.eventType}</Badge>}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
          {eventSeries.title}
        </h1>

        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed mb-6">
          {eventSeries.description || 'No detailed description available.'}
        </p>

        <p className="text-xs text-slate-400 mb-4">
          <strong className="text-slate-200">Organizer:</strong> {organizer.name || 'Student Chapter'}
        </p>

        {eventSeries.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {eventSeries.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Key Event Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-white/10 text-xs">
          <div>
            <span className="block text-slate-500 text-[10px] uppercase font-mono">Date & Time</span>
            <span className="font-medium text-slate-200">{formatDate(edition.startAt)}</span>
          </div>
          <div>
            <span className="block text-slate-500 text-[10px] uppercase font-mono">Location</span>
            <span className="font-medium text-slate-200 truncate block">
              {edition.venue || 'Campus Venue'}
            </span>
          </div>
          <div>
            <span className="block text-slate-500 text-[10px] uppercase font-mono">Cost</span>
            <span className="font-medium text-emerald-400 font-mono">
              {cost === 0 ? 'Free ($0)' : `${currencySymbol}${cost}`}
            </span>
          </div>
          <div>
            <span className="block text-slate-500 text-[10px] uppercase font-mono">Capacity</span>
            <span className="font-medium text-slate-200">
              {edition.capacity ? `${edition.capacity} seats` : 'Open'}
            </span>
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
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>{isComparing ? 'Remove from Compare' : 'Add to Compare'}</span>
            </Button>
          </div>

          {isRegistered && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>You are registered for this event</span>
            </div>
          )}
        </div>
      </div>

      {/* Dual Score Evaluation Section */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-200">
          Independent Decision Scores
        </h2>
        <DualScoreCard
          quality={scoreData?.eventQuality || null}
          fit={scoreData?.fitForYou || null}
          isAuthenticated={isAuthenticated}
        />
      </section>

      {/* Pre-Event Trust Signals & Peer Attendance (privacy-safe) */}
      <section className="p-6 rounded-2xl border border-white/10 bg-[#121826]/50 backdrop-blur-md space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          <span>Pre-Event Community & Trust Signals</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
            <span className="block text-[11px] text-slate-400">Total Registered</span>
            <span className="text-lg font-bold font-mono text-slate-100">
              {signals?.totalRegistrations ?? edition.registrationCount ?? 0}
            </span>
            <span className="block text-[10px] text-slate-500 mt-1">
              Registration count is a social signal, not event quality.
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
            <span className="block text-[11px] text-slate-400">
              <ShieldCheck className="w-3 h-3 inline -mt-0.5 mr-1 text-emerald-400" />
              Privacy-Safe Peer Signal
            </span>
            {peerSignal ? (
              <>
                <span className="font-mono font-bold text-slate-100 text-base">
                  {peerSignal.countDisplay} peer{peerSignal.countDisplay === '1' ? '' : 's'}
                </span>
                <span className="block text-[10px] text-slate-500 mt-1">
                  {peerSignal.privacyProtected
                    ? 'Small peer counts are privacy-protected.'
                    : 'Students from your college attending.'}
                </span>
              </>
            ) : (
              <span className="text-xs font-medium text-slate-200 mt-1 block">
                Sign in to view peer attendance from your college.
              </span>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
            <span className="block text-[11px] text-slate-400">Organizer Track Record</span>
            {organizerHistory ? (
              <>
                <span className="font-mono font-bold text-slate-100 text-base">
                  {organizerHistory.completedEditionsCount} completed edition(s)
                </span>
                <span className="block text-[10px] text-slate-500 mt-1">
                  Across {organizerHistory.totalEventsCount} event series by {organizer.name || 'this organizer'}.
                </span>
              </>
            ) : (
              <span className="text-xs font-medium text-slate-200 mt-1 block">
                {organizer.name || 'Verified College Organizer'}
              </span>
            )}
          </div>
        </div>

        {pastRating && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs">
            <Award className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="text-amber-200">
              Past editions of this event series average{' '}
              <strong className="font-mono">{pastRating.averageRating}/5</strong> from{' '}
              {pastRating.reviewCount} verified review(s).
            </span>
          </div>
        )}
      </section>
    </div>
  );
}