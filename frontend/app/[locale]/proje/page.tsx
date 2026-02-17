import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import {
  ArrowRight,
  Target,
  Award,
  Sparkles,

  MapPin,
  GraduationCap,
  Layers,
} from 'lucide-react';
import AnimateInView from '@/components/UI/AnimateInView';
import { getProjectsList } from '@/lib/projects';
import ProjectListClient from './ProjectListClient';


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'projects' });
  return {
    title: `${t('title')} – Escape4SDG`,
    description: t('subtitle'),
  };
}

export default async function ProjePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'projects' });
  const tList = await getTranslations({ locale, namespace: 'projectsList' });
  const projects = await getProjectsList(locale);

  const objectives = [t('objectives.0'), t('objectives.1'), t('objectives.2')];
  const results = [t('results.0'), t('results.1'), t('results.2'), t('results.3'), t('results.4')];



  return (
    <div className="min-h-screen bg-stone-50 overflow-hidden">
      {/* Hero - Orange/Amber gradient (project-focused like Ecceludus) */}
      <section className="relative min-h-[65vh] flex items-center pt-20 pb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_120%,rgba(251,146,60,0.4),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_-10%,rgba(168,85,247,0.2),transparent)]" />

        <div className="absolute top-20 left-[10%] w-20 h-20 rounded-full bg-white/10 animate-float" />
        <div className="absolute top-40 right-[15%] w-32 h-32 rounded-full bg-white/5 animate-float-slow" />
        <div className="absolute bottom-20 left-[20%] w-16 h-16 rounded-2xl bg-teal-400/20 rotate-12 animate-float" />
        <div className="absolute bottom-32 right-[10%] w-24 h-24 rounded-full bg-purple-400/15 animate-float-slow" />
        <div className="absolute top-1/2 left-[5%] opacity-20">
          <Layers className="w-32 h-32 text-white rotate-12" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimateInView animation="fade-up" delay={100}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-bold mb-8 border border-white/20">
              <Sparkles className="w-4 h-4" />
              {t('badge')}
            </div>
          </AnimateInView>
          <AnimateInView animation="fade-up" delay={150}>
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
        </div>
      </section>

      <ProjectListClient projects={projects} />

      {/* Objectives & Results - Bento (Ecceludus style) */}
      <section className="relative py-10 lg:py-16">
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl translate-x-1/2" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateInView animation="fade-up" delay={0}>
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-bold mb-4">
                <Target className="w-4 h-4" />
                {t('objectivesResultsBadge')}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900">
                {t('whatWeDoTitle')}
              </h2>
            </div>
          </AnimateInView>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <AnimateInView animation="fade-up" delay={100} className="lg:col-span-7">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 p-8 sm:p-10 text-white h-full group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute top-1/2 right-8 opacity-10">
                  <Target className="w-32 h-32" />
                </div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                      <Target className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-bold">{t('objectivesTitle')}</h3>
                  </div>
                  <ul className="space-y-5">
                    {objectives.map((obj, i) => (
                      <li key={i} className="flex gap-4">
                        <span className="shrink-0 w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-sm font-bold">
                          {i + 1}
                        </span>
                        <span className="text-white/90 leading-relaxed text-lg">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimateInView>

            <AnimateInView animation="fade-up" delay={200} className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-3xl bg-white border-2 border-stone-100 p-8 sm:p-10 shadow-xl shadow-stone-200/40 h-full group hover:border-teal-200 transition-colors">
                <div className="absolute top-0 right-0 w-40 h-40 bg-teal-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-60" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg">
                      <Award className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-stone-900">{t('resultsTitle')}</h3>
                  </div>
                  <ul className="space-y-4">
                    {results.map((res, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center mt-0.5">
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



    </div>
  );
}
