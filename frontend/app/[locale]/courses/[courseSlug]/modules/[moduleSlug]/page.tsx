import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { getModuleBySlug } from '@/lib/mockCourses';
import { ModuleContentView } from '@/components/Courses/ModuleContentView';

export default async function ModulePage({
  params,
}: {
  params: Promise<{ locale: string; courseSlug: string; moduleSlug: string }>;
}) {
  const { courseSlug, moduleSlug } = await params;
  const { course, module } = getModuleBySlug(courseSlug, moduleSlug);
  if (!course || !module) notFound();

  const locale = (await getLocale()) as 'tr' | 'en';
  const lesson = module.lessons[0];
  if (!lesson) notFound();

  const moduleIndex = course.modules.findIndex((m) => m.slug === module.slug);
  const nextModuleSlug =
    moduleIndex >= 0 && moduleIndex + 1 < course.modules.length
      ? course.modules[moduleIndex + 1].slug
      : null;

  return (
    <div className="pt-0">
      <ModuleContentView
        course={course}
        module={module}
        lesson={lesson}
        locale={locale}
        nextModuleSlug={nextModuleSlug}
      />
    </div>
  );
}
