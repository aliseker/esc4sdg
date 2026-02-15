'use client';

import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import AnimateInView from '@/components/UI/AnimateInView';
import { getPartners, type PartnerItem } from '@/lib/publicApi';
import { API_BASE } from '@/lib/authApi';
import { partners } from '@/lib/partners';
import type { Locale } from '@/lib/partners';

type DisplayPartner = {
  id: number;
  name: string;
  country: string;
  website?: string | null;
  description: string;
  logoUrl?: string | null;
  logoPosition?: string | null;
  type?: string;
  countryCode?: string;
  role?: string;
};

function logoPositionToCss(pos: string | null | undefined): string {
  if (pos && pos.includes('%')) return pos;
  const map: Record<string, string> = {
    center: '50% 50%',
    top: '50% 0%',
    bottom: '50% 100%',
    left: '0% 50%',
    right: '100% 50%',
  };
  return (pos && map[pos]) ? map[pos] : '50% 50%';
}

function toDisplayFromApi(p: PartnerItem): DisplayPartner {
  return {
    id: p.id,
    name: p.name,
    country: p.country,
    website: p.website,
    description: p.description ?? '',
    logoUrl: p.logoUrl,
    logoPosition: p.logoPosition ?? null,
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
    logoPosition: null as string | null,
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
    if (!url) return null;
    return url.startsWith('http') ? url : `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <section className="relative py-20 lg:py-28">
      <div className="absolute inset-0 bg-dots opacity-30" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-stone-200/20 rounded-full blur-3xl translate-x-1/2" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayList.map((partner, i) => {
                const isCoordinator = !!partner.role;
                const logoSrc = partnerLogoSrc(partner.logoUrl);
                const hasLogo = !!logoSrc;
                return (
                  <AnimateInView key={partner.id} animation="fade-up" delay={Math.min(i * 50, 250)}>
                    <article className="relative flex flex-col h-full overflow-visible">
                      {/* Floating logo – fotodan daire kırpılmış, tek daire alan */}
                      <div className="absolute left-1/2 top-0 z-20 h-28 w-28 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-stone-100">
                        {hasLogo ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={logoSrc}
                            alt={partner.name}
                            className="h-full w-full object-cover"
                            style={{ objectPosition: logoPositionToCss(partner.logoPosition) }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Building2 className="h-10 w-10 text-stone-400" />
                          </div>
                        )}
                      </div>

                      {/* Kart gövdesi: overflow-hidden sadece burada, logo dışarıda kalır */}
                      <div
                        className="relative flex flex-1 flex-col rounded-[48px] bg-white overflow-hidden transition-shadow duration-200 hover:shadow-lg"
                        style={{
                          boxShadow:
                            '0 4px 6px -1px rgba(0,0,0,0.04), 0 2px 4px -2px rgba(0,0,0,0.03), -8px -8px 24px -8px rgba(107,89,211,0.08), 8px 8px 24px -8px rgba(107,89,211,0.06)',
                        }}
                      >
                        {/* Dekoratif köşe gölgeleri (sol üst / sağ alt oyuk hissi) */}
                        <div
                          className="pointer-events-none absolute -left-4 -top-4 h-24 w-24 rounded-full opacity-30"
                          style={{ background: 'radial-gradient(circle, rgba(107,89,211,0.15) 0%, transparent 70%)' }}
                          aria-hidden
                        />
                        <div
                          className="pointer-events-none absolute -bottom-4 -right-4 h-24 w-24 rounded-full opacity-30"
                          style={{ background: 'radial-gradient(circle, rgba(107,89,211,0.12) 0%, transparent 70%)' }}
                          aria-hidden
                        />

                        {/* İçerik – logo ile çakışmaması için üst padding */}
                        <div className="flex flex-1 flex-col pt-20 pb-6 px-6">
                          <div className="pb-4 text-center">
                            {partner.website ? (
                              <a
                                href={partner.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xl font-bold text-neutral-900 hover:text-neutral-700 hover:underline underline-offset-2 transition-colors block tracking-tight"
                              >
                                {partner.name}
                              </a>
                            ) : (
                              <h3 className="text-xl font-bold text-neutral-900 tracking-tight">
                                {partner.name}
                              </h3>
                            )}
                          </div>

                          {partner.description && (
                            <p className="flex-1 text-[15px] leading-[1.6] text-left text-neutral-600 break-words">
                              {partner.description}
                            </p>
                          )}

                          {isCoordinator && (
                            <div className="mt-4 pt-3 border-t border-neutral-200">
                              <span className="text-xs font-semibold uppercase tracking-wide text-teal-600">{t('coordinator')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  </AnimateInView>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
