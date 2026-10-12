import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { BookmarkButton } from './BookmarkButton';
import { Calendar, MapPin, Users, ArrowRight, HelpCircle, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useCompare } from '../../context/CompareContext';
import { registrationsApi } from '../../api/featuresApi';
import { useToast } from '../../hooks/useToast';

// Map the server Event Quality status to a human evidence label (never invented by the client)
const QUALITY_LABEL = {
  review_supported: 'Review-backed',
  provisional: 'Provisional Signal',
  insufficient_evidence: 'Insufficient Evidence',
};

export function EventCard({ event, isAuthenticated = false, onRegisterChange, isSaved = false, onToggleBookmark }) {
  const { isSelected, toggleEvent, canAddMore } = useCompare();
  const { error: showError, success: showSuccess } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isRegistered, setIsRegistered] = useState(!!event.isRegistered);

  console.log('[EventCard] Rendering', event.event?.title || event.title, '- isRegistered:', isRegistered, 'event.isRegistered:', event.isRegistered);

  // `event` is a server-published event edition list item (see GET /events contract)
  const selected = isSelected(event._id);
  const eventInfo = event.event || {};
  const hostCollege = event.hostCollege || {};
  const organizer = event.organizer || {};

  // Strictly separate Event Quality and Fit for You (server-issued, never fabricated)
  const quality = event.quality || {};
  const fit = event.fit || {};
  const qualityScore = typeof quality.score === 'number' ? Math.round(quality.score) : null;
  const qualityEvidence = QUALITY_LABEL[quality.status] || 'Insufficient Evidence';
  const reviewCount = quality.eligibleReviewCount || 0;
  const fitScore = typeof fit.score === 'number' ? Math.round(fit.score) : null;
  const fitReason = fit.reasonCodes?.[0];

  const title = eventInfo.title || event.title || 'Untitled Event';
  const editionLabel = event.editionLabel || 'EVENT';
  const venue = event.venue || 'Venue TBA';
  const cost = event.costAmount ?? 0;
  const currencySymbol = event.currency === 'USD' ? '$' : '₹';
  const tags = eventInfo.tags || [];
  const regCount = event.registrationCount ?? 0;

  const formatDate = (date) => {
    if (!date) return 'Date TBA';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    console.log('[EventCard] handleRegister called for', event._id);
    if (!isAuthenticated) {
      window.location.assign('/login');
      return;
    }
    setIsRegistering(true);
    console.log('[EventCard] Starting registration...');
    try {
      const result = await registrationsApi.register(event._id);
      console.log('[EventCard] Registration successful, result:', result);
      setIsRegistered(true);
      console.log('[EventCard] Set isRegistered to true');
      showSuccess('Successfully registered for event!');
      if (onRegisterChange) onRegisterChange();
    } catch (err) {
      console.error('[EventCard] Registration failed:', err);
      showError(err.message || 'Registration failed');
    } finally {
      setIsRegistering(false);
      console.log('[EventCard] Registration action complete');
    }
  };

  const handleBookmarkToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      showError('Please sign in to save events');
      return;
    }

    if (!onToggleBookmark) return;

    setIsBookmarking(true);
    try {
      await onToggleBookmark(event._id, title);
    } finally {
      setIsBookmarking(false);
    }
  };

  // Color coding by college
  const getCollegeBadgeStyle = (name = '') => {
    if (name.includes('Cascade')) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (name.includes('Northbridge')) return 'bg-amber-50 text-amber-800 border-amber-200';
    if (name.includes('St. Jude') || name.includes('Art')) return 'bg-teal-50 text-teal-800 border-teal-200';
    return 'bg-indigo-50 text-indigo-800 border-indigo-200';
  };

  return (
    <Card className="flex flex-col justify-between overflow-hidden border border-slate-200 bg-white rounded-2xl hover:border-slate-300 hover:shadow-md transition-all duration-300 shadow-xs group">
      <div>
        {/* Card Header Hero Banner */}
        <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-indigo-50/80 via-purple-50/60 to-slate-100 flex items-center justify-center p-6 text-center">
            <span className="text-sm font-semibold tracking-wide text-slate-800 uppercase font-mono">
              {title}
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent" />

          {/* Top Floating Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border font-medium shadow-xs ${getCollegeBadgeStyle(hostCollege.name)}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>{hostCollege.name || 'Campus'}</span>
            </span>

            <div className="pointer-events-auto">
              <BookmarkButton
                isSaved={isSaved}
                onToggle={handleBookmarkToggle}
                isLoading={isBookmarking}
                size="sm"
              />
            </div>
          </div>

          {/* Bottom Banner Labels (Format & Cost) */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
            <span className="px-2 py-0.5 rounded bg-white text-[10px] font-mono font-bold tracking-wider text-slate-700 uppercase border border-slate-200 shadow-xs">
              {editionLabel}
            </span>
            <span className={`px-2.5 py-0.5 rounded-md font-mono font-bold text-xs shadow-xs ${cost === 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-emerald-600 text-white'}`}>
              {cost === 0 ? 'Free ($0)' : `${currencySymbol}${cost}`}
            </span>
          </div>
        </div>

        {/* Card Content Area */}
        <div className="p-5 space-y-3.5">
          <div>
            <Link to={`/events/${event._id}`}>
              <h3 className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1">
                {title}
              </h3>
            </Link>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Host: <span className="text-slate-700 font-medium">{organizer.name || 'Student Chapter'}</span>
            </p>
          </div>

          {/* Tag Chips */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Short description */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {eventInfo.description || 'No description provided.'}
          </p>

          {/* Date & Location */}
          <div className="space-y-1 text-xs text-slate-600 font-medium pt-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-800">{formatDate(event.startAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate text-slate-600">{venue}</span>
            </div>
          </div>

          {/* Dual Score Panels: Event Quality vs Fit for You (strictly separated) */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            {/* Event Quality Panel */}
            <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-emerald-800 mb-1">
                  <span className="font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>EVENT QUALITY</span>
                  </span>
                  <HelpCircle className="w-2.5 h-2.5 opacity-60" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold font-mono text-emerald-700">
                    {qualityScore !== null ? qualityScore : '--'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">/ 100</span>
                </div>
              </div>
              <p className={`text-[9px] font-mono mt-2 line-clamp-1 font-medium ${quality.status === 'review_supported' ? 'text-emerald-700' : 'text-amber-800'}`}>
                {qualityEvidence}
              </p>
            </div>

            {/* Fit for You Panel */}
            <div className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-indigo-800 mb-1">
                  <span className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    <span>FIT FOR YOU</span>
                  </span>
                  <HelpCircle className="w-2.5 h-2.5 opacity-60" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold font-mono text-indigo-700">
                    {fitScore !== null ? fitScore : '--'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">/ 100</span>
                </div>
              </div>
              <p className="text-[9px] text-slate-600 mt-2 line-clamp-1">
                {isAuthenticated
                  ? (fitReason ? fitReason.replace(/_/g, ' ').toLowerCase() : 'Complete your profile for a match score')
                  : 'Sign in for personalization'}
              </p>
            </div>
          </div>

          {/* Authoritative Registration Count */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Registered students:</span>
            </div>
            <span className="font-mono font-bold text-slate-800">{regCount} students</span>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => toggleEvent(event)}
          disabled={!selected && !canAddMore}
          className={`text-xs font-mono px-2 py-1.5 rounded-lg border transition-colors cursor-pointer ${
            selected
              ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-semibold'
              : 'text-slate-600 hover:text-slate-900 border-transparent hover:border-slate-200 hover:bg-slate-100'
          }`}
        >
          {selected ? '✓ Comparing' : '+ Compare'}
        </button>

        <div className="flex items-center gap-2">
          <Link
            to={`/events/${event._id}`}
            className="text-xs font-medium text-slate-700 hover:text-indigo-600 px-2 py-1.5 rounded transition-colors inline-flex items-center gap-1"
          >
            <span>Details</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          {isAuthenticated ? (
            isRegistered ? (
              <span className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Registered ✓
              </span>
            ) : (
              <button
                onClick={handleRegister}
                disabled={isRegistering}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isRegistering ? 'Registering...' : 'Register'}
              </button>
            )
          ) : (
            <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
              Sign in to register
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}