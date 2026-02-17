'use client';

import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
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

function getLogoTransform(pos: string | null | undefined) {
  if (!pos) return { scale: 1, x: 50, y: 50 };

  // Support presets
  const map: Record<string, string> = {
    center: '50% 50% 320',
    top: '50% 0% 320',
    bottom: '50% 100% 320',
    left: '0% 50% 320',
    right: '100% 50% 320',
  };
  const value = map[pos] || pos;
  const match = value.match(/(\d+(?:\.\d+)?)\s*%\s*(\d+(?:\.\d+)?)\s*%(?:\s*(\d+(?:\.\d+)?))?/);

  if (match) {
    const x = Number(match[1]);
    const y = Number(match[2]);
    const size = match[3] ? Number(match[3]) : 320;
    // Base width in admin is 320px. 
    // Scale is inverse of the circle size relative to the container.
    const scale = 320 / Math.max(1, size);
    return { scale, x, y };
  }
  return { scale: 1, x: 50, y: 50 };
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

export default function PartnersGrid() {
  const t = useTranslations('Partners');
  const locale = useLocale();
  const [displayList, setDisplayList] = useState<DisplayPartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPartners(locale)
      .then((apiPartners) => {
        if (apiPartners.length > 0) {
          setDisplayList(apiPartners.map(toDisplayFromApi));
        } else {
          setDisplayList(toDisplayFromStatic(locale as Locale));
        }
      })
      .catch(() => {
        setDisplayList(toDisplayFromStatic(locale as Locale));
      })
      .finally(() => setLoading(false));
  }, [locale]);

  const partnerLogoSrc = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <section className="relative py-32 bg-[#fdfdfd] overflow-hidden">
      {/* Artistic Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-[-10%] w-[600px] h-[600px] bg-teal-600/[0.03] rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-[-10%] w-[600px] h-[600px] bg-orange-600/[0.03] rounded-full blur-[140px]" />
      </div>

      <div className="relative max-w-[1240px] mx-auto px-6 lg:px-12">
        {loading ? (
          <div className="flex justify-center py-32">
            <div className="w-16 h-16 border-4 border-teal-500/10 border-t-teal-500 rounded-full animate-spin" />
          </div>
        ) : (
          /* Manual 3-column masonry: Compact & Centered */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 pt-20 items-start">
            {[0, 1, 2].map((colIndex) => (
              <div key={colIndex} className="flex flex-col gap-y-20">
                {displayList
                  .filter((_, i) => (displayList.length <= 2 ? i === colIndex : i % 3 === colIndex))
                  .map((partner, i) => {
                    const isCoordinator = !!partner.role;
                    const logoSrc = partnerLogoSrc(partner.logoUrl);
                    const hasLogo = !!logoSrc;
                    const { scale, x, y } = getLogoTransform(partner.logoPosition);

                    return (
                      <AnimateInView
                        key={partner.id}
                        animation="fade-up"
                        delay={Math.min(i * 100, 400)}
                      >
                        <article className="group relative flex flex-col mb-10">
                          {/* Dynamic Glow Effect */}
                          <div className="absolute -inset-10 -z-10 bg-gradient-to-tr from-teal-500/20 via-stone-500/5 to-emerald-500/20 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[100px]" />

                          {/* Compact Floating Logo: High-precision relative anchor math */}
                          <div className="absolute left-1/2 -top-20 z-20 h-40 w-40 -translate-x-1/2 overflow-hidden rounded-full bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.18)] ring-[1px] ring-black/5 group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-500">
                            <div className="relative w-full h-full rounded-full bg-white">
                              {hasLogo ? (
                                <div
                                  className="absolute transition-all duration-500"
                                  style={{
                                    width: `${scale * 100}%`,
                                    height: `${scale * 100}%`,
                                    left: `${50 - (scale * (x - 50))}%`,
                                    top: `${50 - (scale * (y - 50))}%`,
                                    transform: 'translate(-50%, -50%)',
                                  }}
                                >
                                  <img
                                    src={logoSrc}
                                    alt={partner.name}
                                    className="w-full h-full object-contain"
                                    draggable={false}
                                  />
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Building2 className="h-10 w-10 text-stone-200" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Compact Card Body - Increased pt for logo clearance */}
                          <div
                            className={`relative flex flex-col bg-white pt-32 pb-10 px-8 transition-all duration-500
                                         shadow-[0_15px_50px_-15px_rgba(0,0,0,0.06)]
                                         group-hover:shadow-[0_45px_90px_-25px_rgba(0,0,0,0.14)]
                                         group-hover:-translate-y-2 border border-stone-100/30
                                         ${(colIndex + i) % 2 === 0
                                ? 'rounded-t-[60px] rounded-br-[120px] rounded-bl-[60px]'
                                : 'rounded-t-[120px] rounded-br-[60px] rounded-bl-[120px]'
                              }`}
                          >
                            {/* Subtle Brand Accent */}
                            <div className="absolute top-10 right-10">
                              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-teal-400 to-stone-400 opacity-60" />
                            </div>

                            <div className="text-center mb-8">
                              {partner.website ? (
                                <a
                                  href={partner.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-2xl sm:text-3xl font-[900] text-teal-600 hover:text-stone-950 transition-colors duration-300 block tracking-tight leading-[1.2] mb-4"
                                >
                                  {partner.name}
                                </a>
                              ) : (
                                <h3 className="text-2xl sm:text-3xl font-[900] text-teal-600 hover:text-stone-950 transition-colors duration-300 tracking-tight leading-[1.2] mb-4">
                                  {partner.name}
                                </h3>
                              )}

                              {partner.country && (
                                <span className="inline-flex items-center justify-center px-5 py-1.5 bg-stone-50/80 rounded-full text-[12px] font-bold uppercase tracking-[0.3em] text-stone-500 border border-stone-100">
                                  {partner.country}
                                </span>
                              )}
                            </div>

                            {partner.description && (
                              <div className="flex-1">
                                <div
                                  className="text-[17px] leading-[1.7] text-stone-700/90 text-center font-medium [&>p]:mb-4 [&>p:last-child]:mb-0 [&>strong]:text-[#1a1a1a] [&>strong]:font-black"
                                  dangerouslySetInnerHTML={{ __html: partner.description }}
                                />
                              </div>
                            )}

                            {isCoordinator && (
                              <div className="mt-10 pt-8 border-t border-stone-100/60 flex justify-center">
                                <div className="relative group/tag">
                                  <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-full blur-lg opacity-40" />
                                  <span className="relative px-8 py-2.5 rounded-full bg-stone-900 text-white text-[11px] font-black uppercase tracking-[0.2em]">
                                    {t('coordinator')}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </article>
                      </AnimateInView>
                    );
                  })}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
