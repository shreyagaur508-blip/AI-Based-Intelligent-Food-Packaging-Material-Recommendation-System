import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ShieldCheck, Sparkles, Leaf, Database, ArrowUpRight } from 'lucide-react';

export default function Footer() {
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
                PackWise <span className="text-emerald-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Intelligent decision-support system calculating food degradation kinetics, ASTM OTR & WVTR barrier physics, and multi-criteria packaging material optimization.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Food Safety & Regulatory Compliance Protocol</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 font-display">Navigation</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link to="/recommend" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Get Recommendation
                </Link>
              </li>
              <li>
                <Link to="/results" className="hover:text-emerald-400 transition-colors">
                  Recommendation Results
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-slate-400" />
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Scientific Standards */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 font-display">Engineering Standards</h4>
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
            <h4 className="text-white font-semibold text-sm mb-4 font-display">Target Food Sectors</h4>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {['Fresh Produce', 'Crisp Snacks', 'Roasted Nuts', 'Dairy & Paneer', 'Frozen Foods', 'Milk Powder', 'Grains & Flour'].map(
                (cat) => (
                  <span
                    key={cat}
                    className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300"
                  >
                    {cat}
                  </span>
                )
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
              Designed for farmers, food processors, packaging engineers, and agricultural researchers.
            </p>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-8 mt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PackWise AI — Intelligent Food Packaging Material Recommendation System.</p>
          <p className="flex items-center gap-1.5 text-slate-400">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            Supporting circular economy & food waste reduction
          </p>
        </div>
      </div>
    </footer>
  );
}
