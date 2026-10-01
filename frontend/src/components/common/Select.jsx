import React from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import HelpTooltip from './HelpTooltip';

export default function Select({
  id,
  name,
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option...',
  helperText,
  error,
  required = false,
  disabled = false,
  tooltip,
  tooltipTitle,
  icon: Icon,
  className = '',
  ...props
}) {
  const selectId = id || name;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor={selectId} className="form-label mb-0 flex items-center gap-1.5">
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
        <select
          id={selectId}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`form-control appearance-none cursor-pointer pr-10 ${Icon ? 'pl-10' : ''} ${
            error ? '!border-rose-500/70 focus:!ring-rose-500/30' : ''
          }`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="bg-slate-900 text-slate-500">
              {placeholder}
            </option>
          )}
          {options.map((option) => {
            const optValue = typeof option === 'object' ? option.value ?? option.id : option;
            const optLabel = typeof option === 'object' ? option.label ?? option.name : option;
            return (
              <option key={optValue} value={optValue} className="bg-slate-900 text-slate-100 py-1">
                {optLabel}
              </option>
            );
          })}
        </select>
        <div className="absolute right-3.5 text-slate-400 pointer-events-none">
          <ChevronDown className="w-4 h-4" />
        </div>
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
