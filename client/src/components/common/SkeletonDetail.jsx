import React from 'react';

/**
 * Skeleton loader for EventDetail page
 * Matches the full event detail layout structure
 */
export function SkeletonDetail() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-pulse">
      {/* Back button skeleton */}
      <div className="h-4 w-32 bg-slate-200 rounded"></div>

      {/* Header banner skeleton */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-4">
        {/* Badges */}
        <div className="flex gap-2">
          <div className="h-6 w-32 bg-slate-200 rounded-full"></div>
          <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
        </div>

        {/* Title */}
        <div className="h-8 bg-slate-200 rounded-lg w-2/3"></div>
        
        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        </div>

        {/* Organizer */}
        <div className="h-4 bg-slate-200 rounded w-1/3"></div>

        {/* Tags */}
        <div className="flex gap-1.5">
          <div className="h-5 w-16 bg-slate-200 rounded-md"></div>
          <div className="h-5 w-20 bg-slate-200 rounded-md"></div>
          <div className="h-5 w-14 bg-slate-200 rounded-md"></div>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-200">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-slate-200 rounded w-16"></div>
              <div className="h-4 bg-slate-200 rounded w-24"></div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <div className="h-10 w-40 bg-slate-200 rounded-lg"></div>
          <div className="h-10 w-36 bg-slate-200 rounded-lg"></div>
          <div className="h-10 w-10 bg-slate-200 rounded-lg"></div>
        </div>
      </div>

      {/* Dual scores skeleton */}
      <div className="space-y-3">
        <div className="h-6 w-48 bg-slate-200 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>

      {/* Pre-event signals skeleton */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
        <div className="h-5 w-64 bg-slate-200 rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
