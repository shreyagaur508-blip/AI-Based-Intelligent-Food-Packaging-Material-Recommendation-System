import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY } from './languages';
import en from './en.json';
import hi from './hi.json';
import kn from './kn.json';
import mr from './mr.json';
import bho from './bho.json';

const dictionaries = {
  en,
  hi,
  kn,
  mr,
  bho,
};

const I18nContext = createContext(null);

/**
 * Helper to retrieve nested object value by dot path (e.g., "nav.home")
 */
function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;
  const keys = path.split('.');
  let current = obj;
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

/**
 * Replaces {{var}} or {var} placeholders with values from params object
 */
function interpolate(template, params) {
  if (!template || !params) return template;
  return Object.keys(params).reduce((acc, key) => {
    const val = params[key];
    return acc
      .replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), val)
      .replace(new RegExp(`{\\s*${key}\\s*}`, 'g'), val);
  }, template);
}

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved && dictionaries[saved]) {
        return saved;
      }
    } catch {
      // Ignore localStorage errors
    }
    return DEFAULT_LANGUAGE;
  });

  const changeLanguage = useCallback((newLang) => {
    if (dictionaries[newLang]) {
      setLanguageState(newLang);
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
      } catch {
        // Ignore localStorage error
      }
      document.documentElement.lang = newLang;
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const currentLanguageInfo = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  /**
   * Main translation function
   * @param {string} key - Dot notation key, e.g. "landing.hero_title"
   * @param {Object} [params] - Optional interpolation parameters
   * @returns {string} Translated string or fallback
   */
  const t = useCallback(
    (key, params) => {
      const currentDict = dictionaries[language];
      let value = getNestedValue(currentDict, key);

      // Fallback to English if missing in selected language
      if (value === undefined && language !== DEFAULT_LANGUAGE) {
        value = getNestedValue(dictionaries[DEFAULT_LANGUAGE], key);
      }

      // If still missing, return the key itself
      if (value === undefined) {
        return key;
      }

      if (params) {
        return interpolate(value, params);
      }

      return value;
    },
    [language]
  );

  /**
   * Translates commodity name if available in dictionary
   */
  const getCommodityName = useCallback(
    (name) => {
      if (!name) return '';
      const translated = t(`commodities.${name}`);
      return translated !== `commodities.${name}` ? translated : name;
    },
    [t]
  );

  /**
   * Translates food category name if available
   */
  const getCategoryName = useCallback(
    (category) => {
      if (!category) return '';
      const translated = t(`categories.${category}`);
      return translated !== `categories.${category}` ? translated : category;
    },
    [t]
  );

  /**
   * Translates storage type label
   */
  const getStorageTypeName = useCallback(
    (typeId) => {
      if (!typeId) return '';
      const lower = typeId.toLowerCase();
      const translated = t(`storage_types.${lower}`);
      return translated !== `storage_types.${lower}` ? translated : typeId;
    },
    [t]
  );

  /**
   * Translates transportation condition string
   */
  const getTransportName = useCallback(
    (transportStr) => {
      if (!transportStr) return '';
      const translated = t(`transport.${transportStr}`);
      return translated !== `transport.${transportStr}` ? translated : transportStr;
    },
    [t]
  );

  /**
   * Translates packaging format string
   */
  const getFormatName = useCallback(
    (formatStr) => {
      if (!formatStr) return '';
      const translated = t(`formats.${formatStr}`);
      return translated !== `formats.${formatStr}` ? translated : formatStr;
    },
    [t]
  );

  /**
   * Translates sustainability preference key or label
   */
  const getSustainabilityName = useCallback(
    (keyOrLabel) => {
      if (!keyOrLabel) return '';
      const translated = t(`sustainability.${keyOrLabel}`);
      return translated !== `sustainability.${keyOrLabel}` ? translated : keyOrLabel;
    },
    [t]
  );

  /**
   * Translates general dropdown option codes
   */
  const getOptionLabel = useCallback(
    (optCode) => {
      if (!optCode) return '';
      const translated = t(`options.${optCode}`);
      return translated !== `options.${optCode}` ? translated : optCode;
    },
    [t]
  );

  const contextValue = useMemo(
    () => ({
      t,
      language,
      changeLanguage,
      languages: SUPPORTED_LANGUAGES,
      currentLanguageInfo,
      getCommodityName,
      getCategoryName,
      getStorageTypeName,
      getTransportName,
      getFormatName,
      getSustainabilityName,
      getOptionLabel,
    }),
    [
      t,
      language,
      changeLanguage,
      currentLanguageInfo,
      getCommodityName,
      getCategoryName,
      getStorageTypeName,
      getTransportName,
      getFormatName,
      getSustainabilityName,
      getOptionLabel,
    ]
  );

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
