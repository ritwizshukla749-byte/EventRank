import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { Calendar, MapPin, Users, Bookmark, ArrowRight, HelpCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { useCompare } from '../../context/CompareContext';
import { registrationsApi } from '../../api/featuresApi';

// Map the server Event Quality status to a human evidence label (never invented by the client)
const QUALITY_LABEL = {
  review_supported: 'Review-backed',
  provisional: 'Provisional Signal',
  insufficient_evidence: 'Insufficient Evidence',
};

export function EventCard({ event, isAuthenticated = false, onRegisterChange }) {
  const { isSelected, toggleEvent, canAddMore } = useCompare();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

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
    if (!isAuthenticated) {
      window.location.assign('/login');
      return;
    }
    setIsRegistering(true);
    try {
      await registrationsApi.register(event._id);
      if (onRegisterChange) onRegisterChange();
    } catch (err) {
      alert(err.message || 'Registration failed');
    } finally {
      setIsRegistering(false);
    }
  };

  // Color coding by college
  const getCollegeBadgeStyle = (name = '') => {
    if (name.includes('Cascade')) return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30';
    if (name.includes('Northbridge')) return 'bg-amber-950/80 text-amber-300 border-amber-500/30';
    if (name.includes('St. Jude') || name.includes('Art')) return 'bg-teal-950/80 text-teal-300 border-teal-500/30';
    return 'bg-indigo-950/80 text-indigo-300 border-indigo-500/30';
  };

  return (
    <Card className="flex flex-col justify-between overflow-hidden border border-white/10 bg-[#0d121f] rounded-2xl hover:border-white/20 transition-all duration-300 shadow-xl group">
      <div>
        {/* Card Header Hero Banner */}
        <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-black/80 flex items-center justify-center p-6 text-center">
            <span className="text-sm font-semibold tracking-wide text-slate-200 uppercase font-mono">
              {title}
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d121f] via-transparent to-black/40" />

          {/* Top Floating Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border backdrop-blur-md font-medium shadow-md ${getCollegeBadgeStyle(hostCollege.name)}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>{hostCollege.name || 'Campus'}</span>
            </span>

            <button
              type="button"
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/10 backdrop-blur-md pointer-events-auto transition-colors"
              title="Save Event"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-indigo-400 text-indigo-400' : ''}`} />
            </button>
          </div>

          {/* Bottom Banner Labels (Format & Cost) */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
            <span className="px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono font-bold tracking-wider text-white uppercase border border-white/10">
              {editionLabel}
            </span>
            <span className={`px-2.5 py-0.5 rounded-md font-mono font-bold text-xs shadow-md ${cost === 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-600/90 text-white'}`}>
              {cost === 0 ? 'Free ($0)' : `${currencySymbol}${cost}`}
            </span>
          </div>
        </div>

        {/* Card Content Area */}
        <div className="p-5 space-y-3.5">
          <div>
            <Link to={`/events/${event._id}`}>
              <h3 className="text-base font-bold text-white hover:text-indigo-300 transition-colors line-clamp-1">
                {title}
              </h3>
            </Link>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Host: <span className="text-slate-300 font-medium">{organizer.name || 'Student Chapter'}</span>
            </p>
          </div>

          {/* Tag Chips */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Short description */}
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {eventInfo.description || 'No description provided.'}
          </p>

          {/* Date & Location */}
          <div className="space-y-1 text-xs text-slate-400 font-medium pt-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="text-slate-300">{formatDate(event.startAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{venue}</span>
            </div>
          </div>

          {/* Dual Score Panels: Event Quality vs Fit for You (strictly separated) */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            {/* Event Quality Panel */}
            <div className="p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-950/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 mb-1">
                  <span className="font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>EVENT QUALITY</span>
                  </span>
                  <HelpCircle className="w-2.5 h-2.5 opacity-60" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {qualityScore !== null ? qualityScore : '--'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">/ 100</span>
                </div>
              </div>
              <p className={`text-[9px] font-mono mt-2 line-clamp-1 ${quality.status === 'review_supported' ? 'text-emerald-300' : 'text-amber-300'}`}>
                {qualityEvidence}
              </p>
            </div>

            {/* Fit for You Panel */}
            <div className="p-2.5 rounded-xl border border-indigo-500/20 bg-indigo-950/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-indigo-400 mb-1">
                  <span className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>FIT FOR YOU</span>
                  </span>
                  <HelpCircle className="w-2.5 h-2.5 opacity-60" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold font-mono text-indigo-400">
                    {fitScore !== null ? fitScore : '--'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">/ 100</span>
                </div>
              </div>
              <p className="text-[9px] text-slate-400 mt-2 line-clamp-1">
                {isAuthenticated
                  ? (fitReason ? fitReason.replace(/_/g, ' ').toLowerCase() : 'Complete your profile for a match score')
                  : 'Sign in for personalization'}
              </p>
            </div>
          </div>

          {/* Authoritative Registration Count */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Registered students:</span>
            </div>
            <span className="font-mono font-bold text-slate-200">{regCount} students</span>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-4 bg-white/[0.02] border-t border-white/10 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => toggleEvent(event)}
          disabled={!selected && !canAddMore}
          className={`text-xs font-mono px-2 py-1.5 rounded-lg border transition-colors ${
            selected
              ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
              : 'text-slate-400 hover:text-white border-transparent hover:border-white/10'
          }`}
        >
          {selected ? '✓ Comparing' : '+ Compare'}
        </button>

        <div className="flex items-center gap-2">
          <Link
            to={`/events/${event._id}`}
            className="text-xs font-medium text-slate-300 hover:text-white px-2 py-1.5 rounded transition-colors inline-flex items-center gap-1"
          >
            <span>Details</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          {isAuthenticated ? (
            <button
              onClick={handleRegister}
              disabled={isRegistering}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {isRegistering ? 'Registering...' : 'Register'}
            </button>
          ) : (
            <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-slate-300 border border-white/10">
              Sign in to register
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}