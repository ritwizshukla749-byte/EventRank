import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCompare } from '../../context/CompareContext';
import { compareApi } from '../../api/featuresApi';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { SkeletonTable } from '../../components/common/SkeletonTable';
import { EmptyState } from '../../components/common/EmptyState';
import { Layers, ArrowLeft, Trash2 } from 'lucide-react';

export function Compare() {
  const { selectedEvents, removeEvent, clearAll } = useCompare();
  const { isAuthenticated } = useAuth();
  const [compareData, setCompareData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedEvents.length === 0) return;

    setIsLoading(true);
    const editionIds = selectedEvents.map((e) => e._id);

    compareApi.compare(editionIds)
      .then((res) => {
        setCompareData(res.comparison || []);
      })
      .catch((err) => {
        console.error('Failed to fetch comparison details', err);
        setCompareData(selectedEvents);
      })
      .finally(() => setIsLoading(false));
  }, [selectedEvents]);

  if (selectedEvents.length === 0) {
    return (
      <EmptyState
        icon={Layers}
        title="No events selected for comparison"
        description="Browse the Discover page and click 'Compare' on up to 3 events to compare their scores and specifications."
        actionLabel="Go to Discover"
        onAction={() => window.location.assign('/discover')}
      />
    );
  }

  // Approachable name for a comparison row while strictly separating the two score signals
  const qualityLabel = (quality) => {
    const score = typeof quality?.score === 'number' ? Math.round(quality.score) : null;
    if (score === null) return <span className="text-slate-400 italic">No evidence yet</span>;
    const label =
      quality.status === 'review_supported'
        ? 'Review-backed'
        : quality.status === 'provisional'
        ? 'Provisional'
        : 'Insufficient evidence';
    return (
      <span>
        <span className="font-mono font-bold text-emerald-700">
          {score} <span className="text-[10px] text-slate-500 font-normal">/100</span>
        </span>
        <span className="block text-[10px] text-slate-500 mt-0.5">{label}</span>
      </span>
    );
  };

  const fitLabel = (fit) => {
    const score = typeof fit?.score === 'number' ? Math.round(fit.score) : null;
    if (!isAuthenticated) return <span className="text-slate-400 italic">Sign in for fit</span>;
    if (score === null) return <span className="text-slate-400 italic">Not yet computed</span>;
    return (
      <span>
        <span className="font-mono font-bold text-purple-700">
          {score} <span className="text-[10px] text-slate-500 font-normal">/100</span>
        </span>
        <span className="block text-[10px] text-slate-500 mt-0.5">
          {fit.status === 'personalized' ? 'Personalized' : 'Limited profile'}
        </span>
      </span>
    );
  };

  const rows = [
    { label: 'Host College', key: 'hostCollegeName', render: (e) => e.hostCollege || 'N/A' },
    { label: 'Edition', key: 'editionLabel', render: (e) => e.editionLabel || 'N/A' },
    { label: 'Event Format', key: 'eventType', render: (e) => e.eventType || 'N/A' },
    { label: 'Event Quality', key: 'quality', render: (e) => qualityLabel(e.quality) },
    { label: 'Fit for You', key: 'fit', render: (e) => fitLabel(e.fit) },
    { label: 'Cost', key: 'cost', render: (e) => e.cost || 'N/A' },
    { label: 'Registrations', key: 'registrationCount', render: (e) => `${e.registrationCount ?? 0} students` },
    { label: 'Tags', key: 'tags', render: (e) => (e.tags?.length ? e.tags.slice(0, 3).join(', ') : '—') },
    {
      label: 'Expected Outcomes',
      key: 'expectedOutcomes',
      render: (e) => (e.expectedOutcomes?.length ? e.expectedOutcomes.join(', ') : '—'),
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/discover"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Discovery</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Event Comparison</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
              {selectedEvents.length}/3 selected
            </span>
          </h1>
        </div>

        <Button variant="ghost" size="sm" onClick={clearAll} className="text-rose-600 hover:text-rose-700">
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          <span>Clear All</span>
        </Button>
      </div>

      {isLoading ? (
        <SkeletonTable columns={selectedEvents.length} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-4 font-semibold text-slate-700 w-44">Attribute</th>
                {compareData.map((event, idx) => (
                  <th key={idx} className="p-4 min-w-[220px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900 text-sm truncate">
                        {event.event?.title || event.title}
                      </span>
                      <button
                        onClick={() => removeEvent(event._id)}
                        className="text-slate-400 hover:text-rose-600 p-1 text-base cursor-pointer"
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.key} className="hover:bg-slate-50/50">
                  <td className="p-4 font-mono font-medium text-slate-500 bg-slate-50/40">
                    {row.label}
                  </td>
                  {compareData.map((event, idx) => (
                    <td key={idx} className="p-4 text-slate-800">
                      {row.render(event)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="p-4 bg-slate-50/40"></td>
                {compareData.map((event) => (
                  <td key={event._id} className="p-4">
                    <Link to={`/events/${event._id}`}>
                      <Button size="sm" variant="secondary" className="w-full text-xs">
                        View Details
                      </Button>
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}