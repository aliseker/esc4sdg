import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, Users, Sparkles } from 'lucide-react';
import AnimateInView from '@/components/UI/AnimateInView';
import type { Locale } from '@/lib/partners';
import { PartnersGrid } from '@/components/Partners/PartnersGrid';

export const dynamic = 'force-dynamic';

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

      {/* Partner Organisations - API'den veya statik listeden, tarayıcıda çekiliyor */}
      <PartnersGrid locale={locale} />
    </div>
  );
}
