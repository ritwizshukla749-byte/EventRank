import React from 'react';

/**
 * Skeleton loader that matches EventCard layout dimensions
 * Prevents layout shift during event list loading
 */
export function SkeletonCard() {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs animate-pulse">
      {/* Header badges */}
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 w-24 bg-slate-200 rounded-full"></div>
        <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
      </div>

      {/* Title */}
      <div className="h-6 bg-slate-200 rounded-lg mb-2 w-3/4"></div>
      
      {/* Date and location */}
      <div className="space-y-1.5 mb-4">
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        <div className="h-4 bg-slate-200 rounded w-2/3"></div>
      </div>

      {/* Tags */}
      <div className="flex gap-1.5 mb-4">
        <div className="h-5 w-16 bg-slate-200 rounded-md"></div>
        <div className="h-5 w-20 bg-slate-200 rounded-md"></div>
        <div className="h-5 w-14 bg-slate-200 rounded-md"></div>
      </div>

      {/* Dual scores */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="h-16 bg-slate-200 rounded-xl"></div>
        <div className="h-16 bg-slate-200 rounded-xl"></div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <div className="h-9 flex-1 bg-slate-200 rounded-lg"></div>
        <div className="h-9 w-24 bg-slate-200 rounded-lg"></div>
      </div>
    </div>
  );
}

/**
 * Multiple skeleton cards for list views
 */
export function SkeletonCardList({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
  );
}
