import { getRequestConfig } from 'next-intl/server';
import { unstable_noStore } from 'next/cache';
import { routing } from './routing';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';

export default getRequestConfig(async ({ requestLocale }) => {
  unstable_noStore(); // Admin'de kaydedilen çevirilerin hemen sitede görünmesi için önbelleği kapat
  type AppLocale = (typeof routing.locales)[number];
  const requested = await requestLocale;
  const isSupported = requested && routing.locales.includes(requested as AppLocale);
  const safeLocale: AppLocale = isSupported ? (requested as AppLocale) : routing.defaultLocale;

  try {
    const res = await fetch(`${API_BASE}/api/site-translations/${safeLocale}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', Pragma: 'no-cache' },
    });
    if (res.ok) {
      const messages = await res.json();
      if (messages && typeof messages === 'object' && Object.keys(messages).length > 0) {
        return { locale: safeLocale, messages };
      }
    }
  } catch {
    // API yoksa statik dosyaya düş
  }

  return {
    locale: safeLocale,
    messages: (await import(`../messages/${safeLocale}.json`)).default,
  };
});

