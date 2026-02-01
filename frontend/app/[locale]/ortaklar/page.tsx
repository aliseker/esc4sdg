import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { ArrowLeft, Users, Sparkles, MapPin, ExternalLink } from 'lucide-react';
import AnimateInView from '@/components/UI/AnimateInView';
import { partners } from '@/lib/partners';
import type { Locale } from '@/lib/partners';
import logoImg from '@/images/logo.jpg';

export async function generateMetadata() {
  const t = await getTranslations('partners');
  return {
    title: `${t('title')} – Escape4SDG`,
    description: t('subtitle'),
  };
}

export default async function OrtaklarPage() {
  const t = await getTranslations('partners');
  const locale = (await getLocale()) as Locale;

  return (
    <div className="min-h-screen bg-stone-50 overflow-hidden">
      {/* Hero - Ecceludus partner style with longer intro */}
      <section className="relative min-h-[50vh] flex items-center pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-500 to-violet-600" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_120%,rgba(251,146,60,0.25),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_-10%,rgba(20,184,166,0.2),transparent)]" />
        <div className="absolute top-20 left-[10%] w-24 h-24 rounded-full bg-white/10 animate-float" />
        <div className="absolute bottom-20 right-[15%] w-32 h-32 rounded-full bg-white/5 animate-float-slow" />
        <div className="absolute top-1/2 left-[5%] opacity-20">
          <Users className="w-32 h-32 text-white rotate-12" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimateInView animation="fade-up" delay={0}>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('back')}
            </Link>
          </AnimateInView>
          <AnimateInView animation="fade-up" delay={100}>
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-bold mb-6 border border-white/20">
              <Sparkles className="w-4 h-4" />
              {t('badge')}
            </span>
          </AnimateInView>
          <AnimateInView animation="fade-up" delay={150}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 drop-shadow-lg">
              {t('title')}
            </h1>
          </AnimateInView>
          <AnimateInView animation="fade-up" delay={200}>
            <p className="text-lg sm:text-xl text-white/90 leading-relaxed mb-6 font-medium">
              {t('subtitle')}
            </p>
          </AnimateInView>
          <AnimateInView animation="fade-up" delay={250}>
            <p className="text-white/80 leading-relaxed text-base sm:text-lg max-w-2xl mx-auto">
              {t('intro')}
            </p>
          </AnimateInView>
        </div>
      </section>

      {/* Intro card */}
      <section className="relative -mt-8 z-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <AnimateInView animation="fade-up" delay={0}>
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl shadow-stone-200/60 border-2 border-stone-100 p-8 sm:p-10">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-violet-100 to-teal-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-60" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full translate-y-1/2 -translate-x-1/2 opacity-50" />
              <p className="relative text-stone-600 leading-relaxed text-base sm:text-lg text-center font-medium">
                {t('introDetail')}
              </p>
            </div>
          </AnimateInView>
        </div>
      </section>

      {/* Partner Organisations - Logo cards with descriptions */}
      <section className="relative py-20 lg:py-28">
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-violet-200/15 rounded-full blur-3xl -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-200/15 rounded-full blur-3xl translate-x-1/2" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateInView animation="fade-up" className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-violet-100 text-violet-700 text-sm font-bold mb-6 border border-violet-200/60">
              <Users className="w-4 h-4" />
              {t('partnerCount', { count: partners.length })}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 mb-4 tracking-tight">
              {t('partnerOrganisations')}
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto font-medium">
              {t('partnerGridDesc')}
            </p>
          </AnimateInView>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner, i) => {
              const description = partner.description[locale] ?? partner.description.tr;
              const isCoordinator = !!partner.role;
              const themes = [
                { gradient: 'from-teal-500/90 via-emerald-500/80 to-teal-600/90', badge: 'from-teal-500 to-emerald-500', border: 'hover:border-teal-300' },
                { gradient: 'from-orange-500/90 via-amber-500/80 to-orange-600/90', badge: 'from-orange-500 to-amber-500', border: 'hover:border-orange-300' },
                { gradient: 'from-violet-500/90 via-purple-500/80 to-violet-600/90', badge: 'from-violet-500 to-purple-500', border: 'hover:border-violet-300' },
              ];
              const theme = themes[i % 3];
              const content = (
                <>
                  {/* Logo */}
                  <div className="relative w-full aspect-[16/10] flex-shrink-0 overflow-hidden bg-stone-100">
                    <Image
                      src={logoImg}
                      alt={partner.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${theme.gradient} opacity-40`} />
                    <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-sm shadow">
                      <span className="text-xs font-bold text-stone-700">{partner.countryCode}</span>
                    </div>
                    {isCoordinator && (
                      <div className={`absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-gradient-to-r ${theme.badge} text-white text-xs font-bold shadow`}>
                        {t('coordinator')}
                      </div>
                    )}
                  </div>

                  {/* Content - Ecceludus style: name (link) + description */}
                  <div className="flex-1 p-5 flex flex-col">
                    <span className="inline-flex w-fit px-2.5 py-1 rounded-lg bg-stone-100 text-stone-600 text-xs font-semibold mb-3">
                      {partner.type}
                    </span>
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
                    <p className="text-stone-600 leading-relaxed text-sm flex-1 mb-4">
                      {description}
                    </p>
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
                </>
              );

              return (
                <AnimateInView key={partner.id} animation="fade-up" delay={Math.min(i * 60, 300)}>
                  <div
                    className={`group relative overflow-hidden rounded-2xl bg-white shadow-lg shadow-stone-200/40 border-2 border-stone-200/80 ${theme.border} hover:shadow-xl transition-all duration-300 flex flex-col h-full`}
                  >
                    {content}
                  </div>
                </AnimateInView>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
