/**
 * BookmarkButton - Toggleable bookmark/save button for events
 * Supports icon-only and labeled variants
 */

import React from 'react';
import { Bookmark } from 'lucide-react';
import { Button } from '../common/Button';

/**
 * @param {Object} props
 * @param {boolean} props.isSaved - Whether event is currently saved
 * @param {Function} props.onToggle - Toggle handler
 * @param {boolean} props.isLoading - Loading state
 * @param {boolean} props.showLabel - Show text label (default: false)
 * @param {string} props.size - Button size: 'sm' | 'md' | 'lg'
 * @param {string} props.className - Additional CSS classes
 */
export function BookmarkButton({
  isSaved = false,
  onToggle,
  isLoading = false,
  showLabel = false,
  size = 'md',
  className = '',
}) {
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const buttonClasses = isSaved
    ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50';

  return (
    <Button
      variant="secondary"
      size={size}
      onClick={onToggle}
      isLoading={isLoading}
      className={`${buttonClasses} gap-1.5 transition-colors ${className}`}
      aria-label={isSaved ? 'Remove from saved events' : 'Save event'}
      title={isSaved ? 'Remove from saved events' : 'Save event'}
    >
      <Bookmark
        className={`${iconSizes[size]} ${isSaved ? 'fill-amber-600' : ''}`}
        aria-hidden="true"
      />
      {showLabel && (
        <span className="text-xs font-medium">
          {isSaved ? 'Saved' : 'Save'}
        </span>
      )}
    </Button>
  );
}
