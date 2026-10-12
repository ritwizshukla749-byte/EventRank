import React from 'react';

/**
 * Display a single review dimension rating with visual progress bar
 */
export function DimensionRating({ label, value, maxValue = 5 }) {
  const percentage = (value / maxValue) * 100;
  
  // Color based on rating
  const getColorClass = () => {
    if (value >= 4) return 'bg-emerald-500';
    if (value >= 3) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-slate-600 min-w-[120px]">
        {label}
      </span>
      
      <div className="flex-1 max-w-[200px]">
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${getColorClass()} rounded-full transition-all duration-300`}
            style={{ width: `${percentage}%` }}
            role="presentation"
          />
        </div>
      </div>
      
      <span className="text-sm font-semibold tabular-nums min-w-[3ch] text-slate-800">
        {value.toFixed(1)}
      </span>
      <span className="text-xs text-slate-400">/ {maxValue}</span>
      
      {/* Screen reader accessible text */}
      <span className="sr-only">
        {label}: {value} out of {maxValue} stars
      </span>
    </div>
  );
}
