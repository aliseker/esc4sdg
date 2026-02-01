import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getCourseBySlug } from '@/lib/mockCourses';
import { CourseModules } from '@/components/Courses/CourseModules';
import { ArrowLeft } from 'lucide-react';
import studyCover from '@/images/study.jpg';

export default async function CourseDetailPage({
  params
}: {
  params: Promise<{ locale: string; courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const course = getCourseBySlug(courseSlug);
  if (!course) notFound();

  const locale = (await getLocale()) as 'tr' | 'en';

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero with study cover */}
      <section className="relative pt-20 pb-12 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={studyCover}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/95 via-stone-900/70 to-stone-900/50" />
          <div className="absolute inset-0 bg-dots opacity-10" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {locale === 'tr' ? '← Kurslara dön' : '← Back to courses'}
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            {course.title[locale]}
          </h1>
          <p className="text-lg text-white/85 max-w-3xl mb-6 leading-relaxed">
            {course.summary[locale]}
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-2 rounded-xl text-sm font-bold bg-white/20 backdrop-blur-sm text-white border border-white/20">
              {course.category}
            </span>
            <span className="px-4 py-2 rounded-xl text-sm font-bold bg-white/20 backdrop-blur-sm text-white border border-white/20">
              {course.level}
            </span>
            <span className="px-4 py-2 rounded-xl text-sm font-bold bg-white/20 backdrop-blur-sm text-white border border-white/20">
              {course.language.map((l) => l.toUpperCase()).join('/')}
            </span>
            <span className="px-4 py-2 rounded-xl text-sm font-bold bg-white/20 backdrop-blur-sm text-white border border-white/20">
              {course.duration}
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="relative py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <CourseModules course={course} locale={locale} />
        </div>
      </section>
    </div>
  );
}
