import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventsApi } from '../../api/eventsApi';
import { collegesApi } from '../../api/featuresApi';
import { useAuth } from '../../context/AuthContext';
import { EventCard } from '../../components/events/EventCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Search, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';

export function Discover() {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

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
        setEvents(data.events || []);
        setError(null);
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
  }, []);

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
      <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-[#12182b] via-[#0d121f] to-[#07090e] p-8 sm:p-10 shadow-2xl overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Top Pill Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Multi-College Student Network</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {isAuthenticated
                  ? `Scoring for: ${user?.name || 'You'}${user?.department ? ` (${user.department} - ${user?.collegeName || 'your college'})` : ''}`
                  : 'Personalized scoring after sign-in'}
              </span>
            </span>
          </div>

          {/* Hero Title & Subtitle */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
            Discover campus events that are actually worth your weekend.
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Never waste an evening on a bad workshop. EventRank cuts through flyer hype using real attendee benchmarks (<strong className="text-emerald-400">Event Quality</strong>) and custom recommendations based on your major and budget (<strong className="text-indigo-400">Fit for You</strong>).
          </p>

          {/* Quick College Shortcuts */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs">
            <button
              onClick={() => updateParam('collegeId', '')}
              className={`px-3 py-1.5 rounded-lg border font-mono transition-colors ${
                !collegeFilter
                  ? 'bg-white/10 text-white border-white/20'
                  : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              All Participating Colleges
            </button>
            <span className="px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/30 text-emerald-300 font-mono text-[11px]">
              🌲 Cascade Poly: Hackathons & Robotics
            </span>
            <span className="px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-950/30 text-amber-300 font-mono text-[11px]">
              💼 Northbridge: Venture & Pitching
            </span>
            <span className="px-3 py-1.5 rounded-lg border border-teal-500/30 bg-teal-950/30 text-teal-300 font-mono text-[11px]">
              🎨 St. Jude: UI/UX & Design Systems
            </span>
          </div>
        </div>
      </div>

      {/* Modern Filter, Campus Toggle & Search Controls */}
      <div className="p-5 rounded-2xl border border-white/10 bg-[#0d121f]/90 backdrop-blur-xl shadow-xl space-y-4">
        {/* Row 1: Search Input + Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search events, courses (CS 240), topics (AI, ROS2, Figma, Pitching)..."
              value={searchFilter}
              onChange={(e) => updateParam('q', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 shrink-0 font-medium hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="px-3.5 py-2.5 bg-[#121826] border border-white/10 rounded-xl text-xs text-indigo-300 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="fit">✨ Best Fit for You (Personalized)</option>
              <option value="quality">🛡 Highest Event Quality (Bayesian)</option>
              <option value="upcoming">📅 Upcoming Date</option>
            </select>
          </div>
        </div>

        {/* Row 2: Campus Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5 text-xs">
          <span className="text-slate-400 font-mono text-[11px] mr-1">Campus:</span>
          <button
            onClick={() => updateParam('collegeId', '')}
            className={`px-3 py-1 rounded-lg font-mono transition-colors ${
              !collegeFilter ? 'bg-white text-slate-900 font-bold' : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            All Colleges
          </button>
          {colleges.map((c) => (
            <button
              key={c._id}
              onClick={() => updateParam('collegeId', c._id)}
              className={`px-3 py-1 rounded-lg font-mono transition-colors ${
                collegeFilter === c._id
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Row 3: Category Pills & Quick Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {['All Types', 'Hackathon', 'Workshop', 'Conference', 'Social'].map((typeLabel) => {
              const val = typeLabel === 'All Types' ? '' : typeLabel.toLowerCase();
              const isSelected = typeFilter === val;
              return (
                <button
                  key={typeLabel}
                  onClick={() => updateParam('type', val)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    isSelected
                      ? 'bg-white/20 text-white font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
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
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                maxCostParam
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              Free Only ($0)
            </button>
          </div>
        </div>

        {/* Status indicator bar */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-white/5 font-mono">
          <span>Found <strong className="text-slate-200">{events.length}</strong> eligible events across colleges</span>
          <span className="text-indigo-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Cross-campus discovery active</span>
          </span>
        </div>
      </div>

      {/* Events Results Grid */}
      {isLoading ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
