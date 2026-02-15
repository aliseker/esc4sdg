import { defineRouting } from 'next-intl/routing';

// Admin panelden eklenen dillerin kodları burada tanımlı olmalı (örn. yeni dil "Almanca" code: de)
export const routing = defineRouting({
  locales: ['tr', 'en', 'de', 'fr', 'es', 'it', 'pt', 'pl', 'nl', 'ar'],
  defaultLocale: 'tr',
  localePrefix: 'always',
  localeDetection: true,
});

