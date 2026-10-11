import React from 'react';

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  const variantStyles = {
    default: 'bg-white/10 text-slate-300 border border-white/10',
    college: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-medium',
    quality: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium',
    fit: 'bg-purple-500/15 text-purple-300 border border-purple-500/30 font-medium',
    success: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    info: 'bg-sky-500/15 text-sky-300 border border-sky-500/30',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-mono transition-colors ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.default} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
