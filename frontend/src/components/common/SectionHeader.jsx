import React from 'react';
import Badge from './Badge';

export default function SectionHeader({
  badge,
  badgeVariant = 'brand',
  title,
  subtitle,
  centered = false,
  className = '',
  action,
}) {
  return (
    <div
      className={`flex flex-col ${
        centered ? 'items-center text-center' : 'items-start text-left'
      } ${className}`}
    >
      <div className={`w-full flex ${centered ? 'flex-col items-center' : 'flex-col sm:flex-row sm:items-end justify-between'} gap-4`}>
        <div className="space-y-2">
          {badge && (
            <div>
              <Badge variant={badgeVariant} size="sm">
                {badge}
              </Badge>
            </div>
          )}
          {title && (
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
