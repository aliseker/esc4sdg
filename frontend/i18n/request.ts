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

  // 1. Önce yerel dosyadan temel çevirileri al
  let messages = (await import(`../messages/${safeLocale}.json`)).default;

  try {
    const res = await fetch(`${API_BASE}/api/site-translations/${safeLocale}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', Pragma: 'no-cache' },
    });

    if (res.ok) {
      const apiData = await res.json();
      if (apiData && typeof apiData === 'object' && Object.keys(apiData).length > 0) {

        // API'den gelen veriyi işle (unflatten)
        const unflattened: Record<string, any> = {};
        for (const [key, value] of Object.entries(apiData)) {
          if (key.includes('.')) {
            const parts = key.split('.');
            let current = unflattened;
            for (let i = 0; i < parts.length - 1; i++) {
              if (!current[parts[i]]) current[parts[i]] = {};
              current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = value;
          } else {
            unflattened[key] = value;
          }
        }

        // Deep merge fonksiyonu: API verilerini yerel verilerin üzerine yaz
        const deepMerge = (target: any, source: any) => {
          for (const key in source) {
            if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
              Object.assign(source[key], deepMerge(target[key], source[key]));
            }
          }
          Object.assign(target || {}, source);
          return target;
        };

        messages = deepMerge(messages, unflattened);
      }
    }
  } catch (error) {
    console.error('Translation API error:', error);
    // API hatasında sadece yerel dosyayı kullanmaya devam et
  }

  return {
    locale: safeLocale,
    messages
  };
});

