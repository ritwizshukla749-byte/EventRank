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
      className={`rounded-xl border border-white/10 bg-[#121826]/70 backdrop-blur-md transition-all duration-200 ${
        hoverEffect ? 'hover:border-white/20 hover:bg-[#1a2337]/80 hover:shadow-xl hover:shadow-black/40 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
