import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventsApi } from '../../api/eventsApi';
import { collegesApi } from '../../api/featuresApi';
import { useAuth } from '../../context/AuthContext';
import { useSavedEvents } from '../../hooks/useSavedEvents';
import { EventCard } from '../../components/events/EventCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { SkeletonCardList } from '../../components/common/SkeletonCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Search, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';

export function Discover() {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isSaved, toggleSaved, loadSavedEvents, batchLoadStatus } = useSavedEvents(isAuthenticated);

  const [events, setEvents] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const collegeFilter = searchParams.get('collegeId') || '';
  const searchFilter = searchParams.get('q') || searchParams.get('search') || '';
  const typeFilter = searchParams.get('type') || '';
  const sortBy = searchParams.get('sort') || 'fit';
  const maxCostParam = searchParams.get('maxCost') || '';

  const fetchColleges = async () => {
    try {
      const res = await collegesApi.list();
      const list = Array.isArray(res) ? res : res?.colleges || [];
      setColleges(list);
    } catch (err) {
      console.error('Failed to load colleges', err);
    }
  };

  const fetchEvents = () => {
    setIsLoading(true);
    eventsApi.list({
      collegeId: collegeFilter || undefined,
      q: searchFilter || undefined,
      type: typeFilter || undefined,
      sort: sortBy,
      maxCost: maxCostParam || undefined,
    })
      .then((data) => {
        const eventList = data.events || [];
        setEvents(eventList);
        setError(null);
        
        // Batch load saved status for all events
        if (isAuthenticated && eventList.length > 0) {
          const editionIds = eventList.map(e => e._id);
          batchLoadStatus(editionIds);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load events');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchColleges();
    if (isAuthenticated) {
      loadSavedEvents();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchEvents();
  }, [collegeFilter, searchFilter, typeFilter, sortBy, maxCostParam]);

  const updateParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) {
      next.set(key, val);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Hero Banner */}
      <div className="relative rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/50 p-8 sm:p-10 shadow-xs overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Top Pill Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Multi-College Student Network</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                {isAuthenticated
                  ? `Scoring for: ${user?.name || 'You'}${user?.department ? ` (${user.department} - ${user?.collegeName || 'your college'})` : ''}`
                  : 'Personalized scoring after sign-in'}
              </span>
            </span>
          </div>

          {/* Hero Title & Subtitle */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 max-w-3xl leading-tight">
            Discover campus events that are actually worth your weekend.
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
            Never waste an evening on a bad workshop. EventRank cuts through flyer hype using real attendee benchmarks (<strong className="text-emerald-700 font-semibold">Event Quality</strong>) and custom recommendations based on your major and budget (<strong className="text-indigo-700 font-semibold">Fit for You</strong>).
          </p>

          {/* Quick College Shortcuts */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs">
            <button
              onClick={() => updateParam('collegeId', '')}
              className={`px-3 py-1.5 rounded-lg border font-mono transition-colors cursor-pointer ${
                !collegeFilter
                  ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              All Participating Colleges
            </button>
            <span className="px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 font-mono text-[11px] font-medium">
              🌲 Cascade Poly: Hackathons & Robotics
            </span>
            <span className="px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 font-mono text-[11px] font-medium">
              💼 Northbridge: Venture & Pitching
            </span>
            <span className="px-3 py-1.5 rounded-lg border border-teal-200 bg-teal-50 text-teal-800 font-mono text-[11px] font-medium">
              🎨 St. Jude: UI/UX & Design Systems
            </span>
          </div>
        </div>
      </div>

      {/* Modern Filter, Campus Toggle & Search Controls */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
        {/* Row 1: Search Input + Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search events, courses (CS 240), topics (AI, ROS2, Figma, Pitching)..."
              value={searchFilter}
              onChange={(e) => updateParam('q', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 shrink-0 font-medium hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-indigo-700 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
            >
              <option value="fit">✨ Best Fit for You (Personalized)</option>
              <option value="quality">🛡 Highest Event Quality (Bayesian)</option>
              <option value="upcoming">📅 Upcoming Date</option>
            </select>
          </div>
        </div>

        {/* Row 2: Campus Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-mono text-[11px] mr-1">Campus:</span>
          <button
            onClick={() => updateParam('collegeId', '')}
            className={`px-3 py-1 rounded-lg font-mono transition-colors cursor-pointer ${
              !collegeFilter ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Colleges
          </button>
          {colleges.map((c) => (
            <button
              key={c._id}
              onClick={() => updateParam('collegeId', c._id)}
              className={`px-3 py-1 rounded-lg font-mono transition-colors cursor-pointer ${
                collegeFilter === c._id
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Row 3: Category Pills & Quick Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {['All Types', 'Hackathon', 'Workshop', 'Conference', 'Social'].map((typeLabel) => {
              const val = typeLabel === 'All Types' ? '' : typeLabel.toLowerCase();
              const isSelected = typeFilter === val;
              return (
                <button
                  key={typeLabel}
                  onClick={() => updateParam('type', val)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-medium shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {typeLabel}
                </button>
              );
            })}
          </div>

          {/* Free Only cost filter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateParam('maxCost', maxCostParam ? '' : '0')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                maxCostParam
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-medium'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              Free Only ($0)
            </button>
          </div>
        </div>

        {/* Status indicator bar */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 font-mono">
          <span>Found <strong className="text-slate-800">{events.length}</strong> eligible events across colleges</span>
          <span className="text-indigo-600 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Cross-campus discovery active</span>
          </span>
        </div>
      </div>

      {/* Events Results Grid */}
      {isLoading ? (
        <SkeletonCardList count={6} />
      ) : error ? (
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-950/20 text-rose-300 text-xs">
          {error}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events found"
          description="Try broadening your search or choosing a different participating college."
          actionLabel="Clear all filters"
          onAction={() => {
            setSearchParams({});
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              isAuthenticated={isAuthenticated}
              onRegisterChange={fetchEvents}
              isSaved={isSaved(event._id)}
              onToggleBookmark={toggleSaved}
            />
          ))}
        </div>
      )}
    </div>
  );
}
