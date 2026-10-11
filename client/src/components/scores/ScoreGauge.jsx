import React from 'react';

export function EvidenceBadge({ status = 'insufficient_evidence' }) {
  const configs = {
    review_supported: {
      label: 'Review-backed',
      color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      icon: '✓',
    },
    provisional: {
      label: 'Provisional Signal',
      color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      icon: '⚠',
    },
    insufficient_evidence: {
      label: 'Insufficient Evidence',
      color: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
      icon: '•',
    },
  };

  const current = configs[status] || configs.insufficient_evidence;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono border ${current.color}`}
    >
      <span>{current.icon}</span>
      <span>{current.label}</span>
    </span>
  );
}

export function ScoreGauge({ score, max = 100, type = 'quality', size = 'md' }) {
  const isQuality = type === 'quality';
  const strokeColor = isQuality ? '#10b981' : '#8b5cf6';
  const trackColor = isQuality ? 'rgba(16, 185, 129, 0.15)' : 'rgba(139, 92, 246, 0.15)';
  const textColor = isQuality ? 'text-emerald-400' : 'text-purple-400';

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
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`font-mono font-bold text-xl ${textColor}`}>
          {score !== undefined && score !== null ? Math.round(score) : '--'}
        </span>
        <span className="text-[10px] text-slate-400 font-mono">/ {max}</span>
      </div>
    </div>
  );
}
