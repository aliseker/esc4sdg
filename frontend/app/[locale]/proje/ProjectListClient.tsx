'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Calendar, Sparkles, Layers, Search, Filter } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import AnimateInView from '@/components/UI/AnimateInView';
import { type ProjectItem, getProjectsList } from '@/lib/projects';
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

/** Standard Project Card - Same wide horizontal layout as featured, with alternating theme colors */
const StandardProjectCard = ({ project, t, delay = 0, themeIndex = 0 }: { project: ProjectItem; t: any; delay?: number; themeIndex?: number }) => {
    const themes = [
        { grad: 'from-orange-500 via-amber-500 to-orange-600', shadow: 'shadow-orange-500/30', hoverShadow: 'hover:shadow-orange-500/50', btn: 'bg-white text-orange-700 group-hover:bg-orange-50' },
        { grad: 'from-teal-500 via-emerald-500 to-teal-600', shadow: 'shadow-teal-500/30', hoverShadow: 'hover:shadow-teal-500/50', btn: 'bg-white text-teal-700 group-hover:bg-teal-50' },
        { grad: 'from-violet-500 via-purple-500 to-violet-600', shadow: 'shadow-violet-500/30', hoverShadow: 'hover:shadow-violet-500/50', btn: 'bg-white text-violet-700 group-hover:bg-violet-50' },
    ];
    const theme = themes[themeIndex % themes.length];

    return (
        <AnimateInView animation="fade-up" delay={delay}>
            <Link href={`/proje/${project.slug}`} className="block">
                <div className={`group relative overflow-hidden rounded-[40px] bg-gradient-to-br ${theme.grad} p-0 min-h-[320px] flex flex-col lg:flex-row shadow-2xl ${theme.shadow} ${theme.hoverShadow} hover:-translate-y-2 transition-all duration-700`}>
                    <div className="relative w-full lg:w-[45%] h-64 lg:h-auto overflow-hidden">
                        <Image
                            src={projectImageSrc(project.coverImageUrl)}
                            alt={project.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-1000"
                            sizes="(max-width: 1024px) 100vw, 45vw"
                            unoptimized={!!project.coverImageUrl}
                        />
                    </div>
                    <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center relative">
                        <h3 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight group-hover:text-amber-50 transition-colors tracking-tight">
                            {project.title}
                        </h3>
                        <p className="text-white/90 text-[17px] mb-8 line-clamp-3 leading-relaxed font-medium">{project.subtitle}</p>

                        <div className="flex items-center gap-6 text-white/80 text-sm mb-8">
                            <span className="flex items-center gap-2 font-bold">
                                <Calendar className="w-4 h-4 text-white/60" />
                                {new Date(project.createdAt).getFullYear()}
                            </span>
                        </div>

                        <span className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl ${theme.btn} font-[900] text-sm w-fit transition-all shadow-xl shadow-black/10`}>
                            {t('details') || 'İncele'}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </div>
                </div>
            </Link>
        </AnimateInView>
    );
};

export default function ProjectListClient({ projects: initialProjects }: { projects: ProjectItem[] }) {
    const t = useTranslations('projects');
    const locale = useLocale();
    const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState(locale);
    const [showFilters, setShowFilters] = useState(false);

    // const languages = ['tr', 'en'] as const;
    const [languages, setLanguages] = useState<string[]>([]);

    useEffect(() => {
        import('@/lib/publicApi').then(({ getLanguages }) => {
            getLanguages().then((langs) => {
                setLanguages(langs.map((l) => l.code));
            });
        });
    }, []);

    // Re-fetch when language changes
    useEffect(() => {
        getProjectsList(selectedLanguage).then(setProjects);
    }, [selectedLanguage]);

    const filteredProjects = projects.filter((project) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            project.title.toLowerCase().includes(term) ||
            project.subtitle?.toLowerCase().includes(term)
        );
    });

    if (initialProjects.length === 0 && projects.length === 0) {
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

    const sorted = [...filteredProjects].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <section className="relative pt-6 pb-16 lg:pt-8 lg:pb-24 overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-dots opacity-20" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100/30 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-100/30 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2" />

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Search & Filter Bar */}
                <AnimateInView animation="fade-up" className="mb-10">
                    <div className="bg-white rounded-2xl border-2 border-stone-100 shadow-xl shadow-stone-200/30 p-5">
                        <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                                <input
                                    type="text"
                                    placeholder={locale === 'tr' ? 'Proje ara...' : 'Search projects...'}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 border-2 border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-medium text-stone-800"
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all ${showFilters
                                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30'
                                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                                    }`}
                            >
                                <Filter className="w-5 h-5" />
                                {locale === 'tr' ? 'Filtre' : 'Filter'}
                            </button>
                        </div>

                        {showFilters && (
                            <div className="mt-6 pt-6 border-t border-stone-200 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-up">
                                <div>
                                    <label className="block text-sm font-bold text-stone-700 mb-2">
                                        {locale === 'tr' ? 'Dil' : 'Language'}
                                    </label>
                                    <select
                                        value={selectedLanguage}
                                        onChange={(e) => setSelectedLanguage(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium text-stone-800"
                                    >
                                        {languages.map((lang) => (
                                            <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </AnimateInView>

                {/* Project List */}
                {sorted.length > 0 ? (
                    <div className="space-y-8">
                        {sorted.map((project, index) => (
                            <StandardProjectCard
                                key={project.id}
                                project={project}
                                t={t}
                                delay={index * 50}
                                themeIndex={index}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <Layers className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                        <p className="text-stone-500 font-medium">
                            {locale === 'tr' ? 'Aramanızla eşleşen proje bulunamadı.' : 'No projects match your search.'}
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
