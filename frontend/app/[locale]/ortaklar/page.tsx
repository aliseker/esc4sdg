import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Users, Sparkles } from 'lucide-react';
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
      {/* Hero – sitenin tasarım diline uyumlu (Proje/Hakkımızda gibi) */}
      <section className="relative min-h-[55vh] flex items-center pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-600" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_120%,rgba(251,146,60,0.35),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_-10%,rgba(168,85,247,0.25),transparent)]" />

        <div className="absolute top-20 left-[10%] w-20 h-20 rounded-full bg-white/10 animate-float" />
        <div className="absolute top-40 right-[15%] w-32 h-32 rounded-full bg-white/5 animate-float-slow" />
        <div className="absolute bottom-20 left-[20%] w-16 h-16 rounded-2xl bg-orange-400/20 rotate-12 animate-float" />
        <div className="absolute bottom-32 right-[10%] w-24 h-24 rounded-full bg-purple-400/15 animate-float-slow" />
        <div className="absolute top-1/2 left-[5%] w-3 h-3 rounded-full bg-white/40 animate-pulse" />
        <div className="absolute top-1/3 right-[25%] w-2 h-2 rounded-full bg-yellow-300/60 animate-pulse" />
        <div className="absolute top-24 right-[10%] opacity-20">
          <Users className="w-28 h-28 text-white rotate-12" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimateInView animation="fade-up" delay={100}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-bold mb-8 border border-white/20">
              <Sparkles className="w-4 h-4" />
              {t('partners')}
            </div>
          </AnimateInView>
          <AnimateInView animation="fade-up" delay={150}>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 drop-shadow-lg">
              {t('partnerOrganisations')}
            </h1>
          </AnimateInView>
          <AnimateInView animation="fade-up" delay={200}>
            <p className="text-xl sm:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto font-medium">
              {t('partnerGridDesc')}
            </p>
          </AnimateInView>
        </div>
      </section>

      {/* Partner kartları – Hakkımızda/Proje bölüm stili */}
      <PartnersGrid locale={locale} />
    </div>
  );
}
