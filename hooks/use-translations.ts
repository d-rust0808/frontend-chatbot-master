'use client';

import { useState, useEffect } from 'react';
import { useTranslations, getMessages, type Locale } from '@/lib/i18n';
import { defaultLocale } from '@/lib/i18n/config';

export function useTranslation() {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    // Get locale from localStorage
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale) {
      setLocale(savedLocale);
    }

    // Listen for locale changes
    const handleLocaleChange = () => {
      const newLocale = localStorage.getItem('locale') as Locale;
      if (newLocale && newLocale !== locale) {
        setLocale(newLocale);
      }
    };

    window.addEventListener('localechange', handleLocaleChange);
    return () => {
      window.removeEventListener('localechange', handleLocaleChange);
    };
  }, [locale]);

  const { t } = useTranslations(locale);

  return {
    t,
    locale,
  };
}

