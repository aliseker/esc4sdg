'use client';

import { useRef, useState, useEffect } from 'react';
import { MapPin, ArrowRight, Layers, Sparkles, Clock, Calendar } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import AnimateInView from '@/components/UI/AnimateInView';
import { getProjectsList, type ProjectItem } from '@/lib/projects';
import { API_BASE } from '@/lib/authApi';
import studyCover from '@/public/images/study.jpg';

function projectImageSrc(imageUrl: string | null | undefined) {
  if (!imageUrl) return studyCover;
  return imageUrl.startsWith('http') ? imageUrl : `${API_BASE}${imageUrl}`;
}

/** Featured hero project - spans 2 cols, gradient */
const FeaturedProjectCard = ({ project, t, delay = 0 }: { project: ProjectItem; t: any; delay?: number }) => {
  return (
    <AnimateInView animation="fade-up" delay={delay} className="sm:col-span-2">
      <Link href={`/proje/${project.slug}`} className="block h-full">
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 p-0 min-h-[320px] flex flex-col sm:flex-row shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/40 hover:-translate-y-1 transition-all duration-500">
          <div className="relative w-full sm:w-2/5 h-56 sm:h-auto min-h-[200px] flex-shrink-0">
            <Image
              src={projectImageSrc(project.coverImageUrl)}
              alt=""
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 640px) 100vw, 40vw"
              unoptimized={!!project.coverImageUrl}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/80 via-transparent to-transparent sm:bg-gradient-to-l" />
          </div>
          <div className="flex-1 p-8 sm:p-10 flex flex-col justify-center relative bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 sm:bg-none">
            <span className="inline-flex items-center gap-1.5 text-amber-100 text-sm font-bold mb-4">
              <Sparkles className="w-4 h-4" />
              {t('featuredBadge')}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight group-hover:text-amber-50 transition-colors">
              {project.title}
            </h3>
            <p className="text-orange-100/90 text-sm mb-6 line-clamp-3">{project.subtitle}</p>
            <div className="flex items-center gap-4 text-white/80 text-sm mb-6">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(project.createdAt).getFullYear()}
              </span>
            </div>
            <span className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-orange-700 font-bold text-sm w-fit group-hover:bg-amber-100 group-hover:text-orange-800 transition-colors shadow-lg">
              {t('viewDetails')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </Link>
    </AnimateInView>
  );
};

/** Project card - wide horizontal layout, gradient bg, clean image */
const ProjectCard = ({ project, t, delay = 0, themeIndex = 0 }: {
  project: ProjectItem; t: any; delay?: number; themeIndex?: number;
}) => {
  const themes = [
    { grad: 'from-teal-500 via-emerald-500 to-teal-600', shadow: 'shadow-teal-500/30', hoverShadow: 'hover:shadow-teal-500/50', btn: 'bg-white text-teal-700 group-hover:bg-teal-50' },
    { grad: 'from-violet-500 via-purple-500 to-violet-600', shadow: 'shadow-violet-500/30', hoverShadow: 'hover:shadow-violet-500/50', btn: 'bg-white text-violet-700 group-hover:bg-violet-50' },
  ];
  const theme = themes[themeIndex % 2];
  return (
    <AnimateInView animation="fade-up" delay={delay}>
      <Link href={`/proje/${project.slug}`} className="block">
        <div className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${theme.grad} p-0 min-h-[280px] flex flex-col sm:flex-row shadow-2xl ${theme.shadow} ${theme.hoverShadow} hover:-translate-y-1 transition-all duration-500`}>
          <div className="relative w-full sm:w-2/5 h-56 sm:h-auto min-h-[200px] flex-shrink-0">
            <Image
              src={projectImageSrc(project.coverImageUrl)}
              alt=""
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 640px) 100vw, 40vw"
              unoptimized={!!project.coverImageUrl}
            />
          </div>
          <div className="flex-1 p-8 sm:p-10 flex flex-col justify-center relative">
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight group-hover:text-amber-50 transition-colors">
              {project.title}
            </h3>
            <p className="text-white/90 text-sm mb-6 line-clamp-3">{project.subtitle}</p>
            <div className="flex items-center gap-4 text-white/80 text-sm mb-6">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(project.createdAt).getFullYear()}
              </span>
            </div>
            <span className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl ${theme.btn} font-bold text-sm w-fit transition-colors shadow-lg`}>
              {t('viewDetails')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </Link>
    </AnimateInView>
  );
};

const FeaturedProjects = () => {
  const t = useTranslations('projects');
  const locale = useLocale();
  const [projects, setProjects] = useState<ProjectItem[]>([]);

  useEffect(() => {
    getProjectsList(locale).then(setProjects);
  }, [locale]);

  const sorted = [...projects].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const displayProjects = sorted.slice(0, 3);

  if (projects.length === 0) return null;

  return (
    <section className="relative pt-12 lg:pt-16 pb-24 lg:pb-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-teal-50/20 via-orange-50/30 to-stone-50" />
      <div className="absolute inset-0 bg-dots opacity-30" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl -translate-x-1/2" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-200/60 to-transparent" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateInView animation="fade-up" className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-bold mb-6">
            <Layers className="w-4 h-4" />
            {t('title')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 mb-4 tracking-tight">
            {t('sectionHeadingPrefix')} <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{t('sectionHeadingHighlight')}</span>
          </h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto font-medium">
            {t('subtitle')}
          </p>
        </AnimateInView>

        <div className="space-y-6 mb-12">
          {displayProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} t={t} delay={index * 80} themeIndex={index} />
          ))}
        </div>

        <AnimateInView animation="fade-up" delay={200} className="text-center">
          <Link
            href="/proje"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white rounded-2xl font-bold hover:from-orange-600 hover:via-amber-600 hover:to-orange-600 transition-all shadow-xl shadow-orange-500/30 hover:shadow-orange-500/40 hover:-translate-y-0.5"
          >
            {t('viewAll')}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </AnimateInView>
      </div>
    </section>
  );
};

export default FeaturedProjects;
