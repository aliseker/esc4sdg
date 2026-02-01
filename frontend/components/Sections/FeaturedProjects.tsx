'use client';

import { MapPin, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import AnimateInView from '@/components/UI/AnimateInView';
import { projects, type Project } from '@/lib/projects';

const featuredProjects = projects.slice(0, 3);

/** Featured hero project - spans 2 cols, gradient */
const FeaturedProjectCard = ({ project, delay = 0 }: { project: Project; delay?: number }) => {
  const Icon = project.icon;
  return (
    <AnimateInView animation="fade-up" delay={delay} className="sm:col-span-2">
      <Link href={`/proje/${project.id}`} className="block h-full">
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 p-0 min-h-[280px] flex flex-col sm:flex-row shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/40 hover:-translate-y-1 transition-all duration-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/2 right-8 opacity-10">
            <Icon className="w-32 h-32 text-white" />
          </div>
          <div className="flex-1 p-8 sm:p-10 flex flex-col justify-center relative">
            <span className="inline-flex items-center gap-1.5 text-amber-100 text-sm font-bold mb-4">
              <Sparkles className="w-4 h-4" />
              Öne Çıkan Proje
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight group-hover:text-amber-50 transition-colors">
              {project.title}
            </h3>
            <p className="text-orange-100/90 text-sm mb-6 line-clamp-2">{project.description}</p>
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <MapPin className="w-4 h-4" />
              {project.location} · {project.date}
            </div>
            <span className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-orange-700 font-bold text-sm w-fit group-hover:bg-amber-100 group-hover:text-orange-800 transition-colors shadow-lg">
              Detayları İncele
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </Link>
    </AnimateInView>
  );
};

/** Project card - gradient bg, icon focus */
const ProjectCard = ({ project, delay = 0, themeIndex = 0 }: {
  project: Project; delay?: number; themeIndex?: number;
}) => {
  const Icon = project.icon;
  const gradients = [
    'from-teal-500 via-emerald-500 to-teal-600',
    'from-violet-500 via-purple-500 to-violet-600',
  ];
  const shadows = ['shadow-teal-500/30', 'shadow-violet-500/30'];
  const i = themeIndex % 2;
  return (
    <AnimateInView animation="fade-up" delay={delay} className="h-full">
      <Link href={`/proje/${project.id}`} className="block h-full">
        <div className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradients[i]} p-6 sm:p-8 shadow-xl ${shadows[i]} hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 h-full flex flex-col`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative flex-1">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Icon className="w-7 h-7 text-white" />
            </div>
            <span className="inline-block px-3 py-1 rounded-lg bg-white/20 text-white text-xs font-bold mb-4">
              {project.category}
            </span>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-100 transition-colors leading-tight line-clamp-2">
              {project.title}
            </h3>
            <p className="text-white/85 text-sm mb-5 line-clamp-3 leading-relaxed">
              {project.description}
            </p>
            <div className="flex items-center gap-2 text-white/80 text-sm mb-5">
              <MapPin className="w-4 h-4 shrink-0" />
              {project.location} · {project.date}
            </div>
          </div>
          <span className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white font-bold text-sm w-fit group-hover:bg-white/30 transition-colors">
            Detaylar
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </Link>
    </AnimateInView>
  );
};

const FeaturedProjects = () => {
  const [featured, ...rest] = featuredProjects;

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
            Aktif Projeler
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 mb-4 tracking-tight">
            Öne çıkan <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">projeler</span>
          </h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto font-medium">
            Sürdürülebilir kalkınma hedeflerine ulaşmak için yürüttüğümüz yenilikçi projeler.
          </p>
        </AnimateInView>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          <FeaturedProjectCard project={featured} delay={0} />
          <ProjectCard project={rest[0]} delay={100} themeIndex={0} />
          <ProjectCard project={rest[1]} delay={150} themeIndex={1} />
        </div>

        <AnimateInView animation="fade-up" delay={200} className="text-center">
          <Link
            href="/proje"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white rounded-2xl font-bold hover:from-orange-600 hover:via-amber-600 hover:to-orange-600 transition-all shadow-xl shadow-orange-500/30 hover:shadow-orange-500/40 hover:-translate-y-0.5"
          >
            Tüm Projeleri Görüntüle
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </AnimateInView>
      </div>
    </section>
  );
};

export default FeaturedProjects;
