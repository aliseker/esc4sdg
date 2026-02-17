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
      let messages = await res.json();
      if (messages && typeof messages === 'object' && Object.keys(messages).length > 0) {
        // API'den gelen veriler düz (flat) olabilir (örn: "courses.level_beginner").
        // Next-intl iç içe (nested) yapı bekler. Bu yüzden noktaları parse ediyoruz.
        const unflattened: Record<string, any> = {};
        for (const key in messages) {
          const value = messages[key];
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
        // Eğer API hem nested hem flat dönüyorsa, deep merge gerekebilir ama basitçe
        // unflattened yapıyı kullanmak genellikle yeterlidir.
        // Ancak mevcut yapıda "courses" gibi anahtarlar zaten nested ise, yukarıdaki döngü
        // onları zaten unflattened["courses"] = ... diye alacak.
        // Tek sorun: "courses" hem obje hem de "courses.level" diye string key gelirse çakışma olabilir.
        // Bu yüzden güvenli bir merge yapalım.

        const deepMerge = (target: any, source: any) => {
          for (const key in source) {
            if (source[key] instanceof Object && key in target) {
              Object.assign(source[key], deepMerge(target[key], source[key]));
            }
          }
          Object.assign(target || {}, source);
          return target;
        };

        // Basit çözüm: Önce API'den gelen her şeyi işle.
        // Eğer Backend zaten nested ve flat karışık gönderiyorsa, bunu düzeltmek gerekir.
        // Şimdilik sadece nokta içerenleri yuvalayalım (nested hale getirelim).

        // Daha sağlam bir unflatten fonksiyonu:
        const result: any = {};
        for (const [k, v] of Object.entries(messages)) {
          const parts = k.split('.');
          let current = result;
          for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!(part in current) || typeof current[part] !== 'object') {
              // Eğer burası daha önce string olarak tanımlandıysa, objeye çevir (bu nadir olur)
              // Ama genelde "common": {...} vardır, sonra "common.newKey" gelir.
              // Bu durumda current[part] zaten dolu bir objedir, dokunma.
              if (!current[part]) current[part] = {};
            }
            current = current[part];
          }
          current[parts[parts.length - 1]] = v;
        }

        return { locale: safeLocale, messages: result };
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

