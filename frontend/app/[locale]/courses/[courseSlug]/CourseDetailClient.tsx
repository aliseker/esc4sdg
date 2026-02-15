'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { getCourseBySlug as getCourseApi, enrollCourse, getCourseProgress, type CourseDetail } from '@/lib/coursesApi';
import { getCourseBySlug as getCourseMock } from '@/lib/mockCourses';
import { getUserToken, API_BASE, AUTH_CHANGE_EVENT } from '@/lib/authApi';
import { CourseCurriculum } from './CourseCurriculum';
import { ArrowLeft } from 'lucide-react';
import studyCover from '@/public/images/study.jpg';

function courseImageSrc(imageUrl: string | null | undefined) {
  if (!imageUrl) return studyCover;
  return imageUrl.startsWith('http') ? imageUrl : `${API_BASE}${imageUrl}`;
}

type MockCourse = ReturnType<typeof getCourseMock>;

export function CourseDetailClient({ courseSlug }: { courseSlug: string }) {
  const router = useRouter();
  const locale = useLocale();
  const [courseApi, setCourseApi] = useState<CourseDetail | null>(null);
  const [courseMock, setCourseMock] = useState<MockCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [enrollError, setEnrollError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentCheckDone, setEnrollmentCheckDone] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getUserToken());
    const onAuthChange = () => setIsLoggedIn(!!getUserToken());
    window.addEventListener(AUTH_CHANGE_EVENT, onAuthChange);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, onAuthChange);
  }, []);

  useEffect(() => {
    getCourseApi(courseSlug, locale)
      .then((c) => {
        setCourseApi(c ?? null);
        if (!c) setCourseMock(getCourseMock(courseSlug) ?? null);
      })
      .catch(() => setCourseMock(getCourseMock(courseSlug) ?? null))
      .finally(() => setLoading(false));
  }, [courseSlug, locale]);

  useEffect(() => {
    const token = getUserToken();
    if (!courseApi) {
      setEnrollmentCheckDone(false);
      return;
    }
    if (!token) {
      setEnrollmentCheckDone(true);
      setIsEnrolled(false);
      return;
    }
    setEnrollmentCheckDone(false);
    getCourseProgress(courseApi.id, token)
      .then((p) => {
        setIsEnrolled(p.enrolled);
        setEnrollmentCheckDone(true);
      })
      .catch(() => {
        setIsEnrolled(false);
        setEnrollmentCheckDone(true);
      });
  }, [courseApi, isLoggedIn]);

  const handleStart = useCallback(async () => {
    const token = getUserToken();
    if (!token) {
      router.push(`/login?returnUrl=${encodeURIComponent(`/courses/${courseSlug}`)}`);
      return;
    }
    const course = courseApi;
    if (!course) return;
    setEnrollError('');
    setStarting(true);
    try {
      await enrollCourse(course.id, token);
      setIsEnrolled(true);
      router.push(`/courses/${courseSlug}`);
    } catch (err) {
      setEnrollError(locale === 'tr' ? 'Kayıt yapılamadı, lütfen tekrar deneyin.' : 'Enrollment failed, please try again.');
    } finally {
      setStarting(false);
    }
  }, [courseApi, courseSlug, locale, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const fromApi = courseApi != null;
  const title = fromApi ? courseApi.title : courseMock?.title?.[locale as 'tr' | 'en'] ?? courseMock?.title?.tr;
  const summary = fromApi ? courseApi.summary : courseMock?.summary?.[locale as 'tr' | 'en'] ?? courseMock?.summary?.tr;
  const category = fromApi ? courseApi.category : courseMock?.category;
  const level = fromApi ? courseApi.level : courseMock?.level;
  const duration = fromApi ? `${courseApi.durationMinutes} dk` : courseMock?.duration;
  const hasCertificate = fromApi ? courseApi.hasCertificate : true;

  if (!courseApi && !courseMock) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <p className="text-stone-600">Kurs bulunamadı.</p>
        <Link href="/courses" className="ml-4 text-teal-600 hover:underline">Kurslara dön</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="relative pt-20 pb-12 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={fromApi ? courseImageSrc(courseApi?.imageUrl) : studyCover}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
            unoptimized={!!courseApi?.imageUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/95 via-stone-900/70 to-stone-900/50" />
          <div className="absolute inset-0 bg-dots opacity-10" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 xl:px-12 pt-8">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {locale === 'tr' ? '← Kurslara dön' : '← Back to courses'}
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            {title}
          </h1>
          <p className="text-lg text-white/85 max-w-3xl mb-6 leading-relaxed pr-6 sm:pr-8 lg:pr-10">
            {summary}
          </p>
          <div className="flex flex-wrap gap-3">
            {category && (
              <span className="px-4 py-2 rounded-xl text-sm font-bold bg-white/20 backdrop-blur-sm text-white border border-white/20">
                {category}
              </span>
            )}
            {level && (
              <span className="px-4 py-2 rounded-xl text-sm font-bold bg-white/20 backdrop-blur-sm text-white border border-white/20">
                {level}
              </span>
            )}
            <span className="px-4 py-2 rounded-xl text-sm font-bold bg-white/20 backdrop-blur-sm text-white border border-white/20">
              {duration}
            </span>
            {hasCertificate && (
              <span className="px-4 py-2 rounded-xl text-sm font-bold bg-white/20 backdrop-blur-sm text-white border border-white/20">
                Sertifika
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="relative py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
          <div id="mufredat" className="flex-1 scroll-mt-24">
            {fromApi && courseApi && (
              <CourseCurriculum course={courseApi} locale={locale} courseSlug={courseSlug} isEnrolled={isEnrolled} />
            )}
            {!fromApi && courseMock && (
              <CourseCurriculum mockCourse={courseMock} locale={locale} />
            )}
          </div>
          <aside className="lg:w-80 shrink-0">
            <div className="rounded-2xl bg-white border border-stone-200 p-6 shadow-sm sticky top-24">
              <div className="space-y-4 text-stone-700">
                <p className="flex items-center gap-2">
                  <span className="font-medium">Süre:</span>
                  {duration}
                </p>
                {fromApi && courseApi && (
                  <>
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Ders:</span>
                      {courseApi.lessonCount}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Bölüm:</span>
                      {courseApi.sectionCount}
                    </p>
                  </>
                )}
                <p className="flex items-center gap-2">
                  <span className="font-medium">Sertifika:</span>
                  {hasCertificate ? 'Evet' : 'Hayır'}
                </p>
              </div>
              {enrollError && (
                <p className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 text-center">
                  {enrollError}
                </p>
              )}
              {fromApi && courseApi && isEnrolled ? (
                (() => {
                  const firstItem = courseApi.modules?.[0]?.items?.[0];
                  return firstItem ? (
                    <Link
                      href={`/courses/${courseSlug}/item/${firstItem.id}`}
                      className="mt-6 block w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-center transition-colors"
                    >
                      {locale === 'tr' ? 'Kursa devam et' : 'Continue course'}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => document.getElementById('mufredat')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                      className="mt-6 w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-center transition-colors"
                    >
                      {locale === 'tr' ? 'Müfredat' : 'Curriculum'}
                    </button>
                  );
                })()
              ) : fromApi && courseApi && isLoggedIn && !enrollmentCheckDone ? (
                <div className="mt-6 w-full py-3.5 rounded-xl bg-stone-200 text-stone-500 font-bold text-center">
                  ...
                </div>
              ) : fromApi && courseApi && isLoggedIn && enrollmentCheckDone && !isEnrolled ? (
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={starting}
                  className="mt-6 w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-center disabled:opacity-50 transition-colors"
                >
                  {starting ? '...' : locale === 'tr' ? 'Şimdi Başla' : 'Start Now'}
                </button>
              ) : (
                <Link
                  href={`/login?returnUrl=${encodeURIComponent(`/courses/${courseSlug}`)}`}
                  className="mt-6 block w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-center transition-colors"
                >
                  {locale === 'tr' ? 'Giriş yap ve başla' : 'Log in to start'}
                </Link>
              )}
              {!isLoggedIn && fromApi && (
                <p className="mt-3 text-xs text-stone-500 text-center">
                  {locale === 'tr'
                    ? 'Kursa başlamak için site kullanıcı girişi yapmalısınız (üst menüden Giriş yap — admin paneli değil).'
                    : 'Log in as a site user to start (Log in from the menu — not admin panel).'}
                </p>
              )}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
