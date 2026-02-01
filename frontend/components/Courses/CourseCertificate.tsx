'use client';

import { useMemo, useState, useEffect } from 'react';
import type { Course } from '@/lib/mockCourses';
import { getCourseProgress } from '@/lib/progress';
import { Award, Download, Lock } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

type Props = { course: Course; locale: 'tr' | 'en'; defaultName?: string };

export function CourseCertificate({ course, locale, defaultName }: Props) {
  const t = useTranslations('courses');
  const [completedModules] = useState<string[]>(() =>
    typeof window !== 'undefined' ? getCourseProgress(course.slug).completedModules : []
  );
  const [participantName, setParticipantName] = useState(defaultName || '');

  const isComplete = useMemo(() => {
    return course.modules.every((m) => completedModules.includes(m.slug));
  }, [completedModules, course.modules]);

  const displayName = participantName.trim() || (locale === 'tr' ? 'Katılımcı' : 'Participant');

  if (!isComplete) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl border-2 border-stone-100 p-8 sm:p-10">
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-100/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="relative flex items-start gap-6">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center shrink-0">
            <Lock className="w-7 h-7 text-stone-500" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
              {t('certificateLocked')}
            </h1>
            <p className="text-stone-600 mt-2 leading-relaxed">
              {t('certificateLockedDesc')}
            </p>
            <Link
              href={`/courses/${course.slug}`}
              className="inline-flex mt-6 px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold hover:from-teal-700 hover:to-emerald-700 transition-all shadow-lg shadow-teal-500/25"
            >
              {t('backToCourse')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border-2 border-stone-100 p-8 sm:p-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-100/40 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="relative flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900">
              {t('congratsCertificate')}
            </h1>
            <p className="text-stone-600 mt-2 font-medium">
              {t('congratsCertificateDesc')}
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
            <Award className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Name input - personalized certificate */}
        <div className="relative mb-8 p-6 rounded-2xl bg-stone-50 border-2 border-stone-100">
          <label className="block text-sm font-bold text-stone-700 mb-2">
            {t('participantName')}
          </label>
          <input
            type="text"
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            placeholder={t('participantNamePlaceholder')}
            className="w-full px-5 py-3.5 rounded-xl border-2 border-stone-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-medium text-stone-900 transition-all"
          />
        </div>

        {/* Certificate card */}
        <div className="relative p-8 sm:p-10 rounded-3xl border-2 border-teal-100 bg-gradient-to-br from-white via-teal-50/20 to-emerald-50/30 shadow-inner">
          <div className="text-center">
            <p className="text-sm font-bold tracking-widest text-teal-600">
              {t('certificate')}
            </p>
            <h2 className="mt-4 text-2xl sm:text-3xl font-black text-stone-900">
              {course.title[locale]}
            </h2>
            <p className="mt-6 text-xl font-bold text-stone-800 border-b-2 border-teal-200 pb-4 inline-block">
              {displayName}
            </p>
            <p className="mt-6 text-stone-600 leading-relaxed max-w-lg mx-auto">
              {t('certificateVerify')}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <span className="px-4 py-2 rounded-xl text-sm font-bold bg-white border-2 border-stone-200 text-stone-700">
                {course.category}
              </span>
              <span className="px-4 py-2 rounded-xl text-sm font-bold bg-white border-2 border-stone-200 text-stone-700">
                {course.level}
              </span>
            </div>

            <div className="mt-10 pt-6 border-t-2 border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm font-medium text-stone-600">
                {t('issuedBy')}: <span className="font-bold text-stone-800">{course.instructor}</span>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold hover:from-teal-700 hover:to-emerald-700 transition-all shadow-lg shadow-teal-500/25"
              >
                <Download className="w-5 h-5" />
                {t('downloadPrint')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Link
        href="/courses"
        className="inline-flex text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors"
      >
        ← {t('exploreOtherCourses')}
      </Link>
    </div>
  );
}
