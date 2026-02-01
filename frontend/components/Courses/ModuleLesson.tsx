'use client';

import {useMemo, useState} from 'react';
import type {Course, Lesson, Module} from '@/lib/mockCourses';
import {markModuleCompleted} from '@/lib/progress';
import {Link} from '@/i18n/navigation';
import {CheckCircle2, Circle, Play} from 'lucide-react';

type Props = {
  course: Course;
  module: Module;
  lesson: Lesson;
  locale: 'tr' | 'en';
  nextModuleSlug: string | null;
};

export function ModuleLesson({course, module, lesson, locale, nextModuleSlug}: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    if (!submitted) return null;
    const total = lesson.quiz.length || 1;
    const correct = lesson.quiz.filter((q) => answers[q.id] === q.correctOptionId).length;
    return Math.round((correct / total) * 100);
  }, [answers, lesson.quiz, submitted]);

  const passed = score !== null && score >= lesson.passScore;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-500">
              {locale === 'tr' ? 'Modül' : 'Module'}: {module.title[locale]}
            </p>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 truncate">
              {lesson.title[locale]}
            </h1>
          </div>
          <span className="shrink-0 text-xs font-semibold px-3 py-1 rounded-full bg-teal-50 text-teal-600">
            {locale === 'tr' ? `Geçme notu: ${lesson.passScore}` : `Pass score: ${lesson.passScore}`}
          </span>
        </div>

        <div className="p-6">
          <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 overflow-hidden relative">
            {lesson.videoEmbedUrl ? (
              <iframe
                className="absolute inset-0 w-full h-full"
                src={lesson.videoEmbedUrl}
                title="Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/90">
                <div className="flex items-center gap-3 font-semibold">
                  <Play className="w-6 h-6" />
                  {locale === 'tr' ? 'Video yakında' : 'Video coming soon'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <h2 className="text-2xl font-serif font-bold text-gray-900">
          {locale === 'tr' ? 'Quiz' : 'Quiz'}
        </h2>
        <p className="text-gray-600 mt-2">
          {locale === 'tr'
            ? 'Soruları yanıtla, başarıyla geçince bir sonraki modül açılır.'
            : 'Answer the questions. Passing unlocks the next module.'}
        </p>

        <div className="mt-6 space-y-6">
          {lesson.quiz.map((q, idx) => (
            <div key={q.id} className="p-4 rounded-2xl border border-gray-100">
              <p className="font-semibold text-gray-900">
                {idx + 1}. {q.prompt[locale]}
              </p>
              <div className="mt-3 grid gap-2">
                {q.options.map((opt) => {
                  const selected = answers[q.id] === opt.id;
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setAnswers((a) => ({...a, [q.id]: opt.id}))}
                      className={[
                        'text-left w-full px-4 py-3 rounded-xl border transition-colors flex items-start gap-3',
                        selected ? 'border-teal-600 bg-teal-50' : 'border-gray-200 hover:border-gray-300'
                      ].join(' ')}
                    >
                      {selected ? (
                        <CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400 mt-0.5" />
                      )}
                      <span className="text-gray-900">{opt.text[locale]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => {
              setSubmitted(true);
              const total = lesson.quiz.length || 1;
              const correct = lesson.quiz.filter((q) => answers[q.id] === q.correctOptionId).length;
              const s = Math.round((correct / total) * 100);
              if (s >= lesson.passScore) {
                markModuleCompleted(course.slug, module.slug);
              }
            }}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors"
          >
            {locale === 'tr' ? 'Gönder' : 'Submit'}
          </button>

          {submitted && score !== null ? (
            <div className="text-sm font-semibold">
              {locale === 'tr' ? 'Skor' : 'Score'}: <span className="text-teal-600">{score}</span>
              {passed ? (
                <span className="ml-2 text-emerald-700">
                  {locale === 'tr' ? 'Geçti' : 'Passed'}
                </span>
              ) : (
                <span className="ml-2 text-rose-700">
                  {locale === 'tr' ? 'Kaldı' : 'Failed'}
                </span>
              )}
            </div>
          ) : null}
        </div>

        {submitted && passed ? (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="text-emerald-800 font-semibold">
              {locale === 'tr'
                ? 'Tebrikler! Bir sonraki modül açıldı.'
                : 'Congrats! The next module is now unlocked.'}
            </div>
            {nextModuleSlug ? (
              <Link
                href={`/courses/${course.slug}/modules/${nextModuleSlug}`}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition-colors"
              >
                {locale === 'tr' ? 'Sonraki modüle geç' : 'Go to next module'}
              </Link>
            ) : (
              <Link
                href={`/courses/${course.slug}/certificate`}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition-colors"
              >
                {locale === 'tr' ? 'Sertifikayı görüntüle' : 'View certificate'}
              </Link>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

