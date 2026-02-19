'use client';

import { ChevronDown, ChevronUp, Lock, FileText, Video, HelpCircle, ChevronRight, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import type { CourseDetail } from '@/lib/coursesApi';
import type { Course } from '@/lib/mockCourses';

export function CourseCurriculum({
  course,
  mockCourse,
  locale,
  courseSlug,
  isEnrolled,
  completedItemIds,
}: {
  course?: CourseDetail;
  mockCourse?: Course;
  locale: string;
  courseSlug?: string;
  isEnrolled?: boolean;
  completedItemIds?: number[];
}) {
  const [expanded, setExpanded] = useState<Set<number | string>>(new Set([0]));

  if (course) {
    const modules = course.modules ?? [];

    // Flatten items to find the next unlockable item
    const allItems = modules.flatMap(m => m.items);
    const completedSet = new Set(completedItemIds ?? []);

    // Find the first item that is NOT completed
    const firstIncompleteItem = allItems.find(i => !completedSet.has(i.id));
    // If all are completed, no next item (or maybe just keep everything open)
    // The "active" item is the first incomplete one.
    const activeItemId = firstIncompleteItem?.id;

    return (
      <div className="rounded-2xl bg-white border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-stone-900">
            {locale === 'tr' ? 'Müfredat' : 'Curriculum'}
          </h2>
          <span className="text-sm text-stone-500">
            {course.sectionCount} {locale === 'tr' ? 'Bölüm' : 'Sections'} · {course.lessonCount} {locale === 'tr' ? 'Ders' : 'Lessons'} · {course.durationMinutes} {locale === 'tr' ? 'Dakika' : 'Minutes'}
          </span>
        </div>
        <div className="divide-y divide-stone-100">
          {modules.map((mod, idx) => {
            const isOpen = expanded.has(idx);
            return (
              <div key={mod.id} className="bg-white">
                <button
                  type="button"
                  onClick={() =>
                    setExpanded((s) => {
                      const next = new Set(s);
                      if (next.has(idx)) next.delete(idx);
                      else next.add(idx);
                      return next;
                    })
                  }
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-stone-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-stone-400 shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold text-stone-900">{mod.title}</p>
                      {mod.description && (
                        <p className="text-sm text-stone-500 mt-0.5">{mod.description}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-stone-400 shrink-0">{mod.itemCount}</span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 pl-14 space-y-2">
                    {mod.items.map((item, itemIdx) => {
                      const isCompleted = completedSet.has(item.id);
                      // Accessible if enrolled AND (completed OR it's the next active item)
                      // If no active item found (all completed), then everything is accessible if enrolled.
                      // If not enrolled, only first item of first module is accessible (as sample/preview logic if we had it, but mostly we force login).

                      const isNextUp = item.id === activeItemId;
                      const isUnlocked = isEnrolled && (isCompleted || isNextUp || !activeItemId);

                      const showAsLink = isUnlocked;

                      const itemHref = showAsLink
                        ? `/courses/${courseSlug}/item/${item.id}`
                        : null;
                      const itemContent = (
                        <>
                          <div className="flex items-center gap-2 min-w-0">
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                            ) : item.type === 'Quiz' ? (
                              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                            ) : item.type === 'Video' ? (
                              <Video className="w-4 h-4 text-teal-600 shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 text-stone-500 shrink-0" />
                            )}
                            <span className={`text-sm font-medium truncate ${isCompleted ? 'text-green-700' : showAsLink ? 'text-stone-800 group-hover:text-teal-800' : 'text-stone-800'}`}>
                              {item.title}
                            </span>
                            {item.type === 'Quiz' && item.questionCount != null && (
                              <span className="text-xs text-stone-400">
                                {item.questionCount} soru
                              </span>
                            )}
                          </div>
                          {isCompleted ? (
                            <span className="text-xs font-bold text-green-600 px-2 py-0.5 bg-green-50 rounded-full">
                              {locale === 'tr' ? 'Tamamlandı' : 'Done'}
                            </span>
                          ) : showAsLink ? (
                            <ChevronRight className="w-4 h-4 text-stone-400 shrink-0 group-hover:text-teal-600" />
                          ) : (
                            <Lock className="w-4 h-4 text-stone-400 shrink-0" />
                          )}
                        </>
                      );
                      if (showAsLink && itemHref) {
                        return (
                          <Link
                            key={item.id}
                            href={itemHref}
                            className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-stone-50 hover:bg-teal-50 hover:border-teal-200 border border-transparent transition-colors group"
                          >
                            {itemContent}
                          </Link>
                        );
                      }
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-stone-50"
                        >
                          {itemContent}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (mockCourse) {
    const modules = mockCourse.modules ?? [];
    return (
      <div className="rounded-2xl bg-white border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100">
          <h2 className="text-xl font-bold text-stone-900">
            {locale === 'tr' ? 'Müfredat' : 'Curriculum'}
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            {modules.length} bölüm · {modules.reduce((a, m) => a + m.lessons.length, 0)} ders
          </p>
        </div>
        <div className="divide-y divide-stone-100">
          {modules.map((mod, idx) => {
            const isOpen = expanded.has(idx);
            return (
              <div key={mod.slug} className="bg-white">
                <button
                  type="button"
                  onClick={() =>
                    setExpanded((s) => {
                      const next = new Set(s);
                      if (next.has(idx)) next.delete(idx);
                      else next.add(idx);
                      return next;
                    })
                  }
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-stone-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-stone-400 shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold text-stone-900">
                        {mod.title[locale as 'tr' | 'en'] ?? mod.title.tr}
                      </p>
                      <p className="text-sm text-stone-500 mt-0.5">
                        {mod.description[locale as 'tr' | 'en'] ?? mod.description.tr}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-stone-400 shrink-0">{mod.lessons.length}</span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 pl-14 space-y-2">
                    {mod.lessons.map((lesson) => (
                      <div
                        key={lesson.slug}
                        className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-stone-50"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Video className="w-4 h-4 text-teal-600 shrink-0" />
                          <span className="text-sm font-medium text-stone-800 truncate">
                            {lesson.title[locale as 'tr' | 'en'] ?? lesson.title.tr}
                          </span>
                        </div>
                        <Lock className="w-4 h-4 text-stone-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
