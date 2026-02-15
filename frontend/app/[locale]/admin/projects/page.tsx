'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  adminProjectsGetAll,
  adminProjectDelete,
  type AdminProjectListItem,
} from '@/lib/adminApi';
import { API_BASE } from '@/lib/adminApi';
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react';

export default function AdminProjectsPage() {
  const [list, setList] = useState<AdminProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    adminProjectsGetAll()
      .then(setList)
      .catch((err) => setError(err instanceof Error ? err.message : 'Yüklenemedi'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: number) => {
    if (!confirm('Bu proje silinsin mi?')) return;
    try {
      await adminProjectDelete(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silinemedi');
    }
  };

  const coverSrc = (url: string | null) =>
    !url ? '' : url.startsWith('http') ? url : `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;

  const firstTitle = (p: AdminProjectListItem) =>
    p.translations?.[0]?.title ?? `Proje #${p.id}`;

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
        <h2 className="text-2xl font-bold text-stone-900">Projeler</h2>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600"
        >
          <Plus className="w-4 h-4" />
          Yeni proje
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
          {error}
        </div>
      )}

      {list.length === 0 && !loading ? (
        <div className="rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 p-12 text-center">
          <FolderOpen className="w-12 h-12 text-stone-400 mx-auto mb-4" />
          <p className="text-stone-600 font-medium">Henüz proje yok.</p>
          <p className="text-stone-500 text-sm mt-1">Yeni proje eklemek için yukarıdaki butonu kullanın.</p>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600"
          >
            <Plus className="w-4 h-4" />
            Yeni proje
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
          <ul className="divide-y divide-stone-100">
            {list.map((p) => (
              <li key={p.id} className="flex items-center gap-4 p-4 hover:bg-stone-50">
                <div className="w-16 h-16 rounded-xl bg-stone-100 overflow-hidden shrink-0">
                  {p.coverImageUrl ? (
                    <img
                      src={coverSrc(p.coverImageUrl)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FolderOpen className="w-8 h-8 text-stone-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-900 truncate">{firstTitle(p)}</p>
                  <p className="text-sm text-stone-500">{p.slug}</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {p.galleryCount} galeri fotoğrafı · Sıra: {p.sortOrder}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/projects/${p.id}`}
                    className="p-2 rounded-lg text-stone-600 hover:bg-amber-100 hover:text-amber-800"
                    title="Düzenle"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    className="p-2 rounded-lg text-stone-600 hover:bg-red-50 hover:text-red-700"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
