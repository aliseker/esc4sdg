import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, MapPin, Calendar } from 'lucide-react';
import { projects } from '@/lib/projects';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = projects.find((p) => p.id === Number(id));
  if (!project) return { title: 'Proje – Escape4SDG' };
  return {
    title: `${project.title} – Escape4SDG`,
    description: project.description,
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = projects.find((p) => p.id === Number(id));
  if (!project) notFound();

  const t = await getTranslations('projects');
  const Icon = project.icon;

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/60 via-stone-50 to-teal-50/30" />
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/proje"
            className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-teal-600 mb-10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back')}
          </Link>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 p-8 sm:p-12 shadow-2xl shadow-orange-500/30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <span className="inline-block px-4 py-2 rounded-xl bg-white/20 text-white text-sm font-bold mb-4">
                {project.category}
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
                {project.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-white/90 text-sm mb-6">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {project.location}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {project.date}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-8 p-8 rounded-2xl bg-white border-2 border-stone-100 shadow-xl shadow-stone-200/30">
            <h2 className="text-xl font-bold text-stone-900 mb-4">Proje Hakkında</h2>
            <p className="text-stone-600 leading-relaxed">{project.description}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
