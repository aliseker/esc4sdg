'use client';

import { useEffect, useState } from 'react';
import {
  adminLanguagesGetAll,
  adminLanguageCreate,
  adminLanguageUpdate,
  adminLanguageDelete,
  type Language,
} from '@/lib/adminApi';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const PREDEFINED_LANGUAGES = [
  { code: 'tr', name: 'Türkçe' },
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
  { code: 'it', name: 'Italiano' },
  { code: 'ru', name: 'Русский' },
  { code: 'ar', name: 'العربية' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'pt', name: 'Português' },
  { code: 'nl', name: 'Nederlands' },
];

export default function AdminLanguagesPage() {
  const [list, setList] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Language | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', sortOrder: 0 });

  const load = () => {
    setLoading(true);
    setError('');
    adminLanguagesGetAll()
      .then(setList)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setCreating(true);
    setForm({ code: '', name: '', sortOrder: list.length });
  };

  const openEdit = (l: Language) => {
    setEditing(l);
    setCreating(false);
    setForm({ code: l.code, name: l.name, sortOrder: l.sortOrder });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await adminLanguageUpdate(editing.id, form);
      } else {
        await adminLanguageCreate(form);
      }
      setEditing(null);
      setCreating(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Bu dil silinsin mi?')) return;
    try {
      await adminLanguageDelete(id);
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
        <h2 className="text-2xl font-bold text-stone-900">Diller</h2>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600"
        >
          <Plus className="w-4 h-4" />
          Yeni dil
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-800 text-sm">{error}</div>
      )}

      {(editing || creating) && (
        <form onSubmit={submit} className="rounded-2xl bg-white border border-stone-200 p-6 space-y-4">
          <h3 className="font-semibold text-stone-800">{editing ? 'Dil düzenle' : 'Yeni dil'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block">
                <span className="text-sm font-medium text-stone-600">Dil Seçin</span>
                <select
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 bg-white"
                  value={form.code}
                  onChange={(e) => {
                    const code = e.target.value;
                    const selected = PREDEFINED_LANGUAGES.find((l) => l.code === code);
                    if (selected) {
                      setForm((f) => ({ ...f, code: selected.code, name: selected.name }));
                    }
                  }}
                >
                  <option value="">-- Dil Seçiniz --</option>
                  {PREDEFINED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.name} ({l.code})
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {/* Gizli inputlar, form gönderimi için gerekebilir ama state zaten dolu */}

            <label className="block">
              <span className="text-sm font-medium text-stone-600">Sıra</span>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))}
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
              />
            </label>

            {/* Manuel düzenleme imkanı için (isteğe bağlı, şimdilik readonly gösterelim veya gizleyelim. Kullanıcı 'seçme usulü' dediği için sadece verify amaçlı gösterelim) */}
            <div className="sm:col-span-3 text-xs text-stone-500">
              Seçilen: <strong>{form.name}</strong> ({form.code})
            </div>
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
          {list.map((l) => (
            <li key={l.id} className="flex items-center justify-between px-6 py-4 hover:bg-stone-50">
              <div>
                <p className="font-medium text-stone-900">{l.name}</p>
                <p className="text-sm text-stone-500">Kod: {l.code}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => openEdit(l)} className="p-2 rounded-lg text-stone-500 hover:bg-stone-100">
                  <Pencil className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => remove(l.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        {list.length === 0 && (
          <p className="px-6 py-8 text-center text-stone-500">Henüz dil eklenmemiş. Admin panelinden dil ekleyebilirsiniz.</p>
        )}
      </div>
    </div>
  );
}
