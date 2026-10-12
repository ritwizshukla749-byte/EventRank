/**
 * MySavedEvents - User's bookmarked/saved events page
 * Shows all events the user has saved for later
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { savedEventsApi } from '../../api/savedEventsApi';
import { useAuth } from '../../context/AuthContext';
import { useSavedEvents } from '../../hooks/useSavedEvents';
import { EventCard } from '../../components/events/EventCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { SkeletonCardList } from '../../components/common/SkeletonCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Bookmark, Heart, Calendar } from 'lucide-react';

export function MySavedEvents() {
  const { isAuthenticated } = useAuth();
  const { isSaved, toggleSaved } = useSavedEvents(isAuthenticated);
  
  const [savedEvents, setSavedEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSavedEvents = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { savedEvents: events } = await savedEventsApi.list();
      
      // Extract edition objects from saved events
      const editions = events.map(se => {
        // Handle both populated and non-populated editionId
        if (typeof se.editionId === 'object') {
          return se.editionId;
        }
        return null;
      }).filter(Boolean);
      
      setSavedEvents(editions);
      setError(null);
    } catch (err) {
      console.error('Failed to load saved events:', err);
      setError(err.message || 'Failed to load saved events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSavedEvents();
  }, [isAuthenticated]);

  const handleToggleBookmark = async (editionId, eventTitle) => {
    await toggleSaved(editionId, eventTitle);
    // Reload saved events after toggle (removes unsaved from list)
    await loadSavedEvents();
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 py-12">
        <EmptyState
          icon={Bookmark}
          title="Sign in to view saved events"
          description="Create an account or sign in to bookmark events and access them later."
          actionLabel="Sign In"
          onAction={() => window.location.assign('/login')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <Bookmark className="w-6 h-6 text-amber-600 fill-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Saved Events</h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Events you've bookmarked for later review
            </p>
          </div>
        </div>

        {!isLoading && savedEvents.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-mono">
              <strong className="text-slate-900">{savedEvents.length}</strong> saved event{savedEvents.length === 1 ? '' : 's'}
            </span>
            <Link
              to="/discover"
              className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              Discover more events →
            </Link>
          </div>
        )}
      </div>

      {/* Saved Events Grid */}
      {isLoading ? (
        <SkeletonCardList count={3} />
      ) : error ? (
        <div className="p-6 rounded-2xl border border-rose-200 bg-rose-50 text-center text-sm text-rose-800 shadow-xs">
          <p className="font-semibold mb-2">Failed to load saved events</p>
          <p className="text-xs text-rose-600">{error}</p>
          <button
            onClick={loadSavedEvents}
            className="mt-4 px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : savedEvents.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No saved events yet"
          description="Bookmark events you're interested in to access them quickly later. Look for the bookmark icon on event cards."
          actionLabel="Browse Events"
          onAction={() => window.location.assign('/discover')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedEvents.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              isAuthenticated={isAuthenticated}
              onRegisterChange={loadSavedEvents}
              isSaved={isSaved(event._id)}
              onToggleBookmark={handleToggleBookmark}
            />
          ))}
        </div>
      )}

      {/* Help Section */}
      {!isLoading && savedEvents.length > 0 && (
        <div className="p-6 rounded-2xl border border-indigo-100 bg-indigo-50/30 text-sm">
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-indigo-900 mb-1">
                Saved events are private
              </p>
              <p className="text-xs text-indigo-800 leading-relaxed">
                Your bookmarks are only visible to you. They help you keep track of events you're considering without committing to registration yet.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
