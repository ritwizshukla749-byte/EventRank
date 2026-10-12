import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { eventsApi } from '../../api/eventsApi';
import { organizersApi } from '../../api/featuresApi';
import { Button } from '../../components/common/Button';
import { ArrowLeft } from 'lucide-react';

export function CreateEvent() {
  const navigate = useNavigate();

  const [organizer, setOrganizer] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState('workshop');
  const [venue, setVenue] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [capacity, setCapacity] = useState('');
  const [costAmount, setCostAmount] = useState(0);
  const [eligibility, setEligibility] = useState('all_active_colleges');
  const [tags, setTags] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    organizersApi.me().then((data) => {
      setOrganizer(data.organizer || null);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!organizer) {
      setError('No organizer profile found for your account.');
      return;
    }
    setIsLoading(true);
    setError(null);

    const toUtc = (localValue) => {
      if (!localValue) return undefined;
      const d = new Date(localValue);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
    };

    try {
      await eventsApi.create({
        title,
        description,
        organizerId: organizer._id,
        eventType,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        editionLabel: 'Edition 1',
        eligibility,
        startAt: toUtc(startAt),
        endAt: toUtc(endAt),
        timezone: 'UTC',
        venue,
        costAmount: Number(costAmount) || 0,
        currency: 'INR',
        capacity: capacity ? Number(capacity) : null,
      });
      navigate('/organizer');
    } catch (err) {
      setError(err.message || 'Failed to create event.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          to="/organizer"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Organizer Dashboard</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create New Campus Event</h1>
        <p className="text-xs text-slate-600 mt-1">
          Publish a new event edition{organizer ? ` under ${organizer.name}` : ''}. Configure cross-college eligibility policies.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4 text-xs">
        <div>
          <label className="block text-slate-700 font-medium mb-1">Event Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Annual Inter-College Hackathon 2026"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Description</label>
          <textarea
            rows={3}
            required
            minLength={10}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Highlight learning outcomes, competition tracks, and prerequisites..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Event Format</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
            >
              <option value="hackathon">Hackathon</option>
              <option value="workshop">Workshop</option>
              <option value="competition">Competition</option>
              <option value="cultural">Cultural</option>
              <option value="talk">Talk</option>
              <option value="social">Social</option>
              <option value="career">Career</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Cross-College Eligibility</label>
            <select
              value={eligibility}
              onChange={(e) => setEligibility(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
            >
              <option value="all_active_colleges">Open to all participating colleges</option>
              <option value="host_college_only">Host college students only</option>
              <option value="selected_colleges">Selected partner colleges only</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Start Date & Time</label>
            <input
              type="datetime-local"
              required
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">End Date & Time</label>
            <input
              type="datetime-local"
              required
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Venue / Room</label>
            <input
              type="text"
              required
              minLength={2}
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. CS Lab 3 / Auditorium"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Registration Fee (₹)</label>
            <input
              type="number"
              min="0"
              value={costAmount}
              onChange={(e) => setCostAmount(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="AI, WebDev, Robotics, Python"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
          />
        </div>

        <div className="pt-3">
          <Button type="submit" variant="primary" isLoading={isLoading} className="w-full py-2.5">
            Publish Event Edition
          </Button>
        </div>
      </form>
    </div>
  );
}