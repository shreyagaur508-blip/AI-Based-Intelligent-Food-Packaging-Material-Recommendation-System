import React from 'react';

export default function Card({
  children,
  className = '',
  hover = false,
  accent = false,
  padding = 'p-6',
  header,
  footer,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`packwise-card ${padding} ${hover ? 'packwise-card-hover cursor-pointer' : ''} ${
        accent ? 'packwise-card-accent' : ''
      } ${className}`}
      {...props}
    >
      {header && <div className="border-b border-slate-800 pb-4 mb-4">{header}</div>}
      {children}
      {footer && <div className="border-t border-slate-800 pt-4 mt-4">{footer}</div>}
    </div>
  );
}
