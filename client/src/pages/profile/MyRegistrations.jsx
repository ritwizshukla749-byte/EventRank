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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-indigo-600" />
          <span>My Event Registrations</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
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
                className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant={isAttended ? 'success' : 'default'} size="sm">
                      {isAttended ? 'Attendance Verified' : isCancelled ? 'Cancelled' : 'Registered'}
                    </Badge>
                    <span className="text-[11px] font-mono text-slate-500">
                      {edition.startAt ? new Date(edition.startAt).toLocaleDateString() : 'Upcoming'}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">{event.title || 'Event'}</h3>
                  <p className="text-xs text-slate-600">{edition.venue || 'Campus Venue'}</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {!isAttended && !isCancelled && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setActiveCheckInEditionId(edition._id)}
                      className="text-xs gap-1.5 w-full sm:w-auto"
                    >
                      <QrCode className="w-3.5 h-3.5 text-indigo-600" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-sm w-full p-6 rounded-2xl border border-slate-200 bg-white shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-indigo-600" />
              <span>Verify Attendance</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter the unique check-in code displayed at the event venue. Codes are 6 alphanumeric characters (e.g., AB12CD).
            </p>

            {checkInMessage && (
              <div
                className={`p-2.5 rounded-lg text-xs font-medium ${
                  checkInMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {checkInMessage.text}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Check-In Code
              </label>
              <input
                type="text"
                placeholder="AB12CD"
                maxLength={6}
                value={checkInToken}
                onChange={(e) => setCheckInToken(e.target.value.toUpperCase())}
                className="w-full text-center tracking-widest font-mono text-lg uppercase px-3 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
              />
              <p className="text-[11px] text-slate-500 mt-1.5 flex items-start gap-1">
                <QrCode className="w-3 h-3 mt-0.5 shrink-0" />
                <span>Find this code on event posters, organizer announcements, or venue check-in displays.</span>
              </p>
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
