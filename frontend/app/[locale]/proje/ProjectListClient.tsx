'use client';

import { ArrowRight, Calendar, Sparkles, Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import AnimateInView from '@/components/UI/AnimateInView';
import { type ProjectItem } from '@/lib/projects';
import { API_BASE } from '@/lib/authApi';
import studyCover from '@/public/images/study.jpg';

function projectImageSrc(imageUrl: string | null | undefined) {
    if (!imageUrl) return studyCover;
    return imageUrl.startsWith('http') ? imageUrl : `${API_BASE}${imageUrl}`;
}

/** High-impact Featured Project - Spans 2 columns on larger screens */
const FeaturedProjectCard = ({ project, t, delay = 0 }: { project: ProjectItem; t: any; delay?: number }) => {
    return (
        <AnimateInView animation="fade-up" delay={delay} className="sm:col-span-2">
            <Link href={`/proje/${project.slug}`} className="block h-full">
                <div className="group relative overflow-hidden rounded-[40px] bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 p-0 min-h-[380px] flex flex-col lg:flex-row shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-2 transition-all duration-700">
                    <div className="relative w-full lg:w-[45%] h-64 lg:h-auto overflow-hidden">
                        <Image
                            src={projectImageSrc(project.coverImageUrl)}
                            alt={project.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-1000"
                            sizes="(max-width: 1024px) 100vw, 45vw"
                            unoptimized={!!project.coverImageUrl}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/80 via-transparent to-transparent lg:bg-gradient-to-l" />
                    </div>
                    <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center relative">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-[0.2em] mb-6 w-fit border border-white/10">
                            <Sparkles className="w-3.5 h-3.5" />
                            {t('featuredBadge') || 'Öne Çıkan'}
                        </span>
                        <h3 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight group-hover:text-amber-50 transition-colors tracking-tight">
                            {project.title}
                        </h3>
                        <p className="text-orange-50/90 text-[17px] mb-8 line-clamp-3 leading-relaxed font-medium">{project.subtitle}</p>

                        <div className="flex items-center gap-6 text-white/80 text-sm mb-8">
                            <span className="flex items-center gap-2 font-bold">
                                <Calendar className="w-4 h-4 text-amber-200" />
                                {new Date(project.createdAt).getFullYear()}
                            </span>
                        </div>

                        <span className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-orange-700 font-[900] text-sm w-fit group-hover:bg-amber-100 group-hover:px-10 transition-all shadow-xl shadow-black/10">
                            {t('details') || 'İncele'}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </div>
                </div>
            </Link>
        </AnimateInView>
    );
};

/** Standard Project Card - Themed Gradients */
const StandardProjectCard = ({ project, t, delay = 0, themeIndex = 0 }: { project: ProjectItem; t: any; delay?: number; themeIndex?: number }) => {
    const themes = [
        { grad: 'from-teal-500 via-emerald-500 to-teal-600', shadow: 'shadow-teal-500/30', hover: 'group-hover:shadow-teal-500/50' },
        { grad: 'from-violet-500 via-purple-500 to-violet-600', shadow: 'shadow-violet-500/30', hover: 'group-hover:shadow-violet-500/50' },
    ];
    const theme = themes[themeIndex % themes.length];

    return (
        <AnimateInView animation="fade-up" delay={delay} className="h-full">
            <Link href={`/proje/${project.slug}`} className="block h-full">
                <div className={`group relative overflow-hidden rounded-[32px] bg-gradient-to-br ${theme.grad} shadow-xl ${theme.shadow} ${theme.hover} hover:-translate-y-2 transition-all duration-700 h-full flex flex-col`}>
                    <div className="relative w-full h-52 overflow-hidden">
                        <Image
                            src={projectImageSrc(project.coverImageUrl)}
                            alt={project.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-1000"
                            sizes="(max-width: 1024px) 100vw, 33vw"
                            unoptimized={!!project.coverImageUrl}
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${theme.grad} opacity-85 group-hover:opacity-75 transition-opacity`} />
                    </div>

                    <div className="relative flex-1 p-8 flex flex-col -mt-10">
                        <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center mb-6 shadow-lg">
                            <Layers className="w-7 h-7 text-white" />
                        </div>

                        <h3 className="text-xl font-black text-white mb-3 group-hover:text-amber-50 transition-colors leading-tight line-clamp-2 tracking-tight">
                            {project.title}
                        </h3>
                        <p className="text-white/90 text-[15px] mb-6 line-clamp-3 leading-relaxed font-medium">
                            {project.subtitle}
                        </p>

                        <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/10">
                            <span className="flex items-center gap-2 text-white/70 text-xs font-bold uppercase tracking-wider">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(project.createdAt).getFullYear()}
                            </span>
                            <span className="flex items-center gap-1.5 text-white font-black text-sm group-hover:gap-3 transition-all">
                                {t('details') || 'İncele'}
                                <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        </AnimateInView>
    );
};

export default function ProjectListClient({ projects }: { projects: ProjectItem[] }) {
    const t = useTranslations('projects');

    if (projects.length === 0) {
        return (
            <section className="relative py-24 text-center">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-stone-50 mb-8 border border-stone-100">
                        <Layers className="w-10 h-10 text-stone-200" />
                    </div>
                    <h2 className="text-2xl font-bold text-stone-400">Henüz proje eklenmemiş.</h2>
                </div>
            </section>
        );
    }

    const featured = projects[0];
    const rest = projects.slice(1);

    return (
        <section className="relative py-16 lg:py-24 overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-dots opacity-20" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100/30 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-100/30 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2" />

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                    {featured && <FeaturedProjectCard project={featured} t={t} delay={0} />}
                    {rest.map((project, index) => (
                        <StandardProjectCard
                            key={project.id}
                            project={project}
                            t={t}
                            delay={(index + 1) * 50}
                            themeIndex={index}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
