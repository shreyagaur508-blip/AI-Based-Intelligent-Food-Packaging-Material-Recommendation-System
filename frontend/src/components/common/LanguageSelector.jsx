import React, { useState, useRef, useEffect } from 'react';
import { Languages, Check, ChevronDown, Globe } from 'lucide-react';
import { useTranslation } from '../../i18n';

export default function LanguageSelector({ variant = 'navbar', className = '' }) {
  const { t, language, changeLanguage, languages, currentLanguageInfo } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  // Mobile drawer button group layout
  if (variant === 'mobile') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t('nav.select_language')}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {languages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-emerald-600/20 border border-emerald-500/60 text-emerald-300 shadow-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-sm">{lang.flag}</span>
                  <span className="font-semibold truncate">{lang.nativeName}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Desktop Navbar Dropdown
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900/90 hover:bg-slate-850 text-slate-200 border border-slate-800 hover:border-slate-700 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        aria-label="Select Language"
        aria-expanded={isOpen}
      >
        <Languages className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-semibold text-slate-100">{currentLanguageInfo?.nativeName || 'English'}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900/98 backdrop-blur-2xl border border-slate-700/80 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 mb-1 flex items-center justify-between">
            <span>{t('nav.select_language')}</span>
            <span className="text-emerald-400">🌐</span>
          </div>

          <div className="space-y-0.5">
            {languages.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left ${
                    isSelected
                      ? 'bg-emerald-500/15 text-emerald-300 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm">{lang.flag}</span>
                    <div>
                      <div className="font-medium leading-tight">{lang.nativeName}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{lang.name}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
