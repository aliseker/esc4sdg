import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['tr', 'en'],
  defaultLocale: 'tr',
  localePrefix: 'always' // Sayfa Türkçe iken URL /tr, İngilizce iken /en olsun
});

