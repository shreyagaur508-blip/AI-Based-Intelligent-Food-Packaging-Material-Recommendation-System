import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { useTranslation } from '../../i18n';

export default function DisclaimerBanner({
  compact = false,
  className = '',
  title,
  text,
}) {
  const { t } = useTranslation();

  const displayTitle = title || t('common.disclaimer_title');
  const defaultText = compact ? t('common.disclaimer_compact') : t('common.disclaimer_full');
  const displayText = text || defaultText;

  if (compact) {
    return (
      <div
        className={`p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-xl text-xs text-amber-200/90 flex items-center gap-3 ${className}`}
      >
        <Info className="w-4 h-4 shrink-0 text-amber-400" />
        <p className="leading-relaxed">
          <strong>{t('common.decision_notice')}:</strong> {displayText}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border border-amber-500/30 shadow-lg ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-amber-300 tracking-wide uppercase">
              {displayTitle}
            </h4>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              ASTM / Food Safety
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {displayText}
          </p>
        </div>
      </div>
    </div>
  );
}
