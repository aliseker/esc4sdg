'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminCoursesGetAll, adminCourseDelete, type AdminCourseListItem } from '@/lib/adminApi';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function AdminCoursesPage() {
  const [list, setList] = useState<AdminCourseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    adminCoursesGetAll()
      .then(setList)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: number, slug: string) => {
    if (!confirm(`"${slug}" kursu silinsin mi?`)) return;
    try {
      await adminCourseDelete(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  };

  if (loading && list.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-stone-900">Kurslar (MOOC)</h2>
        <Link
          href="/admin/courses/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600"
        >
          <Plus className="w-4 h-4" />
          Yeni kurs
        </Link>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-800 text-sm">{error}</div>
      )}

      <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden">
        <ul className="divide-y divide-stone-100">
          {list.map((c) => (
            <li key={c.id} className="flex items-center justify-between px-6 py-4 hover:bg-stone-50">
              <div>
                <p className="font-medium text-stone-900">{c.slug}</p>
                <p className="text-sm text-stone-500">
                  {c.category ?? '-'} · {c.durationMinutes} dk · {c.moduleCount} bölüm, {c.lessonCount} ders
                  {c.hasCertificate && ' · Sertifika'}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/courses/${c.id}`}
                  className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-700"
                >
                  <Pencil className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => remove(c.id, c.slug)}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        {list.length === 0 && (
          <p className="px-6 py-8 text-center text-stone-500">
            Henüz kurs yok. Yeni kurs ekleyin veya API üzerinden ekleyebilirsiniz.
          </p>
        )}
      </div>
    </div>
  );
}
