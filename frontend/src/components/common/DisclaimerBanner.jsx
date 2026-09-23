import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export default function DisclaimerBanner({ compact = false, className = '' }) {
  if (compact) {
    return (
      <div className={`p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200/90 flex items-center gap-2.5 ${className}`}>
        <Info className="w-4 h-4 shrink-0 text-amber-400" />
        <span>
          <strong>Decision Support Notice:</strong> PackWise AI outputs are engineering estimates and do not replace formal laboratory validation.
        </span>
      </div>
    );
  }

  return (
    <div className={`p-5 bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-amber-950/30 border border-amber-500/30 rounded-2xl shadow-lg ${className}`}>
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-amber-300 tracking-wide uppercase">
            Engineering Decision-Support Disclaimer
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>PackWise AI</strong> is an academic decision-support platform providing material recommendations, barrier requirement estimations, and sustainability benchmarking based on standard food packaging physics and ASTM protocols. Recommendations do <strong>not</strong> substitute for mandatory empirical shelf-life testing, sensory trials, microbial challenge tests, or statutory regulatory certifications (such as FDA, EU, or FSSAI).
          </p>
        </div>
      </div>
    </div>
  );
}
