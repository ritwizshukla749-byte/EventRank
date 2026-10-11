import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsApi } from '../../api/eventsApi';
import { attendanceApi, organizersApi } from '../../api/featuresApi';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { PlusCircle, QrCode, Calendar, Users, Eye } from 'lucide-react';

export function OrganizerDashboard() {
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
    eventsApi.list({ limit: 50 })
      .then((data) => {
        const list = data.events || [];
        setEvents(list.filter((e) => e.organizer?._id === organizer._id));
      })
      .catch(() => setEvents([]))
      .finally(() => setIsLoading(false));
  }, [organizer]);

  const handleGenerateCheckIn = async (editionId) => {
    setTokenLoading(true);
    try {
      const res = await attendanceApi.generateToken(editionId);
      setActiveTokenData(res);
    } catch (err) {
      alert(err.message || 'Failed to generate token');
    } finally {
      setTokenLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Organizer Portal</span>
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              College Scoped
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
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
                className="p-5 rounded-2xl border border-white/10 bg-[#121826]/70 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="info" size="sm">
                      {event.event?.eventType || 'other'}
                    </Badge>
                    <span className="text-xs text-slate-400 font-mono">
                      {event.startAt ? new Date(event.startAt).toLocaleDateString() : 'TBD'}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white">{event.event?.title || event.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
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
                    <QrCode className="w-3.5 h-3.5 text-indigo-400" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="max-w-sm w-full p-6 rounded-2xl border border-indigo-500/30 bg-[#121826] shadow-2xl text-center space-y-4">
            <h3 className="text-base font-semibold text-white">Event Attendance Code</h3>
            <p className="text-xs text-slate-400">
              Display this 6-character code at the venue. Attendees enter this code in their dashboard to verify attendance.
            </p>

            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 font-mono font-bold text-2xl tracking-widest text-indigo-300">
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
