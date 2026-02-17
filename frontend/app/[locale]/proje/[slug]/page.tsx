import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { ArrowLeft, Calendar, Layers } from 'lucide-react';
import { getProjectBySlug, type ProjectItem } from '@/lib/projects';
import { API_BASE } from '@/lib/authApi';
import studyCover from '@/public/images/study.jpg';

function projectImageSrc(imageUrl: string | null | undefined) {
    if (!imageUrl) return studyCover;
    return imageUrl.startsWith('http') ? imageUrl : `${API_BASE}${imageUrl}`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }) {
    const { slug, locale } = await params;
    const project = await getProjectBySlug(slug, locale);
    if (!project) return { title: 'Proje – Escape4SDG' };
    return {
        title: `${project.title} – Escape4SDG`,
        description: project.subtitle,
    };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
    const { slug, locale } = await params;
    const project = await getProjectBySlug(slug, locale);

    if (!project) notFound();

    const t = await getTranslations('projects');

    return (
        <div className="min-h-screen bg-stone-50">
            <section className="relative pt-24 pb-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-orange-50/60 via-stone-50 to-teal-50/30" />
                <div className="absolute inset-0 bg-dots opacity-30" />

                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/proje"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-orange-600 mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t('back')}
                    </Link>

                    <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl shadow-stone-200/40 border border-stone-100 mb-12">
                        {/* Hero Image / Cover */}
                        <div className="relative w-full h-[300px] sm:h-[400px]">
                            <Image
                                src={projectImageSrc(project.coverImageUrl)}
                                alt={project.title}
                                fill
                                className="object-cover"
                                priority
                                unoptimized={!!project.coverImageUrl}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 p-8 sm:p-10 w-full">
                                <div className="flex items-center gap-3 text-orange-200 text-sm font-bold mb-3">
                                    <Layers className="w-4 h-4" />
                                    <span>Proje</span>
                                </div>
                                <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight drop-shadow-lg">
                                    {project.title}
                                </h1>
                                <div className="flex flex-wrap gap-6 text-white/90 text-sm font-medium">
                                    <span className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(project.createdAt).toLocaleDateString(locale)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-10">
                        {/* Subtitle / Intro */}
                        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-stone-100 shadow-xl shadow-stone-200/20">
                            <h2 className="text-2xl font-bold text-stone-900 mb-6 border-l-4 border-orange-500 pl-6">{project.subtitle}</h2>
                            <div className="prose prose-stone max-w-none text-stone-600 leading-relaxed text-lg">
                                {project.bodyHtml ? (
                                    <div dangerouslySetInnerHTML={{ __html: project.bodyHtml }} />
                                ) : (
                                    <p>{project.subtitle}</p>
                                )}
                            </div>
                        </div>

                        {/* Gallery - Now below the text, more prominent */}
                        {project.galleryImages && project.galleryImages.length > 0 && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-stone-900 flex items-center gap-3">
                                    <Layers className="w-6 h-6 text-orange-500" />
                                    {t('gallery') || 'Proje Galerisi'}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {project.galleryImages.map((img) => (
                                        <div key={img.id} className="relative aspect-[4/3] rounded-2xl overflow-hidden group shadow-md border border-stone-100">
                                            <Image
                                                src={projectImageSrc(img.imageUrl)}
                                                alt=""
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                unoptimized={!!img.imageUrl}
                                            />
                                            <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </section>
        </div>
    );
}
