import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ShieldCheck, Sparkles, Leaf, Database } from 'lucide-react';
import { useTranslation } from '../../i18n';

export default function Footer() {
  const { t, getCategoryName } = useTranslation();

  const foodSectors = [
    'Fresh Produce',
    'Dry Crisp Foods',
    'High-Fat Snacks',
    'Perishable Dairy',
    'Frozen Foods',
    'Powders & Grains',
  ];

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand & Purpose */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-950">
                <Package className="w-5 h-5" />
              </div>
              <span className="font-display font-extrabold text-lg text-white tracking-tight">
                {t('nav.brand_name')} <span className="text-emerald-400">{t('nav.brand_suffix')}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{t('footer.food_safety_protocol')}</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 font-display">{t('footer.nav_title')}</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors">
                  {t('footer.nav_home')}
                </Link>
              </li>
              <li>
                <Link to="/recommend" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  {t('footer.nav_recommend')}
                </Link>
              </li>
              <li>
                <Link to="/results" className="hover:text-emerald-400 transition-colors">
                  {t('footer.nav_results')}
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-slate-400" />
                  {t('footer.nav_admin')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Scientific Standards */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 font-display">{t('footer.standards_title')}</h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span><strong>ASTM D3985:</strong> OTR (cm³/m²·24h·atm)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span><strong>ASTM F1249:</strong> WVTR (g/m²·24h)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span><strong>FDA 21 CFR 177:</strong> Food-Contact Polymers</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span><strong>EU 10/2011 & FSSAI:</strong> Migration Safety</span>
              </li>
            </ul>
          </div>

          {/* Supported Commodities Preview */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 font-display">{t('footer.sectors_title')}</h4>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {foodSectors.map((cat) => (
                <span
                  key={cat}
                  className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300"
                >
                  {getCategoryName(cat)}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
              {t('footer.sectors_desc')}
            </p>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-8 mt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{t('footer.copyright', { year: new Date().getFullYear().toString() })}</p>
          <p className="flex items-center gap-1.5 text-slate-400">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            {t('footer.circular_economy')}
          </p>
        </div>
      </div>
    </footer>
  );
}
