import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getCourseBySlug } from '@/lib/mockCourses';
import { CourseCertificate } from '@/components/Courses/CourseCertificate';

export default async function CertificatePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; courseSlug: string }>;
  searchParams: Promise<{ name?: string }>;
}) {
  const { courseSlug } = await params;
  const { name: urlName } = await searchParams;
  const course = getCourseBySlug(courseSlug);
  if (!course) notFound();

  const locale = (await getLocale()) as 'tr' | 'en';

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-teal-50/30 to-white pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href={`/courses/${course.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
          >
            ← {locale === 'tr' ? 'Kurs sayfasına dön' : 'Back to course'}
          </Link>
        </div>
        <CourseCertificate course={course} locale={locale} defaultName={urlName} />
      </div>
    </div>
  );
}
