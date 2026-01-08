'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { Globe } from 'lucide-react';
import { locales, localeNames, type Locale } from '@/lib/i18n';
import { useState, useEffect, useRef } from 'react';

export function LanguageSwitcher() {
  const router = useRouter();
  const [currentLocale, setCurrentLocale] = useState<Locale>('vi');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get locale from localStorage or default
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && locales.includes(savedLocale)) {
      setCurrentLocale(savedLocale);
    }
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const switchLocale = (locale: Locale) => {
    localStorage.setItem('locale', locale);
    setCurrentLocale(locale);
    setIsOpen(false);
    // Trigger locale change event
    window.dispatchEvent(new Event('localechange'));
    // Reload to apply new locale
    router.refresh();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm hidden sm:inline">{localeNames[currentLocale]}</span>
      </Button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white border shadow-lg z-50">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => switchLocale(locale)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-all duration-200 active:scale-[0.98] ${
                currentLocale === locale ? 'bg-primary/10 text-primary font-medium' : ''
              }`}
            >
              {localeNames[locale]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

