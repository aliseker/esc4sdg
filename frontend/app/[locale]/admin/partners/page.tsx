'use client';

import { useEffect, useState } from 'react';
import {
  adminPartnersGetAll,
  adminPartnerCreate,
  adminPartnerUpdate,
  adminPartnerDelete,
  adminLanguagesGetAll,
  adminUploadPartnerLogo,
  type Partner,
  type Language,
} from '@/lib/adminApi';
import { API_BASE } from '@/lib/adminApi';
import { Plus, Pencil, Trash2, ImagePlus } from 'lucide-react';

export default function AdminPartnersPage() {
  const [list, setList] = useState<Partner[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Partner | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: '',
    country: '',
    website: '',
    logoUrl: '',
    translations: [] as { languageId: number; description: string }[],
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([adminPartnersGetAll(), adminLanguagesGetAll()])
      .then(([partners, langs]) => {
        setList(partners);
        setLanguages(langs);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setCreating(true);
    setForm({
      name: '',
      country: '',
      website: '',
      logoUrl: '',
      translations: languages.map((l) => ({ languageId: l.id, description: '' })),
    });
  };

  const openEdit = (p: Partner) => {
    setEditing(p);
    setCreating(false);
    setForm({
      name: p.name,
      country: p.country ?? '',
      website: p.website ?? '',
      logoUrl: p.logoUrl ?? '',
      translations: languages.length
        ? languages.map((l) => ({
            languageId: l.id,
            description: p.translations?.find((t) => t.languageId === l.id)?.description ?? '',
          }))
        : p.translations?.map((t) => ({ languageId: t.languageId, description: t.description ?? '' })) ?? [],
    });
  };

  const logoImgSrc = (url: string) =>
    !url ? '' : url.startsWith('http') ? url : `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    adminUploadPartnerLogo(file)
      .then(({ url }) => setForm((f) => ({ ...f, logoUrl: url })))
      .catch((err) => setError(err instanceof Error ? err.message : 'Logo yüklenemedi'))
      .finally(() => { setUploadingLogo(false); e.target.value = ''; });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const body = {
        name: form.name.trim(),
        country: form.country.trim() || '',
        website: form.website.trim() || undefined,
        logoUrl: form.logoUrl.trim() || undefined,
        translations: form.translations.map((t) => ({ languageId: t.languageId, description: t.description?.trim() ?? '' })),
      };
      if (editing) {
        await adminPartnerUpdate(editing.id, body);
      } else {
        await adminPartnerCreate(body as Partner & { name: string; country: string });
      }
      setEditing(null);
      setCreating(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Bu ortak silinsin mi?')) return;
    try {
      await adminPartnerDelete(id);
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
        <h2 className="text-2xl font-bold text-stone-900">Ortaklar</h2>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600"
        >
          <Plus className="w-4 h-4" />
          Yeni ortak
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-800 text-sm">{error}</div>
      )}

      {(editing || creating) && (
        <form onSubmit={submit} className="rounded-2xl bg-white border border-stone-200 p-6 space-y-6">
          <h3 className="font-semibold text-stone-800">{editing ? 'Ortak düzenle' : 'Yeni ortak'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-stone-600">Ad *</span>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
                placeholder="Ortak kurum adı"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-stone-600">Ülke</span>
              <input
                type="text"
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
                placeholder="Türkiye"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-stone-600">Web sitesi</span>
              <input
                type="url"
                value={form.website}
                onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
                placeholder="https://..."
              />
            </label>
            <div className="sm:col-span-2 space-y-2">
              <span className="text-sm font-medium text-stone-600 block">Logo</span>
              <div className="flex flex-wrap items-center gap-3">
                {form.logoUrl ? (
                  <>
                    <img
                      src={logoImgSrc(form.logoUrl)}
                      alt="Logo"
                      className="h-16 w-auto max-w-[200px] object-contain rounded-lg border border-stone-200 bg-white"
                    />
                    <div className="flex flex-col gap-1">
                      <input
                        type="url"
                        value={form.logoUrl}
                        onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
                        className="rounded-lg border border-stone-300 px-3 py-2 text-sm w-64"
                        placeholder="Logo URL veya yükleyin"
                      />
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, logoUrl: '' }))}
                        className="text-sm text-stone-500 hover:text-red-600"
                      >
                        Logoyu kaldır
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 font-medium cursor-pointer hover:bg-stone-50 disabled:opacity-50">
                      <ImagePlus className="w-4 h-4" />
                      {uploadingLogo ? 'Yükleniyor...' : 'Logo yükle'}
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.gif,.svg"
                        className="sr-only"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                      />
                    </label>
                    <input
                      type="url"
                      value={form.logoUrl}
                      onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
                      className="rounded-lg border border-stone-300 px-3 py-2 text-sm w-64"
                      placeholder="veya logo URL girin"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
          {form.translations.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-stone-700">Açıklama (her dil için)</p>
              <p className="text-xs text-stone-500">Sitede ortaklar sayfasında görünecek; dil seçimine göre ilgili açıklama kullanılır.</p>
              <div className="space-y-4">
                {form.translations.map((t, i) => (
                  <div key={t.languageId} className="rounded-xl border border-stone-200 bg-stone-50/50 p-4">
                    <span className="inline-block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                      {languages.find((l) => l.id === t.languageId)?.code ?? t.languageId}
                    </span>
                    <textarea
                      value={t.description}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          translations: f.translations.map((tr, j) =>
                            j === i ? { ...tr, description: e.target.value } : tr
                          ),
                        }))
                      }
                      className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm min-h-[80px]"
                      placeholder="Bu dilde görünecek açıklama..."
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
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
          {list.map((p) => (
            <li key={p.id} className="flex items-center justify-between px-6 py-4 hover:bg-stone-50">
              <div className="flex items-center gap-4">
                {p.logoUrl ? (
                  <img
                    src={p.logoUrl.startsWith('http') ? p.logoUrl : `${API_BASE}${p.logoUrl.startsWith('/') ? '' : '/'}${p.logoUrl}`}
                    alt=""
                    className="h-12 w-16 object-contain rounded border border-stone-200 bg-white flex-shrink-0"
                  />
                ) : (
                  <div className="h-12 w-16 rounded border border-stone-200 bg-stone-100 flex items-center justify-center text-stone-400 text-xs flex-shrink-0">
                    Logo yok
                  </div>
                )}
                <div>
                  <p className="font-medium text-stone-900">{p.name}</p>
                  <p className="text-sm text-stone-500">
                    {[p.country, p.website].filter(Boolean).join(' · ') || '—'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(p)}
                  className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-700"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        {list.length === 0 && (
          <p className="px-6 py-8 text-center text-stone-500">Henüz ortak eklenmemiş. Yeni ortak ekleyin.</p>
        )}
      </div>
    </div>
  );
}
