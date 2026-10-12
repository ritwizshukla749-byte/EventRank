import React from 'react';

/**
 * Skeleton loader for Compare page table
 */
export function SkeletonTable({ columns = 3 }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs animate-pulse">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="p-4 w-44">
              <div className="h-4 bg-slate-200 rounded w-24"></div>
            </th>
            {Array.from({ length: columns }).map((_, idx) => (
              <th key={idx} className="p-4 min-w-[220px]">
                <div className="h-5 bg-slate-200 rounded w-32"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {Array.from({ length: 8 }).map((_, rowIdx) => (
            <tr key={rowIdx}>
              <td className="p-4 bg-slate-50/40">
                <div className="h-4 bg-slate-200 rounded w-28"></div>
              </td>
              {Array.from({ length: columns }).map((_, colIdx) => (
                <td key={colIdx} className="p-4">
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
