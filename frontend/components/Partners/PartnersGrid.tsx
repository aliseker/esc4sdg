'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Users, MapPin, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import AnimateInView from '@/components/UI/AnimateInView';
import { getPartners, type PartnerItem } from '@/lib/publicApi';
import { API_BASE } from '@/lib/authApi';
import { partners } from '@/lib/partners';
import type { Locale } from '@/lib/partners';
import logoImg from '@/images/logo.jpg';

type DisplayPartner = {
  id: number;
  name: string;
  country: string;
  website?: string | null;
  description: string;
  logoUrl?: string | null;
  type?: string;
  countryCode?: string;
  role?: string;
};

function toDisplayFromApi(p: PartnerItem): DisplayPartner {
  return {
    id: p.id,
    name: p.name,
    country: p.country,
    website: p.website,
    description: p.description ?? '',
    logoUrl: p.logoUrl,
  };
}

function toDisplayFromStatic(locale: Locale) {
  return partners.map((p) => ({
    id: p.id,
    name: p.name,
    country: p.country,
    website: p.website,
    description: p.description[locale] ?? p.description.tr,
    logoUrl: null as string | null,
    type: p.type,
    countryCode: p.countryCode,
    role: p.role,
  }));
}

export function PartnersGrid({ locale }: { locale: Locale }) {
  const t = useTranslations('partners');
  const [displayList, setDisplayList] = useState<DisplayPartner[]>(() => toDisplayFromStatic(locale));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPartners(locale)
      .then((apiPartners) => {
        if (apiPartners.length > 0) {
          setDisplayList(apiPartners.map(toDisplayFromApi));
        } else {
          setDisplayList(toDisplayFromStatic(locale));
        }
      })
      .catch(() => {
        setDisplayList(toDisplayFromStatic(locale));
      })
      .finally(() => setLoading(false));
  }, [locale]);

  const partnerLogoSrc = (url: string | null | undefined) => {
    if (!url) return logoImg;
    return url.startsWith('http') ? url : `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const themes = [
    { gradient: 'from-teal-500/90 via-emerald-500/80 to-teal-600/90', badge: 'from-teal-500 to-emerald-500', border: 'hover:border-teal-300' },
    { gradient: 'from-orange-500/90 via-amber-500/80 to-orange-600/90', badge: 'from-orange-500 to-amber-500', border: 'hover:border-orange-300' },
    { gradient: 'from-violet-500/90 via-purple-500/80 to-violet-600/90', badge: 'from-violet-500 to-purple-500', border: 'hover:border-violet-300' },
  ];

  return (
    <section className="relative py-20 lg:py-28">
      <div className="absolute inset-0 bg-dots opacity-30" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-violet-200/15 rounded-full blur-3xl -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-200/15 rounded-full blur-3xl translate-x-1/2" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateInView animation="fade-up" className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-violet-100 text-violet-700 text-sm font-bold mb-6 border border-violet-200/60">
            <Users className="w-4 h-4" />
            {t('partnerCount', { count: displayList.length })}
            {loading && ' ...'}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 mb-4 tracking-tight">
            {t('partnerOrganisations')}
          </h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto font-medium">
            {t('partnerGridDesc')}
          </p>
        </AnimateInView>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayList.map((partner, i) => {
              const isCoordinator = !!partner.role;
              const theme = themes[i % 3];
              const logoSrc = partnerLogoSrc(partner.logoUrl);
              return (
                <AnimateInView key={partner.id} animation="fade-up" delay={Math.min(i * 60, 300)}>
                  <div
                    className={`group relative overflow-hidden rounded-2xl bg-white shadow-lg shadow-stone-200/40 border-2 border-stone-200/80 ${theme.border} hover:shadow-xl transition-all duration-300 flex flex-col h-full`}
                  >
                    <div className="relative w-full aspect-[16/10] flex-shrink-0 overflow-hidden bg-stone-100 flex items-center justify-center p-4">
                      <Image
                        src={logoSrc}
                        alt={partner.name}
                        fill
                        className={partner.logoUrl ? 'object-contain group-hover:scale-105 transition-transform duration-500' : 'object-cover group-hover:scale-105 transition-transform duration-500'}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${theme.gradient} opacity-40`} />
                      {partner.countryCode && (
                        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-sm shadow">
                          <span className="text-xs font-bold text-stone-700">{partner.countryCode}</span>
                        </div>
                      )}
                      {isCoordinator && (
                        <div className={`absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-gradient-to-r ${theme.badge} text-white text-xs font-bold shadow`}>
                          {t('coordinator')}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-5 flex flex-col">
                      {partner.type && (
                        <span className="inline-flex w-fit px-2.5 py-1 rounded-lg bg-stone-100 text-stone-600 text-xs font-semibold mb-3">
                          {partner.type}
                        </span>
                      )}
                      {partner.website ? (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-black text-stone-900 mb-2 leading-tight hover:text-teal-600 transition-colors underline-offset-4 hover:underline"
                        >
                          {partner.name}
                        </a>
                      ) : (
                        <h3 className="text-lg font-black text-stone-900 mb-2 leading-tight">
                          {partner.name}
                        </h3>
                      )}
                      <p className="flex items-center gap-1.5 text-xs text-stone-500 mb-3">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        {partner.country}
                      </p>
                      {partner.description && (
                        <p className="text-stone-600 leading-relaxed text-sm flex-1 mb-4">
                          {partner.description}
                        </p>
                      )}
                      {partner.website && (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-bold text-teal-600 hover:text-teal-700 mt-auto"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {t('website')}
                        </a>
                      )}
                    </div>
                  </div>
                </AnimateInView>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
