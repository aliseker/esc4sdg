'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { getUserToken } from '@/lib/authApi';
import { getMyCertificates, getCertificate } from '@/lib/coursesApi';
import { downloadCertificatePdf } from '@/lib/certificatePdf';
import { Award, Download, Lock } from 'lucide-react';

export default function MyCertificatesPage() {
  const locale = useLocale();
  const [list, setList] = useState<{ id: number; courseSlug: string; courseTitle: string | null; issuedAt: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getUserToken();
    if (!token) {
      setLoading(false);
      return;
    }
    getMyCertificates(token, locale)
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [locale]);

  const handleDownload = (id: number, courseSlug: string) => {
    const token = getUserToken();
    if (!token) return;
    getCertificate(id, token, locale).then((d) => {
      downloadCertificatePdf({
        userName: d.userName,
        courseTitle: d.courseTitle,
        issuedAt: d.issuedAt,
        filename: `Escape4SDG-${courseSlug}.pdf`,
      });
    });
  };

  if (!getUserToken()) {
    return (
      <div className="min-h-screen bg-stone-50 pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Lock className="w-14 h-14 text-stone-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-stone-900">
            {locale === 'tr' ? 'Sertifikalarınızı görmek için giriş yapın' : 'Log in to view your certificates'}
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-stone-900 mb-2">
          {locale === 'tr' ? 'Sertifikalarım' : 'My Certificates'}
        </h1>
        <p className="text-stone-600 mb-8">
          {locale === 'tr' ? 'Tamamladığınız kurslara ait sertifikalar. PDF olarak indirebilirsiniz.' : 'Certificates for courses you completed. You can download them as PDF.'}
        </p>
        {list.length === 0 ? (
          <div className="rounded-2xl bg-white border border-stone-200 p-8 text-center">
            <Award className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-600">
              {locale === 'tr' ? 'Henüz sertifikanız yok. Kursları tamamlayarak sertifika kazanın.' : 'You have no certificates yet. Complete courses to earn certificates.'}
            </p>
            <Link href="/courses" className="inline-flex mt-6 text-teal-600 font-semibold hover:underline">
              {locale === 'tr' ? 'Kurslara git' : 'Go to courses'}
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {list.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-4 rounded-2xl bg-white border border-stone-200 p-6 shadow-sm"
              >
                <div>
                  <h2 className="font-bold text-stone-900">{c.courseTitle ?? c.courseSlug}</h2>
                  <p className="text-sm text-stone-500 mt-0.5">
                    {new Date(c.issuedAt).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/courses/${c.courseSlug}/certificate`}
                    className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 font-medium hover:bg-stone-50"
                  >
                    {locale === 'tr' ? 'Görüntüle' : 'View'}
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDownload(c.id, c.courseSlug)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
