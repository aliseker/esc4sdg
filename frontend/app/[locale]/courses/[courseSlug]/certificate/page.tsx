'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { getUserToken } from '@/lib/authApi';
import { getMyCertificates, getCertificate } from '@/lib/coursesApi';
import { downloadCertificatePdf } from '@/lib/certificatePdf';
import { getCourseBySlug as getCourseMock } from '@/lib/mockCourses';
import { Award, Download, Lock } from 'lucide-react';

export default function CertificatePage() {
  const params = useParams();
  const locale = useLocale();
  const courseSlug = typeof params.courseSlug === 'string' ? params.courseSlug : '';
  const [certDetail, setCertDetail] = useState<{ userName: string; courseTitle: string; issuedAt: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mockCourse, setMockCourse] = useState<ReturnType<typeof getCourseMock>>(null);

  useEffect(() => {
    const token = getUserToken();
    if (!token) {
      setLoading(false);
      return;
    }
    getMyCertificates(token, locale)
      .then((list) => {
        const found = list.find((c) => c.courseSlug === courseSlug);
        if (found) return getCertificate(found.id, token, locale);
        return null;
      })
      .then((detail) => {
        if (detail) setCertDetail({ userName: detail.userName, courseTitle: detail.courseTitle, issuedAt: detail.issuedAt });
        else setMockCourse(getCourseMock(courseSlug));
      })
      .catch(() => setMockCourse(getCourseMock(courseSlug)))
      .finally(() => setLoading(false));
  }, [courseSlug, locale]);

  const handleDownloadPdf = () => {
    if (!certDetail) return;
    downloadCertificatePdf({
      userName: certDetail.userName,
      courseTitle: certDetail.courseTitle,
      issuedAt: certDetail.issuedAt,
      filename: `Escape4SDG-${courseSlug}.pdf`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!getUserToken()) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 via-teal-50/30 to-white pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="rounded-3xl bg-white shadow-xl border-2 border-stone-100 p-8 text-center">
            <Lock className="w-14 h-14 text-stone-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-stone-900">
              {locale === 'tr' ? 'Sertifikayı görüntülemek için giriş yapın' : 'Log in to view certificate'}
            </h1>
            <Link
              href={`/login?returnUrl=${encodeURIComponent(`/courses/${courseSlug}/certificate`)}`}
              className="inline-flex mt-6 px-6 py-3.5 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700"
            >
              {locale === 'tr' ? 'Giriş yap' : 'Log in'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!certDetail && !mockCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 via-teal-50/30 to-white pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="rounded-3xl bg-white shadow-xl border-2 border-stone-100 p-8">
            <Lock className="w-14 h-14 text-stone-400 mb-4" />
            <h1 className="text-2xl font-bold text-stone-900">
              {locale === 'tr' ? 'Sertifika kilitli' : 'Certificate locked'}
            </h1>
            <p className="text-stone-600 mt-2">
              {locale === 'tr'
                ? 'Bu kursu tamamladığınızda sertifikanız burada görünecektir.'
                : 'Your certificate will appear here when you complete this course.'}
            </p>
            <Link
              href={`/courses/${courseSlug}`}
              className="inline-flex mt-6 px-6 py-3.5 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700"
            >
              ← {locale === 'tr' ? 'Kursa dön' : 'Back to course'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (certDetail) {
    const dateStr = new Date(certDetail.issuedAt).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 via-teal-50/30 to-white pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/courses/${courseSlug}`}
            className="inline-flex gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 mb-6"
          >
            ← {locale === 'tr' ? 'Kurs sayfasına dön' : 'Back to course'}
          </Link>
          <div className="rounded-3xl bg-white shadow-2xl border-2 border-stone-100 p-8 sm:p-10">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-black text-stone-900">
                  {locale === 'tr' ? 'Tebrikler!' : 'Congratulations!'}
                </h1>
                <p className="text-stone-600 mt-1">
                  {locale === 'tr' ? 'Kursu tamamladınız. Sertifikanız aşağıdadır.' : 'You completed the course. Your certificate is below.'}
                </p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="p-8 rounded-2xl border-2 border-teal-100 bg-gradient-to-br from-white via-teal-50/20 to-emerald-50/30 text-center">
              <p className="text-sm font-bold tracking-widest text-teal-600">SERTİFİKA</p>
              <h2 className="mt-4 text-2xl font-black text-stone-900">{certDetail.courseTitle}</h2>
              <p className="mt-6 text-xl font-bold text-stone-800 border-b-2 border-teal-200 pb-4 inline-block">
                {certDetail.userName}
              </p>
              <p className="mt-6 text-stone-600 text-sm">
                {locale === 'tr' ? 'Escape4SDG – Bu sertifika ilgili kursun tüm modüllerinin başarıyla tamamlandığını doğrular.' : 'Escape4SDG – This certificate verifies successful completion of all modules.'}
              </p>
              <p className="mt-4 text-stone-500 text-sm">{dateStr}</p>
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="mt-8 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700"
              >
                <Download className="w-5 h-5" />
                {locale === 'tr' ? 'PDF indir' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
