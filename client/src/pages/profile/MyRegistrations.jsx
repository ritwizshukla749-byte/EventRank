import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { attendanceApi, registrationsApi } from '../../api/featuresApi';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Calendar, CheckCircle2, QrCode, MessageSquare, ArrowRight } from 'lucide-react';

export function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCheckInEditionId, setActiveCheckInEditionId] = useState(null);
  const [checkInToken, setCheckInToken] = useState('');
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInMessage, setCheckInMessage] = useState(null);

  const fetchRegistrations = () => {
    setIsLoading(true);
    registrationsApi.mine()
      .then((data) => setRegistrations(data.registrations || []))
      .catch(() => setRegistrations([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleCheckIn = async (editionId) => {
    setCheckInLoading(true);
    setCheckInMessage(null);
    try {
      await attendanceApi.checkIn(editionId, checkInToken);
      setCheckInMessage({ type: 'success', text: 'Attendance verified! You can now submit an official review.' });
      setTimeout(() => {
        setActiveCheckInEditionId(null);
        setCheckInToken('');
        fetchRegistrations();
      }, 1500);
    } catch (err) {
      setCheckInMessage({ type: 'error', text: err.message || 'Invalid or expired check-in code.' });
    } finally {
      setCheckInLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-indigo-400" />
          <span>My Event Registrations</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Track upcoming events, verify your on-campus attendance, and leave peer-reviewed feedback.
        </p>
      </div>

      {registrations.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No registered events"
          description="You haven't registered for any campus events yet. Explore events across colleges to join!"
          actionLabel="Discover Events"
          onAction={() => window.location.assign('/discover')}
        />
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => {
            const edition = reg.edition || {};
            const event = reg.event || {};
            const isAttended = !!reg.hasAttendance;
            const isCancelled = reg.status === 'cancelled';

            return (
              <div
                key={reg._id}
                className="p-5 rounded-2xl border border-white/10 bg-[#121826]/70 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant={isAttended ? 'success' : 'default'} size="sm">
                      {isAttended ? 'Attendance Verified' : isCancelled ? 'Cancelled' : 'Registered'}
                    </Badge>
                    <span className="text-[11px] font-mono text-slate-400">
                      {edition.startAt ? new Date(edition.startAt).toLocaleDateString() : 'Upcoming'}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-100">{event.title || 'Event'}</h3>
                  <p className="text-xs text-slate-400">{edition.venue || 'Campus Venue'}</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {!isAttended && !isCancelled && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setActiveCheckInEditionId(edition._id)}
                      className="text-xs gap-1.5 w-full sm:w-auto"
                    >
                      <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Check-In Code</span>
                    </Button>
                  )}

                  {isAttended && (
                    <Link to={`/events/${edition._id}/review`}>
                      <Button size="sm" variant="quality" className="text-xs gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Write Review</span>
                      </Button>
                    </Link>
                  )}

                  <Link to={`/events/${edition._id}`}>
                    <Button size="sm" variant="ghost" className="text-xs">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Check-In Modal Dialog */}
      {activeCheckInEditionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-sm w-full p-6 rounded-2xl border border-white/10 bg-[#121826] shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-indigo-400" />
              <span>Verify Attendance</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter the 6-character check-in code provided by the organizer at the venue to unlock verified attendee status.
            </p>

            {checkInMessage && (
              <div
                className={`p-2.5 rounded-lg text-xs ${
                  checkInMessage.type === 'success'
                    ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-950/30 text-rose-300 border border-rose-500/30'
                }`}
              >
                {checkInMessage.text}
              </div>
            )}

            <div>
              <input
                type="text"
                placeholder="ENTER CODE (e.g. AB12CD)"
                value={checkInToken}
                onChange={(e) => setCheckInToken(e.target.value.toUpperCase())}
                className="w-full text-center tracking-widest font-mono text-sm uppercase px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setActiveCheckInEditionId(null);
                  setCheckInToken('');
                  setCheckInMessage(null);
                }}
                className="w-1/2"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={checkInLoading}
                disabled={!checkInToken.trim()}
                onClick={() => handleCheckIn(activeCheckInEditionId)}
                className="w-1/2"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
