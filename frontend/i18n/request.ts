import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

export default getRequestConfig(async ({locale}) => {
  type AppLocale = (typeof routing.locales)[number];
  const isSupported = routing.locales.includes(locale as AppLocale);
  const safeLocale: AppLocale = isSupported ? (locale as AppLocale) : routing.defaultLocale;

  return {
    locale: safeLocale,
    messages: (await import(`../messages/${safeLocale}.json`)).default
  };
});

