import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  fullWidth = false,
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-xl active:scale-[0.98]';

  const sizeStyles = {
    xs: 'px-2.5 py-1 text-xs gap-1',
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-5 py-3 text-base gap-2.5 font-semibold',
    xl: 'px-7 py-3.5 text-lg gap-3 font-bold',
  };

  const variantStyles = {
    primary: 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-md shadow-emerald-950/40 hover:shadow-lg hover:shadow-emerald-900/30 focus:ring-emerald-500',
    secondary: 'bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-slate-100 border border-slate-700 hover:border-slate-600 focus:ring-slate-500',
    outline: 'bg-transparent border border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 focus:ring-emerald-500',
    ghost: 'bg-transparent hover:bg-slate-800/70 text-slate-300 hover:text-white focus:ring-slate-500',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/40 focus:ring-rose-500',
    success: 'bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-950/40 focus:ring-teal-500',
    subtle: 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 focus:ring-slate-600',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${widthStyle} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
}
