import React from 'react';

export default function Card({
  children,
  className = '',
  hover = false,
  glow = false,
  padding = 'p-6',
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`glass-card ${padding} ${hover ? 'glass-card-hover cursor-pointer' : ''} ${
        glow ? 'border-brand-500/30 shadow-brand-500/10' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
