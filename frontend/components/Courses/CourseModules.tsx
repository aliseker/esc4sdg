'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, FileQuestion, Lock, PlayCircle, RotateCcw, Video, FileText, Wrench, BookMarked, ClipboardCheck, ClipboardList } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import type { Course } from '@/lib/mockCourses';
import { getCourseProgress, resetCourseProgress } from '@/lib/progress';

export function CourseModules({ course, locale }: { course: Course; locale: 'tr' | 'en' }) {
  const t = useTranslations('courses');
  const [completedModules, setCompletedModules] = useState<string[]>(() =>
    getCourseProgress(course.slug).completedModules
  );

  const modulesView = useMemo(() => {
    return course.modules.map((m, idx) => {
      const completed = completedModules.includes(m.slug);
      const prevModule = idx > 0 ? course.modules[idx - 1] : null;
      const unlocked = idx === 0 || (prevModule ? completedModules.includes(prevModule.slug) : true);
      return { module: m, completed, unlocked };
    });
  }, [completedModules, course.modules]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl shadow-stone-200/40 border-2 border-stone-100 p-6 sm:p-8">
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-100/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
          {t('modules')}
        </h2>
        <button
          onClick={() => {
            resetCourseProgress(course.slug);
            setCompletedModules([]);
          }}
          className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors text-stone-700 w-fit"
          type="button"
        >
          <RotateCcw className="w-4 h-4" />
          {t('resetProgress')}
        </button>
      </div>

      <div className="relative mt-8 space-y-4">
        {modulesView.map(({ module, completed, unlocked }, idx) => (
          <div
            key={module.slug}
            className={`flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-6 rounded-2xl border-2 transition-all duration-300 ${
              unlocked
                ? 'bg-white border-stone-100 hover:border-teal-200 hover:shadow-lg'
                : 'bg-stone-50/80 border-stone-100'
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-teal-100 text-teal-700">
                  {locale === 'tr' ? `Modül ${idx + 1}` : `Module ${idx + 1}`}
                </span>
                {(module.lessons[0]?.preQuiz?.length ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 border border-amber-200/60">
                    <FileQuestion className="w-3.5 h-3.5" />
                    {t('preQuiz')}
                  </span>
                )}
                {completed ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    {t('completed')}
                  </span>
                ) : !unlocked ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500">
                    <Lock className="w-4 h-4" />
                    {t('locked')}
                  </span>
                ) : null}
              </div>

              <h3 className="mt-3 text-lg font-bold text-stone-900">
                {module.title[locale]}
              </h3>
              <p className="mt-1 text-sm text-stone-600 line-clamp-2">{module.description[locale]}</p>
              {/* Modül içeriği – Ön Quiz, Giriş Videosu vb. net görünsün */}
              {(() => {
                const lesson = module.lessons[0];
                if (!lesson) return null;
                const hasPreQuiz = (lesson.preQuiz?.length ?? 0) > 0;
                const hasTools = (lesson.tools?.length ?? 0) > 0;
                const hasConclusion = !!lesson.conclusion?.[locale];
                const items: { key: string; icon: typeof Video; highlight?: boolean }[] = [
                  { key: 'introductionVideo', icon: Video },
                  ...(hasPreQuiz ? [{ key: 'preQuiz', icon: FileQuestion, highlight: true }] : []),
                  { key: 'modulePresentation', icon: FileText },
                  ...(hasTools ? [{ key: 'listOfTools', icon: Wrench }] : []),
                  ...(hasConclusion ? [{ key: 'conclusion', icon: BookMarked }] : []),
                  { key: 'postQuiz', icon: ClipboardCheck },
                  { key: 'evaluation', icon: ClipboardList },
                ];
                return (
                  <div className="mt-4 p-4 rounded-xl bg-teal-50/80 border border-teal-100">
                    <p className="text-sm font-bold text-stone-700 mb-3">{t('moduleContents')}</p>
                    <div className="flex flex-wrap gap-2">
                      {items.map(({ key, icon: Icon, highlight }) => (
                        <span
                          key={key}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium shrink-0 ${
                            highlight
                              ? 'bg-amber-200/90 text-amber-900 border border-amber-300'
                              : 'bg-white text-stone-700 border border-stone-200 shadow-sm'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0 text-stone-500" />
                          {t(key)}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {unlocked ? (
              <Link
                href={`/courses/${course.slug}/modules/${module.slug}`}
                className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold hover:from-teal-700 hover:to-emerald-700 transition-all shadow-lg shadow-teal-500/25 hover:shadow-teal-500/35"
              >
                <PlayCircle className="w-5 h-5" />
                {t('start')}
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-stone-100 text-stone-400 font-bold cursor-not-allowed"
              >
                <Lock className="w-5 h-5" />
                {t('locked')}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

