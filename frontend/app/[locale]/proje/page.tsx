import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Target,
  Award,
  Sparkles,
  BookOpen,
  Puzzle,
  Zap,
  MapPin,
  GraduationCap,
  Layers,
} from 'lucide-react';
import AnimateInView from '@/components/UI/AnimateInView';
import { projects } from '@/lib/projects';

export async function generateMetadata() {
  const t = await getTranslations('projects');
  return {
    title: `${t('title')} – Escape4SDG`,
    description: t('subtitle'),
  };
}

export default async function ProjePage() {
  const t = await getTranslations('projects');

  const objectives = [t('objectives.0'), t('objectives.1'), t('objectives.2')];
  const results = [t('results.0'), t('results.1'), t('results.2'), t('results.3'), t('results.4')];

  const cards = [
    { icon: BookOpen, title: t('moocCardTitle'), desc: t('moocCardDesc'), gradient: 'from-teal-500 via-emerald-500 to-teal-600', shadow: 'shadow-teal-500/30', href: '/courses' },
    { icon: Puzzle, title: t('escapeCardTitle'), desc: t('escapeCardDesc'), gradient: 'from-orange-500 via-amber-500 to-orange-600', shadow: 'shadow-orange-500/30', href: '/courses' },
    { icon: Zap, title: t('hubCardTitle'), desc: t('hubCardDesc'), gradient: 'from-violet-500 via-purple-500 to-violet-600', shadow: 'shadow-violet-500/30', href: '/courses' },
  ];

  const [featured, ...restProjects] = projects;
  const FeaturedIcon = featured.icon;

  return (
    <div className="min-h-screen bg-stone-50 overflow-hidden">
      {/* Hero - Orange/Amber gradient (project-focused like Ecceludus) */}
      <section className="relative min-h-[65vh] flex items-center pt-20 pb-16 overflow-hidden">
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
          <AnimateInView animation="fade-up" delay={0}>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white mb-10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('back')}
            </Link>
          </AnimateInView>
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

      {/* Objectives & Results - Bento (Ecceludus style) */}
      <section className="relative py-20 lg:py-28">
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl translate-x-1/2" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateInView animation="fade-up" delay={0}>
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-bold mb-4">
                <Target className="w-4 h-4" />
                Hedefler & Çıktılar
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900">
                Neler Yapıyoruz?
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

      {/* Best Results - Ecceludus "The Best Results" cards */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-b from-stone-100 via-amber-50/30 to-stone-50">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateInView animation="fade-up" delay={0}>
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-bold mb-4">
                <Sparkles className="w-4 h-4" />
                Projemizin Çıktıları
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 mb-4">
                {t('bestResultsTitle')}
              </h2>
            </div>
          </AnimateInView>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {cards.map((card, i) => {
              const Icon = card.icon;
              return (
                <AnimateInView key={i} animation="fade-up" delay={i * 150}>
                  <Link href={card.href}>
                    <div className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${card.gradient} p-8 text-white shadow-2xl ${card.shadow} h-full flex flex-col hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300`}>
                      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
                      <div className="absolute top-1/2 right-4 opacity-10 group-hover:opacity-20">
                        <Icon className="w-24 h-24" />
                      </div>
                      <div className="relative flex-1">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                        <p className="text-white/85 leading-relaxed">{card.desc}</p>
                      </div>
                      <div className="mt-6 flex items-center gap-2 text-white/70 group-hover:text-white transition-colors">
                        <span className="text-sm font-semibold">{t('cta')}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </AnimateInView>
              );
            })}
          </div>
        </div>
      </section>

      {/* Project cards grid */}
      <section className="relative py-20 lg:py-28">
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-200/15 rounded-full blur-3xl translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-200/15 rounded-full blur-3xl -translate-x-1/2" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateInView animation="fade-up" delay={0}>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 mb-4">
                Öne Çıkan <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Projeler</span>
              </h2>
              <p className="text-lg text-stone-600 max-w-2xl mx-auto">
                SDG hedeflerine ulaşmak için yürüttüğümüz aktif projeler.
              </p>
            </div>
          </AnimateInView>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Featured project - 2 cols */}
            <AnimateInView animation="fade-up" delay={100} className="sm:col-span-2">
              <Link href={`/proje/${featured.id}`} className="block h-full">
                <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 p-8 sm:p-10 min-h-[260px] shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/40 hover:-translate-y-1 transition-all duration-500">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute top-1/2 right-8 opacity-10">
                    <FeaturedIcon className="w-32 h-32 text-white" />
                  </div>
                  <div className="relative">
                    <span className="inline-flex items-center gap-1.5 text-amber-100 text-sm font-bold mb-4">
                      <Sparkles className="w-4 h-4" />
                      Öne Çıkan Proje
                    </span>
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-50 transition-colors">
                      {featured.title}
                    </h3>
                    <p className="text-orange-100/90 text-sm mb-6 line-clamp-2">{featured.description}</p>
                    <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
                      <MapPin className="w-4 h-4" />
                      {featured.location} · {featured.date}
                    </div>
                    <span className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-orange-700 font-bold text-sm w-fit group-hover:bg-amber-100 transition-colors shadow-lg">
                      Detayları İncele
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            </AnimateInView>

            {restProjects.slice(0, 4).map((project, i) => {
              const Icon = project.icon;
              const gradients = ['from-teal-500 via-emerald-500 to-teal-600', 'from-violet-500 via-purple-500 to-violet-600'];
              const shadows = ['shadow-teal-500/30', 'shadow-violet-500/30'];
              const gi = i % 2;
              return (
                <AnimateInView key={project.id} animation="fade-up" delay={(i + 2) * 100}>
                  <Link href={`/proje/${project.id}`} className="block h-full">
                    <div className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradients[gi]} p-6 sm:p-8 shadow-xl ${shadows[gi]} hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 h-full flex flex-col min-h-[240px]`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                      <div className="relative flex-1">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-5">
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <span className="inline-block px-3 py-1 rounded-lg bg-white/20 text-white text-xs font-bold mb-3">
                          {project.category}
                        </span>
                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-amber-100 transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-white/85 text-sm mb-5 line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                        <div className="flex items-center gap-2 text-white/80 text-sm">
                          <MapPin className="w-4 h-4 shrink-0" />
                          {project.location} · {project.date}
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/20 text-white font-bold text-sm w-fit mt-4 group-hover:bg-white/30 transition-colors">
                        Detaylar
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </Link>
                </AnimateInView>
              );
            })}
          </div>

          <AnimateInView animation="fade-up" delay={500} className="mt-12 text-center">
            <Link
              href="/courses"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 text-white rounded-2xl font-bold text-lg hover:from-teal-700 hover:via-emerald-700 hover:to-teal-700 transition-all shadow-2xl shadow-teal-500/30 hover:shadow-teal-500/40 hover:-translate-y-1"
            >
              <GraduationCap className="w-6 h-6" />
              {t('cta')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </AnimateInView>
        </div>
      </section>
    </div>
  );
}
