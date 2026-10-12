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
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    college: 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium',
    quality: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium',
    fit: 'bg-purple-50 text-purple-700 border border-purple-200 font-medium',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    info: 'bg-sky-50 text-sky-700 border border-sky-200',
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
