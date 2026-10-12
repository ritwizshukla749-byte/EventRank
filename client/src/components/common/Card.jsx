import React from 'react';

export function Card({
  children,
  className = '',
  hoverEffect = false,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-slate-200 bg-white text-slate-900 shadow-xs transition-all duration-200 ${
        hoverEffect ? 'hover:border-slate-300 hover:shadow-md cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
