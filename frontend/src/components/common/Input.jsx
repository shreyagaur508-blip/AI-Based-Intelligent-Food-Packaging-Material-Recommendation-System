import React from 'react';
import { AlertCircle } from 'lucide-react';
import HelpTooltip from './HelpTooltip';

export default function Input({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  helperText,
  error,
  required = false,
  disabled = false,
  tooltip,
  tooltipTitle,
  icon: Icon,
  suffix,
  className = '',
  min,
  max,
  step,
  ...props
}) {
  const inputId = id || name;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor={inputId} className="form-label mb-0 flex items-center gap-1.5">
            <span>{label}</span>
            {required && <span className="text-rose-400">*</span>}
          </label>
          {tooltip && (
            <HelpTooltip text={tooltip} title={tooltipTitle || label} />
          )}
        </div>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={`form-control ${Icon ? 'pl-10' : ''} ${suffix ? 'pr-12' : ''} ${
            error ? '!border-rose-500/70 focus:!ring-rose-500/30' : ''
          }`}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3.5 text-xs text-slate-400 pointer-events-none font-medium">
            {suffix}
          </span>
        )}
      </div>

      {error ? (
        <div className="form-error">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <div className="form-helper">
          <span>{helperText}</span>
        </div>
      ) : null}
    </div>
  );
}
