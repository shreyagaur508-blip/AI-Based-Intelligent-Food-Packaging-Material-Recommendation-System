import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Sparkles, LayoutDashboard, Database, Menu, X, ShieldCheck } from 'lucide-react';
import Button from '../common/Button';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Get Recommendation', path: '/recommend', icon: Sparkles },
    { name: 'Results Summary', path: '/results', icon: LayoutDashboard },
    { name: 'Admin Hub', path: '/admin', icon: Database },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-slate-950 shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform duration-200">
              <Package className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-xl tracking-tight text-white group-hover:text-brand-400 transition-colors">
                  PackWise<span className="text-brand-400"> AI</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/40 rounded-md">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
                Intelligent Food Packaging Decision System
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    active
                      ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {Icon && <Icon className={`w-4 h-4 ${active ? 'text-brand-400' : 'text-slate-400'}`} />}
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* CTA Button & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link to="/recommend" className="hidden sm:inline-block">
              <Button size="sm" icon={Sparkles} variant="primary">
                New Recommendation
              </Button>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-900/95 backdrop-blur-2xl px-4 pt-3 pb-5 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  active
                    ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {Icon && <Icon className="w-5 h-5 text-brand-400" />}
                {link.name}
              </Link>
            );
          })}
          <div className="pt-2">
            <Link to="/recommend" onClick={() => setMobileMenuOpen(false)} className="block w-full">
              <Button size="md" icon={Sparkles} className="w-full">
                Get Recommendation
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
