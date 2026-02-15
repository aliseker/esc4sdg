'use client';

import { Award, ArrowRight, CheckCircle, Download, Shield, GraduationCap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import AnimateInView from '@/components/UI/AnimateInView';

const benefitKeys = [
  { key: 1, icon: Award, gradient: 'from-amber-500/20 to-orange-500/20' },
  { key: 2, icon: CheckCircle, gradient: 'from-teal-500/20 to-emerald-500/20' },
  { key: 3, icon: Download, gradient: 'from-violet-500/20 to-purple-500/20' },
  { key: 4, icon: Shield, gradient: 'from-amber-500/20 to-yellow-500/20' },
];

const CertificateSection = () => {
  const t = useTranslations('certificateSection');
  return (
  <section className="relative pt-12 lg:pt-16 pb-24 lg:pb-28 overflow-hidden">
    {/* Vibrant gradient - flows from projects */}
    <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 text-white" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_120%,rgba(251,146,60,0.25),transparent_50%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_-10%,rgba(168,85,247,0.2),transparent_50%)]" />
    <div className="absolute inset-0 bg-dots opacity-15" />
    <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
    <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/15 to-transparent" />

    {/* Floating shapes */}
    <div className="absolute top-1/4 right-[15%] w-40 h-40 rounded-full bg-white/5 blur-3xl animate-float" />
    <div className="absolute bottom-1/3 left-[10%] w-32 h-32 rounded-full bg-amber-400/10 blur-3xl animate-float-slow" />
    <div className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full bg-purple-400/10 blur-2xl animate-float" />

    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left: CTA block */}
        <AnimateInView animation="fade-up" className="lg:col-span-5">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-bold mb-6 border border-white/20">
            <Award className="w-4 h-4" />
            {t('badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 tracking-tight">
            {t('title')} <span className="text-amber-300">{t('titleHighlight')}</span>
          </h2>
          <p className="text-lg text-teal-100 mb-8 leading-relaxed font-medium">
            {t('description')}
          </p>
          <Link
            href="/courses"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-stone-900 rounded-2xl font-bold hover:from-amber-400 hover:via-yellow-400 hover:to-amber-400 transition-all shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/40 hover:-translate-y-0.5"
          >
            <GraduationCap className="w-5 h-5" />
            {t('cta')}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </AnimateInView>

        {/* Right: Bento benefits grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {benefitKeys.map((item, i) => {
            const Icon = item.icon;
            return (
              <AnimateInView key={item.key} animation="fade-up" delay={i * 100}>
                <div className={`group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl p-6 border-2 border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-500 card-hover-lift`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-bold text-white mb-2 text-lg">{t(`benefit${item.key}Title`)}</h3>
                    <p className="text-sm text-teal-100 leading-relaxed">{t(`benefit${item.key}Desc`)}</p>
                  </div>
                </div>
              </AnimateInView>
            );
          })}
        </div>
      </div>
    </div>
  </section>
  );
};

export default CertificateSection;
