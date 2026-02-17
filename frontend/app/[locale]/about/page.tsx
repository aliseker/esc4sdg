import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import {
  ArrowRight,
  Target,
  Award,
  Sparkles,
  BookOpen,
  Puzzle,
  Zap,
  Users,
  Globe,
  Gamepad2,
  Trophy,
  Rocket,
  Share2,
  HelpCircle,
  UserPlus,
  BookOpenCheck,
  ClipboardCheck,
  GraduationCap
} from 'lucide-react';
import AnimateInView from '@/components/UI/AnimateInView';
import { SocialLinks } from '@/components/UI/SocialLinks';
import { getSocialLinks, getPartners, getLanguages } from '@/lib/publicApi';
import { getCoursesList } from '@/lib/coursesApi';

export async function generateMetadata() {
  const t = await getTranslations('about');
  return {
    title: `${t('title')} – Escape4SDG`,
    description: t('subtitle'),
  };
}

export default async function AboutPage() {
  const t = await getTranslations('about');
  const locale = (await getLocale()) ?? 'tr';
  const [socialLinks, courses, partners, languages] = await Promise.all([
    getSocialLinks(),
    getCoursesList(locale).catch(() => []),
    getPartners(locale).catch(() => []),
    getLanguages().catch(() => []),
  ]);

  const objectives = [
    t('objectives.0'),
    t('objectives.1'),
    t('objectives.2'),
  ];

  const results = [
    t('results.0'),
    t('results.1'),
    t('results.2'),
    t('results.3'),
    t('results.4'),
  ];

  const stats = [
    { value: String(courses.length), label: t('stats.moocModules'), icon: BookOpen, color: 'from-teal-500 to-emerald-500' },
    { value: String(partners.length), label: t('stats.partners'), icon: Users, color: 'from-orange-500 to-amber-500' },
    { value: String(languages.length), label: t('stats.languages'), icon: Globe, color: 'from-violet-500 to-purple-500' },
    { value: '∞', label: t('stats.learningOpportunity'), icon: Rocket, color: 'from-pink-500 to-rose-500' },
  ];

  const cards = [
    {
      icon: BookOpen,
      title: t('moocCardTitle'),
      desc: t('moocCardDesc'),
      gradient: 'from-teal-500 via-emerald-500 to-teal-600',
      shadow: 'shadow-teal-500/30',
      href: '/courses',
    },
    {
      icon: Puzzle,
      title: t('escapeCardTitle'),
      desc: t('escapeCardDesc'),
      gradient: 'from-orange-500 via-amber-500 to-orange-600',
      shadow: 'shadow-orange-500/30',
      href: '/proje',
    },
    {
      icon: Zap,
      title: t('hubCardTitle'),
      desc: t('hubCardDesc'),
      gradient: 'from-violet-500 via-purple-500 to-violet-600',
      shadow: 'shadow-violet-500/30',
      href: '/courses',
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 overflow-hidden">
      {/* Hero - Colorful & Dynamic */}
      <section className="relative min-h-[70vh] flex items-center pt-20 pb-16 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-emerald-400 to-teal-600" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_120%,rgba(251,146,60,0.4),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_-10%,rgba(168,85,247,0.3),transparent)]" />

        {/* Decorative floating shapes */}
        <div className="absolute top-20 left-[10%] w-20 h-20 rounded-full bg-white/10 animate-float" />
        <div className="absolute top-40 right-[15%] w-32 h-32 rounded-full bg-white/5 animate-float-slow" />
        <div className="absolute bottom-20 left-[20%] w-16 h-16 rounded-2xl bg-orange-400/20 rotate-12 animate-float" />
        <div className="absolute bottom-32 right-[10%] w-24 h-24 rounded-full bg-purple-400/15 animate-float-slow" />
        <div className="absolute top-1/2 left-[5%] w-3 h-3 rounded-full bg-white/40 animate-pulse" />
        <div className="absolute top-1/3 right-[25%] w-2 h-2 rounded-full bg-yellow-300/60 animate-pulse" />
        <div className="absolute bottom-1/4 left-[40%] w-4 h-4 rounded-full bg-white/30 animate-float" />

        {/* Game controller decoration */}
        <div className="absolute top-24 right-[8%] opacity-20">
          <Gamepad2 className="w-32 h-32 text-white rotate-12" />
        </div>
        <div className="absolute bottom-16 left-[5%] opacity-15">
          <Trophy className="w-24 h-24 text-white -rotate-12" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimateInView animation="fade-up" delay={0}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-bold mb-8 border border-white/20">
              <Sparkles className="w-4 h-4" />
              {t('badge')}
            </div>
          </AnimateInView>

          <AnimateInView animation="fade-up" delay={100}>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 drop-shadow-lg">
              {t('title')}
            </h1>
          </AnimateInView>

          <AnimateInView animation="fade-up" delay={200}>
            <p className="text-xl sm:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto mb-8 font-medium">
              {t('subtitle')}
            </p>
          </AnimateInView>

          <AnimateInView animation="fade-up" delay={300}>
            <p className="text-white/75 leading-relaxed max-w-2xl mx-auto text-lg">
              {t('intro')}
            </p>
          </AnimateInView>

          {/* Scroll indicator */}
          <AnimateInView animation="fade-up" delay={400}>
            <div className="mt-12 flex justify-center">
              <div className="w-8 h-14 rounded-full border-2 border-white/40 flex items-start justify-center p-2">
                <div className="w-1.5 h-3 bg-white/60 rounded-full animate-bounce" />
              </div>
            </div>
          </AnimateInView>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative -mt-8 z-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <AnimateInView key={i} animation="fade-up" delay={i * 100}>
                  <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-xl shadow-stone-200/50 border border-stone-100 group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />
                    <div className="relative flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-3xl font-black text-stone-900">{stat.value}</div>
                        <div className="text-sm font-medium text-stone-500">{stat.label}</div>
                      </div>
                    </div>
                  </div>
                </AnimateInView>
              );
            })}
          </div>
        </div>
      </section>

      {/* Objectives & Results - Bento Style */}
      <section className="relative py-12 lg:py-16">
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl translate-x-1/2" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateInView animation="fade-up" delay={0}>
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-teal-700 text-sm font-bold mb-4">
                <Target className="w-4 h-4" />
                {t('missionVisionBadge')}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900">
                {t('whatWeDoTitle')}
              </h2>
            </div>
          </AnimateInView>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Objectives Card - Large */}
            <AnimateInView animation="fade-up" delay={100} className="lg:col-span-7">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-600 p-8 sm:p-10 text-white h-full group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="absolute top-1/2 right-8 opacity-10">
                  <Target className="w-32 h-32" />
                </div>

                <div className="relative">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <Target className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-bold">{t('objectivesTitle')}</h3>
                  </div>

                  <ul className="space-y-5">
                    {objectives.map((obj, i) => (
                      <li key={i} className="flex gap-4 group/item">
                        <span className="shrink-0 w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-sm font-bold mt-0.5 group-hover/item:bg-white/30 transition-colors">
                          {i + 1}
                        </span>
                        <span className="text-white/90 leading-relaxed text-lg">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimateInView>

            {/* Results Card */}
            <AnimateInView animation="fade-up" delay={200} className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-3xl bg-white border-2 border-stone-100 p-8 sm:p-10 shadow-xl shadow-stone-200/40 h-full group hover:border-orange-200 transition-colors">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-60" />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                      <Award className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-stone-900">{t('resultsTitle')}</h3>
                  </div>

                  <ul className="space-y-4">
                    {results.map((res, i) => (
                      <li key={i} className="flex gap-3 group/item">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mt-0.5 shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-white" />
                        </span>
                        <span className="text-stone-600 leading-relaxed">{res}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimateInView>
          </div>
        </div>
      </section>

      {/* Sosyal Medya - panelden eklenen linkler */}
      <section className="relative py-10 lg:py-12 bg-white border-t border-stone-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateInView animation="fade-up" delay={0}>
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-teal-700 text-sm font-bold mb-4">
                <Share2 className="w-4 h-4" />
                {t('socialTitle')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">
                {t('socialHeading')}
              </h2>
            </div>
          </AnimateInView>
          <AnimateInView animation="fade-up" delay={100}>
            <SocialLinks variant="about" initialLinks={socialLinks} />
          </AnimateInView>
        </div>
      </section>

      {/* Nasıl çalışır? - How it works */}
      <section id="how-it-works" className="relative py-12 lg:py-16 scroll-mt-24">
        <div className="absolute inset-0 bg-dots opacity-20" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateInView animation="fade-up" delay={0}>
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-800 text-sm font-bold mb-4">
                <HelpCircle className="w-4 h-4" />
                {t('howItWorksTitle')}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 mb-4">
                {t('howItWorksTitle')}
              </h2>
              <p className="text-stone-500 text-lg max-w-2xl mx-auto">
                {t('howItWorksSubtitle')}
              </p>
            </div>
          </AnimateInView>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: UserPlus, title: t('howItWorksStep1Title'), desc: t('howItWorksStep1Desc'), step: '1' },
              { icon: BookOpenCheck, title: t('howItWorksStep2Title'), desc: t('howItWorksStep2Desc'), step: '2' },
              { icon: ClipboardCheck, title: t('howItWorksStep3Title'), desc: t('howItWorksStep3Desc'), step: '3' },
              { icon: GraduationCap, title: t('howItWorksStep4Title'), desc: t('howItWorksStep4Desc'), step: '4' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <AnimateInView key={i} animation="fade-up" delay={i * 100}>
                  <div className="relative rounded-2xl bg-white border-2 border-stone-100 p-6 shadow-lg shadow-stone-200/30 hover:shadow-xl hover:border-amber-200 transition-all h-full flex flex-col">
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-lg font-black">
                      {item.step}
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/30">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-stone-900 mb-2">{item.title}</h3>
                    <p className="text-stone-600 text-sm leading-relaxed">{item.desc}</p>
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
