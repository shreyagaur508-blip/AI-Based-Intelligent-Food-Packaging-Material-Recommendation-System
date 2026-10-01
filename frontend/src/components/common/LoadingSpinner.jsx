import React from 'react';
import { Loader2, Sparkles, ShieldCheck, Activity, Cpu } from 'lucide-react';
import { useTranslation } from '../../i18n';

export default function LoadingSpinner({
  title,
  subtitle,
  className = '',
}) {
  const { t } = useTranslation();

  const displayTitle = title || t('common.calculating');
  const displaySubtitle = subtitle || t('common.evaluating_sub');

  return (
    <div className={`p-8 sm:p-12 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-6 shadow-2xl ${className}`}>
      <div className="relative inline-flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Cpu className="w-8 h-8 animate-pulse" />
        </div>
        <div className="absolute -top-2 -right-2 p-1.5 rounded-full bg-emerald-600 text-white shadow-md animate-spin">
          <Loader2 className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <h3 className="text-lg sm:text-xl font-bold text-white font-display">
          {displayTitle}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          {displaySubtitle}
        </p>
      </div>

      {/* Scientific pipeline indicator steps */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto pt-2 text-left">
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2 text-xs text-slate-300">
          <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{t('common.barrier_equations')}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{t('common.safety_screening')}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2 text-xs text-slate-300">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{t('common.mcda_optimization')}</span>
        </div>
      </div>
    </div>
  );
}
