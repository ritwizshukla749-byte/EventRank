import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsApi } from '../../api/eventsApi';
import { attendanceApi, organizersApi } from '../../api/featuresApi';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { PlusCircle, QrCode, Calendar, Users, Eye } from 'lucide-react';

export function OrganizerDashboard() {
  const { error: showError, success: showSuccess } = useToast();
  const [organizer, setOrganizer] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTokenData, setActiveTokenData] = useState(null);
  const [tokenLoading, setTokenLoading] = useState(false);

  useEffect(() => {
    organizersApi.me()
      .then((data) => setOrganizer(data.organizer || null))
      .catch(() => setOrganizer(null));
  }, []);

  useEffect(() => {
    if (!organizer?._id) {
      setIsLoading(false);
      return;
    }
    
    // Use server-side filtering instead of client-side
    eventsApi.list({ 
      organizerId: organizer._id,
      includeScores: true,
      sort: 'upcoming',
      limit: 100 // Reasonable limit for organizer's own events
    })
      .then((data) => {
        const list = data.events || [];
        setEvents(list);
      })
      .catch(() => setEvents([]))
      .finally(() => setIsLoading(false));
  }, [organizer]);

  const handleGenerateCheckIn = async (editionId) => {
    setTokenLoading(true);
    try {
      const res = await attendanceApi.generateToken(editionId);
      setActiveTokenData(res);
      showSuccess('Check-in token generated successfully');
    } catch (err) {
      showError(err.message || 'Failed to generate token');
    } finally {
      setTokenLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Organizer Portal</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              College Scoped
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Manage your campus editions, generate verified check-in codes, and monitor attendance.
          </p>
        </div>

        <Link to="/organizer/events/new">
          <Button variant="primary" size="sm" className="gap-2">
            <PlusCircle className="w-4 h-4" />
            <span>Create New Event</span>
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events created yet"
          description="Create your first event edition to start accepting cross-college student registrations."
          actionLabel="Create Event"
          onAction={() => window.location.assign('/organizer/events/new')}
        />
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const qualityScore = typeof event.quality?.score === 'number' ? Math.round(event.quality.score) : null;
            return (
              <div
                key={event._id}
                className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="info" size="sm">
                      {event.event?.eventType || 'other'}
                    </Badge>
                    <span className="text-xs text-slate-500 font-mono">
                      {event.startAt ? new Date(event.startAt).toLocaleDateString() : 'TBD'}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">{event.event?.title || event.title}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {event.venue || 'Venue TBA'} • {event.registrationCount || 0} registered
                    {qualityScore !== null ? ` • Event Quality: ${qualityScore}/100` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-xs gap-1.5 flex-1 md:flex-none"
                    disabled={tokenLoading}
                    onClick={() => handleGenerateCheckIn(event._id)}
                  >
                    <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Check-In Code</span>
                  </Button>

                  <Link to={`/events/${event._id}`} className="flex-1 md:flex-none">
                    <Button variant="ghost" size="sm" className="text-xs gap-1.5 w-full">
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Check-In Code Modal */}
      {activeTokenData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-sm w-full p-6 rounded-2xl border border-slate-200 bg-white shadow-xl text-center space-y-4">
            <h3 className="text-base font-semibold text-slate-900">Event Attendance Code</h3>
            <p className="text-xs text-slate-600">
              Display this 6-character code at the venue. Attendees enter this code in their dashboard to verify attendance.
            </p>

            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 font-mono font-bold text-2xl tracking-widest text-indigo-700">
              {activeTokenData.checkInToken || activeTokenData.token || 'ACTIVE'}
            </div>

            <p className="text-[11px] text-slate-500 font-mono">
              Valid for verified student check-in
            </p>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setActiveTokenData(null)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
