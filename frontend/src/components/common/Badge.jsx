import React from 'react';

export default function Badge({
  children,
  variant = 'brand',
  size = 'md',
  icon: Icon,
  className = '',
}) {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-medium',
    lg: 'px-3 py-1.5 text-sm gap-2 font-semibold',
  };

  const variantStyles = {
    brand: 'bg-brand-500/15 text-brand-300 border border-brand-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    blue: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
    purple: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
    rose: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    slate: 'bg-slate-800/80 text-slate-300 border border-slate-700/60',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shrink-0 ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.brand
      } ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      {children}
    </span>
  );
}
