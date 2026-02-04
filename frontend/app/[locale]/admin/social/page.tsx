'use client';

import { useEffect, useState } from 'react';
import {
  adminSocialGetAll,
  adminSocialCreate,
  adminSocialUpdate,
  adminSocialDelete,
  type SocialLink,
} from '@/lib/adminApi';
import { Plus, Pencil, Trash2, Linkedin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const SOCIAL_PLATFORMS = [
  { id: 'linkedin', name: 'LinkedIn', Icon: Linkedin },
  { id: 'facebook', name: 'Facebook', Icon: Facebook },
  { id: 'twitter', name: 'Twitter / X', Icon: Twitter },
  { id: 'instagram', name: 'Instagram', Icon: Instagram },
  { id: 'youtube', name: 'YouTube', Icon: Youtube },
] as const;

function getPlatformInfo(platform: string) {
  return SOCIAL_PLATFORMS.find((p) => p.id === platform.toLowerCase()) ?? null;
}

export default function AdminSocialPage() {
  const [list, setList] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<SocialLink | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ platform: '', label: '', url: '' });

  const load = () => {
    setLoading(true);
    setError('');
    adminSocialGetAll()
      .then(setList)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setCreating(true);
    setForm({ platform: '', label: '', url: '' });
  };

  const openEdit = (s: SocialLink) => {
    setEditing(s);
    setCreating(false);
    setForm({ platform: (s.platform || '').toLowerCase(), label: s.label ?? '', url: s.url });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.platform.trim()) {
      setError('Lütfen bir platform seçin.');
      return;
    }
    try {
      const payload = { platform: form.platform.trim(), label: form.label.trim() || undefined, url: form.url.trim() };
      if (editing) {
        await adminSocialUpdate(editing.id, payload);
      } else {
        await adminSocialCreate(payload);
      }
      setEditing(null);
      setCreating(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Bu link silinsin mi?')) return;
    try {
      await adminSocialDelete(id);
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
        <h2 className="text-2xl font-bold text-stone-900">Sosyal medya linkleri</h2>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600"
        >
          <Plus className="w-4 h-4" />
          Yeni link
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-800 text-sm">{error}</div>
      )}

      {(editing || creating) && (
        <form onSubmit={submit} className="rounded-2xl bg-white border border-stone-200 p-6 space-y-4">
          <h3 className="font-semibold text-stone-800">{editing ? 'Link düzenle' : 'Yeni link'}</h3>
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-stone-600 block mb-2">Platform *</span>
              <div className="flex flex-wrap gap-2">
                {SOCIAL_PLATFORMS.map(({ id, name, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, platform: id }))}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all ${
                      form.platform === id
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                    title={name}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{name}</span>
                  </button>
                ))}
              </div>
              {form.platform && (
                <p className="mt-1 text-xs text-stone-500">
                  Seçili: {SOCIAL_PLATFORMS.find((p) => p.id === form.platform)?.name}
                </p>
              )}
            </div>
            <label className="block">
              <span className="text-sm font-medium text-stone-600">Etiket</span>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="İsteğe bağlı"
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-stone-600">URL *</span>
              <input
                type="url"
                required
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700">
              {editing ? 'Güncelle' : 'Ekle'}
            </button>
            <button
              type="button"
              onClick={() => { setEditing(null); setCreating(false); }}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50"
            >
              İptal
            </button>
          </div>
        </form>
      )}

      <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden">
        <ul className="divide-y divide-stone-100">
          {list.map((s) => {
            const info = getPlatformInfo(s.platform);
            return (
            <li key={s.id} className="flex items-center justify-between px-6 py-4 hover:bg-stone-50">
              <div className="flex items-center gap-3">
                {info ? (
                  <span className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600">
                    <info.Icon className="w-5 h-5" />
                  </span>
                ) : null}
                <div>
                  <p className="font-medium text-stone-900">
                    {info?.name ?? s.platform} {s.label && `(${s.label})`}
                  </p>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-600 hover:underline truncate block max-w-md">
                    {s.url}
                  </a>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => openEdit(s)} className="p-2 rounded-lg text-stone-500 hover:bg-stone-100">
                  <Pencil className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => remove(s.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          );
          })}
        </ul>
        {list.length === 0 && (
          <p className="px-6 py-8 text-center text-stone-500">Henüz sosyal medya linki eklenmemiş.</p>
        )}
      </div>
    </div>
  );
}
