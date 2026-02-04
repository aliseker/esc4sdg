'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { getUserToken } from '@/lib/authApi';
import { getMyCourses, type MyCourseItem } from '@/lib/coursesApi';
import { BookOpen, Award, Lock, ChevronRight } from 'lucide-react';

export default function MyCoursesPage() {
  const locale = useLocale();
  const [list, setList] = useState<MyCourseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getUserToken();
    if (!token) {
      setLoading(false);
      return;
    }
    getMyCourses(token, locale)
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [locale]);

  if (!getUserToken()) {
    return (
      <div className="min-h-screen bg-stone-50 pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Lock className="w-14 h-14 text-stone-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-stone-900">
            {locale === 'tr' ? 'Kurslarınızı görmek için giriş yapın' : 'Log in to view your courses'}
          </h1>
          <Link href="/login" className="inline-flex mt-6 px-6 py-3 rounded-xl bg-teal-600 text-white font-bold">
            {locale === 'tr' ? 'Giriş yap' : 'Log in'}
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-stone-900 mb-2">
          {locale === 'tr' ? 'Kurslarım' : 'My Courses'}
        </h1>
        <p className="text-stone-600 mb-8">
          {locale === 'tr'
            ? 'Kayıtlı olduğunuz ve öğrendiğiniz kurslar. İlerleme ve sınav sonuçları aşağıda.'
            : 'Courses you are enrolled in. Progress and quiz scores are shown below.'}
        </p>
        {list.length === 0 ? (
          <div className="rounded-2xl bg-white border border-stone-200 p-8 text-center">
            <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-600">
              {locale === 'tr' ? 'Henüz kayıtlı olduğunuz kurs yok. Kurslara göz atıp başlayabilirsiniz.' : 'You are not enrolled in any course yet. Browse courses to get started.'}
            </p>
            <Link href="/courses" className="inline-flex mt-6 px-6 py-3 rounded-xl bg-teal-600 text-white font-bold">
              {locale === 'tr' ? 'Kurslara git' : 'Browse courses'}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((c) => (
              <div
                key={c.courseId}
                className="rounded-2xl bg-white border border-stone-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <Link href={`/courses/${c.courseSlug}`} className="block p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-bold text-stone-900 truncate">{c.courseTitle || c.courseSlug}</h2>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-stone-500">
                        <span>
                          {c.completedCount} / {c.totalItems}{' '}
                          {locale === 'tr' ? 'içerik tamamlandı' : 'items completed'}
                        </span>
                        {c.totalItems > 0 && (
                          <span className="font-medium text-teal-600">
                            %{Math.round((c.completedCount / c.totalItems) * 100)}
                          </span>
                        )}
                        {c.hasCertificate && (
                          <span className="inline-flex items-center gap-1 text-amber-700">
                            <Award className="w-4 h-4" />
                            {locale === 'tr' ? 'Sertifika alındı' : 'Certificate earned'}
                          </span>
                        )}
                      </div>
                      {c.quizScores && c.quizScores.length > 0 && (
                        <div className="mt-2 text-xs text-stone-500">
                          {locale === 'tr' ? 'Sınav sonuçları:' : 'Quiz scores:'}{' '}
                          {c.quizScores.map((s) => `${s.scorePercent ?? 0}%`).join(', ')}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-stone-400 shrink-0" />
                  </div>
                </Link>
                {c.hasCertificate && (
                  <div className="px-6 pb-4">
                    <Link
                      href={`/courses/${c.courseSlug}/certificate`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 hover:text-amber-800"
                    >
                      <Award className="w-4 h-4" />
                      {locale === 'tr' ? 'Sertifikayı görüntüle' : 'View certificate'}
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
