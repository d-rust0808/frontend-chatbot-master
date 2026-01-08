import { defaultLocale } from './config';
import type { Locale } from './config';
import { vi } from './messages/vi';
import { en } from './messages/en';

export type { Locale } from './config';
export { locales, localeNames, defaultLocale } from './config';

// Use a more flexible type that allows different string values
export type Messages = {
  readonly [K in keyof typeof vi]: {
    readonly [P in keyof typeof vi[K]]: string;
  };
};

const messages: Record<Locale, Messages> = {
  vi,
  en,
};

export function getMessages(locale: Locale = defaultLocale): Messages {
  return messages[locale] || messages[defaultLocale];
}

export function useTranslations(locale: Locale = defaultLocale) {
  const t = getMessages(locale);
  
  return {
    t,
    locale,
  };
}

