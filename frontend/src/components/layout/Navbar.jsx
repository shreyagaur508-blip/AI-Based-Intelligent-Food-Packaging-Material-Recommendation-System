import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Package,
  Sparkles,
  Database,
  Menu,
  X,
  Home,
  BarChart3,
  Mic,
  MessageSquare
} from 'lucide-react';
import Button from '../common/Button';
import LanguageSelector from '../common/LanguageSelector';
import { useTranslation } from '../../i18n';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  const navLinks = [
    { name: t('nav.home'), path: '/', icon: Home },
    { name: t('nav.recommend'), path: '/recommend', icon: Sparkles },
    { name: t('nav.chat'), path: '/chat', icon: Mic },
    { name: t('nav.results'), path: '/results', icon: BarChart3 },
    { name: t('nav.admin'), path: '/admin', icon: Database },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Brand Logo */}
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform duration-200">
              <Package className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-xl tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  {t('nav.brand_name')} <span className="text-emerald-400">{t('nav.brand_suffix')}</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-md">
                  {t('nav.version')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
                {t('nav.tagline')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                    active
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  {Icon && (
                    <Icon
                      className={`w-4 h-4 ${
                        active ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    />
                  )}
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Language Selector, CTA Button & Mobile Toggle */}
          <div className="flex items-center gap-2.5">
            {/* Desktop Language Selector */}
            <LanguageSelector variant="navbar" />

            <Link to="/recommend" className="hidden sm:inline-block">
              <Button size="sm" icon={Sparkles} variant="primary">
                {t('nav.recommend')}
              </Button>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950/98 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150 shadow-2xl">
          {/* Mobile Navigation Links */}
          <div className="space-y-1">
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
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {Icon && <Icon className="w-5 h-5 text-emerald-400" />}
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Mobile Language Selector */}
          <div className="pt-2 border-t border-slate-850">
            <LanguageSelector variant="mobile" />
          </div>

          {/* Mobile CTA */}
          <div className="pt-2">
            <Link
              to="/recommend"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full"
            >
              <Button size="md" icon={Sparkles} fullWidth variant="primary">
                {t('nav.recommend')}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
