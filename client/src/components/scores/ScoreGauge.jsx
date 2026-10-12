import React from 'react';

export function EvidenceBadge({ status = 'insufficient_evidence' }) {
  const configs = {
    review_supported: {
      label: 'Review-backed',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: '✓',
    },
    provisional: {
      label: 'Provisional Signal',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: '⚠',
    },
    insufficient_evidence: {
      label: 'Insufficient Evidence',
      color: 'bg-slate-100 text-slate-600 border-slate-200',
      icon: '•',
    },
  };

  const current = configs[status] || configs.insufficient_evidence;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono border font-medium ${current.color}`}
    >
      <span>{current.icon}</span>
      <span>{current.label}</span>
    </span>
  );
}

export function ScoreGauge({ score, max = 100, type = 'quality', size = 'md' }) {
  const isQuality = type === 'quality';
  const strokeColor = isQuality ? '#059669' : '#7c3aed';
  const trackColor = isQuality ? 'rgba(5, 150, 105, 0.12)' : 'rgba(124, 58, 237, 0.12)';
  const textColor = isQuality ? 'text-emerald-700' : 'text-purple-700';

  const percentage = Math.min(Math.max(score || 0, 0), max);
  const strokeWidth = 8;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size] || sizeClasses.md}`}>
      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 90 90">
        <circle
          cx="45"
          cy="45"
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx="45"
          cy="45"
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-center">
        <span className={`font-mono font-bold text-xl ${textColor} leading-none`}>
          {score !== undefined && score !== null ? Math.round(score) : '--'}
          <span className="text-[11px] text-slate-400 font-normal ml-0.5">/ {max}</span>
        </span>
      </div>
    </div>
  );
}
