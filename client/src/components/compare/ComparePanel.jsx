import React from 'react';
import { Link } from 'react-router-dom';
import { useCompare } from '../../context/CompareContext';
import { Button } from '../common/Button';
import { X, Layers, ArrowRight } from 'lucide-react';

export function ComparePanel() {
  const { selectedEvents, removeEvent, clearAll, count } = useCompare();

  if (count === 0) return null;

  return (
    <aside
      aria-label="Event comparison tray"
      className="fixed bottom-6 right-6 z-40 max-w-sm w-full bg-white/95 border border-indigo-200 rounded-2xl shadow-xl shadow-slate-900/10 backdrop-blur-xl p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-semibold text-slate-900">
            Comparing Events <span className="text-indigo-600 font-mono">({count}/3)</span>
          </h4>
        </div>
        <button
          onClick={clearAll}
          className="text-[11px] text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
        >
          Clear all
        </button>
      </div>

      {/* Mini Card List */}
      <div className="py-3 space-y-2 max-h-48 overflow-y-auto pr-1">
        {selectedEvents.map((event) => (
          <div
            key={event._id}
            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors"
          >
            <div className="truncate pr-2">
              <p className="text-xs font-semibold text-slate-900 truncate">{event.event?.title || event.title}</p>
              <p className="text-[10px] text-slate-500 truncate">
                {event.hostCollege?.name || event.college?.name || 'College Event'}
              </p>
            </div>
            <button
              onClick={() => removeEvent(event._id)}
              className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded cursor-pointer"
              title="Remove from comparison"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex items-center justify-between gap-3">
        <span className="text-[11px] text-slate-500">
          {count < 2 ? 'Select at least 2 events' : 'Ready to compare side-by-side'}
        </span>
        <Link to="/compare">
          <Button
            size="sm"
            variant="primary"
            disabled={count < 2}
            className="text-xs"
          >
            <span>Compare Now</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>
    </aside>
  );
}
