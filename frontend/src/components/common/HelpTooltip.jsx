import React, { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';

export default function HelpTooltip({
  text,
  title,
  icon = 'help',
  position = 'top',
  className = '',
}) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const IconComponent = icon === 'info' ? Info : HelpCircle;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={(e) => {
          e.preventDefault();
          setIsVisible(!isVisible);
        }}
        className="text-slate-400 hover:text-emerald-400 focus:outline-none focus:text-emerald-400 transition-colors p-0.5"
        aria-label={title || 'More information'}
      >
        <IconComponent className="w-3.5 h-3.5" />
      </button>

      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 w-64 p-3 bg-slate-900 text-slate-200 text-xs rounded-xl shadow-2xl border border-slate-700 pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95 ${
            positionClasses[position] || positionClasses.top
          }`}
        >
          {title && <div className="font-semibold text-white mb-1">{title}</div>}
          <div className="leading-relaxed text-slate-300">{text}</div>
        </div>
      )}
    </div>
  );
}
