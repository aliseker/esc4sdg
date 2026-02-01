'use client';

import { ArrowRight, Play, Users, Sparkles, Trophy, Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import PacmanBackground from '@/components/UI/PacmanBackground';

const Hero = () => {
  const t = useTranslations('home');

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Pac-Man animation (behind content) - do not modify */}
      <PacmanBackground />
      
      {/* Colorful gradient layers - About style */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-emerald-50/60 to-amber-50/50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_120%,rgba(251,146,60,0.2),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_-10%,rgba(168,85,247,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-dots opacity-40" />

      {/* Floating decorative shapes */}
      <div className="absolute top-1/4 right-[10%] w-64 h-64 rounded-full bg-teal-300/25 blur-3xl animate-float" />
      <div className="absolute bottom-1/4 left-[5%] w-48 h-48 rounded-full bg-orange-200/20 blur-3xl animate-float-slow" />
      <div className="absolute top-1/2 right-[20%] w-24 h-24 rounded-full bg-violet-200/20 blur-2xl animate-float" />
      <div className="absolute top-1/3 left-[15%] w-3 h-3 rounded-full bg-teal-400/50 animate-float-slow" />
      <div className="absolute bottom-1/3 right-[30%] w-2 h-2 rounded-full bg-orange-400/50 animate-float" />
      <div className="absolute top-2/3 left-[20%] w-4 h-4 rounded-full bg-violet-300/40 animate-float-slow" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 lg:pt-12 pb-10 lg:pb-14 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <div className="text-center lg:text-left">
            <p className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm text-stone-700 text-sm font-bold mb-8 border border-stone-200/80 shadow-lg shadow-stone-200/30 animate-fade-up animate-delay-0">
              <Sparkles className="w-4 h-4 text-teal-500" />
              {t('badge')}
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6 text-stone-900 animate-fade-up animate-delay-75">
              <span className="block">{t('title1')}</span>
              <span className="block mt-1 text-stone-800 animate-fade-up animate-delay-150">{t('title2')}</span>
              <span className="block mt-1 bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent animate-fade-up animate-delay-200">{t('title3')}</span>
            </h1>
            <p className="text-base sm:text-lg text-stone-600 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed animate-fade-up animate-delay-300 font-medium">
              {t('subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-up animate-delay-400">
              <Link
                href="/courses"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 text-white rounded-2xl font-bold text-lg hover:from-teal-700 hover:via-emerald-700 hover:to-teal-700 transition-all shadow-xl shadow-teal-500/30 hover:shadow-teal-500/40 hover:-translate-y-0.5"
              >
                {t('ctaPrimary')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/90 backdrop-blur-sm text-stone-800 rounded-2xl font-bold text-lg border-2 border-stone-200 hover:border-teal-200 hover:bg-teal-50/50 hover:text-teal-800 transition-all shadow-xl shadow-stone-200/30 hover:shadow-teal-200/20"
              >
                <Play className="w-5 h-5 text-teal-600" />
                {t('ctaSecondary')}
              </button>
            </div>
          </div>

          {/* Bento stats – About style vibrant */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 grid-rows-[auto_auto_auto]">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-600 p-6 sm:p-7 text-white shadow-2xl shadow-teal-500/30 col-span-2 row-span-1 card-hover-lift animate-fade-up animate-delay-300">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-black tracking-tight">150+</div>
                  <div className="text-sm font-semibold text-white/90">Aktif Kurs</div>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 p-5 sm:p-6 text-white shadow-2xl shadow-orange-500/30 card-hover-lift animate-fade-up animate-delay-400">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="text-2xl sm:text-3xl font-black tracking-tight">25K+</div>
                <div className="text-sm font-semibold text-white/90">Öğrenci</div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-violet-600 p-5 sm:p-6 text-white shadow-2xl shadow-violet-500/30 card-hover-lift animate-fade-up animate-delay-500">
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/10 rounded-full translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                  <Trophy className="w-6 h-6" />
                </div>
                <div className="text-2xl sm:text-3xl font-black tracking-tight">50+</div>
                <div className="text-sm font-semibold text-white/90">Sertifika</div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm border-2 border-stone-100 p-5 sm:p-6 shadow-xl shadow-stone-200/40 card-hover-lift col-span-2 animate-fade-up animate-delay-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-stone-900">12</div>
                    <div className="text-sm font-semibold text-stone-500">Dil</div>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {['tr', 'en', 'de', 'fr'].map((l) => (
                    <span key={l} className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-600 uppercase hover:bg-orange-100 hover:text-orange-700 transition-colors">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
