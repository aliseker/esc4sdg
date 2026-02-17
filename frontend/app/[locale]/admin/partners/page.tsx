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
import { Plus, Pencil, Trash2, ImagePlus, Building2 } from 'lucide-react';
import { LogoCircleSelector } from '@/components/Admin/LogoCircleSelector';
import { RichTextEditor } from '@/components/Admin/RichTextEditor';

export default function AdminPartnersPage() {
  const [list, setList] = useState<Partner[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Partner | null>(null);
  const [creating, setCreating] = useState(false);
  const [activeLangId, setActiveLangId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '',
    country: '',
    website: '',
    logoUrl: '',
    logoPosition: '' as string,
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
        if (langs.length > 0 && activeLangId === null) setActiveLangId(langs[0].id);
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
      logoPosition: 'center',
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
      logoPosition: p.logoPosition ?? 'center',
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
        logoPosition: form.logoPosition?.trim() || undefined,
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
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-stone-900 tracking-tight">Ortak Ortaklar</h2>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-600 text-white font-black hover:bg-orange-700 transition-all shadow-xl shadow-orange-100"
        >
          <Plus className="w-4 h-4" />
          YENİ ORTAK EKLE
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-red-800 text-sm animate-in fade-in duration-300">
          {error}
        </div>
      )}

      {(editing || creating) && (
        <form onSubmit={submit} className="animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Form Tabs-like Layout */}
          <div className="rounded-3xl bg-white border border-stone-200 p-8 space-y-10 shadow-xl shadow-stone-200/40">
            <div className="flex items-center justify-between border-b border-stone-100 pb-6">
              <h3 className="text-xl font-black text-stone-800">{editing ? 'Ortak Düzenle' : 'Yeni Ortak Kaydı'}</h3>
              <div className="flex gap-2">
                {languages.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setActiveLangId(l.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeLangId === l.id
                      ? 'bg-orange-600 text-white shadow-lg'
                      : 'bg-stone-50 text-stone-400 hover:text-stone-600'
                      }`}
                  >
                    {l.code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Kurum Adı *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-2xl border border-stone-200 px-4 py-4 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-bold placeholder:text-stone-300"
                    placeholder="E.g. United Nations"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Ülke</label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                    className="w-full rounded-2xl border border-stone-200 px-4 py-4 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-bold placeholder:text-stone-300"
                    placeholder="Türkiye"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Web Sitesi</label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                    className="w-full rounded-2xl border border-stone-200 px-4 py-4 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-bold placeholder:text-stone-300"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-4 text-center">Kurumsal Logo (Preview)</label>
                  <div className="flex flex-col items-center gap-6 p-6 rounded-[40px] bg-stone-50/50 border-2 border-dashed border-stone-200">
                    {form.logoUrl ? (
                      <div className="flex flex-col items-center gap-6 w-full">
                        <LogoCircleSelector
                          imageSrc={logoImgSrc(form.logoUrl)}
                          value={form.logoPosition || '50% 50%'}
                          onChange={(position) => setForm((f) => ({ ...f, logoPosition: position }))}
                        />
                        <div className="flex flex-col gap-2 w-full max-w-sm">
                          <input
                            type="text"
                            value={form.logoUrl}
                            onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
                            className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium text-stone-500"
                            placeholder="Logo URL"
                          />
                          <button
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, logoUrl: '' }))}
                            className="text-xs font-black text-red-500 hover:text-red-600 uppercase tracking-widest"
                          >
                            LOGOYU KALDIR
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center min-h-[220px] w-full gap-4">
                        <label className="group cursor-pointer flex flex-col items-center gap-4 px-8 py-8 rounded-[32px] bg-white border border-stone-200 shadow-sm hover:shadow-md transition-all">
                          <ImagePlus className="w-10 h-10 text-stone-300 group-hover:text-orange-500 transition-colors" />
                          <span className="text-sm font-black text-stone-500 group-hover:text-stone-800">
                            {uploadingLogo ? 'YÜKLENİYOR...' : 'LOGO YÜKLE'}
                          </span>
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,.gif,.svg"
                            className="sr-only"
                            onChange={handleLogoUpload}
                            disabled={uploadingLogo}
                          />
                        </label>
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">Veya URL girin</p>
                        <input
                          type="text"
                          value={form.logoUrl}
                          onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
                          className="w-full max-w-[240px] rounded-xl border border-stone-200 px-3 py-2 text-xs text-center"
                          placeholder="https://..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-stone-100">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-xs font-black text-stone-400 uppercase tracking-widest">
                  Açıklama ({languages.find(l => l.id === activeLangId)?.code.toUpperCase()})
                </label>
              </div>

              {activeLangId && (() => {
                const trIndex = form.translations.findIndex(t => t.languageId === activeLangId);
                const currentTr = form.translations[trIndex] || { languageId: activeLangId, description: '' };

                return (
                  <div className="rounded-3xl border border-stone-200 bg-white shadow-inner-sm overflow-hidden">
                    <RichTextEditor
                      value={currentTr.description}
                      onChange={(html) => {
                        setForm(f => ({
                          ...f,
                          translations: f.translations.some(t => t.languageId === activeLangId)
                            ? f.translations.map(t => t.languageId === activeLangId ? { ...t, description: html } : t)
                            : [...f.translations, { languageId: activeLangId, description: html }]
                        }));
                      }}
                      placeholder="Ortak hakkında premium bir açıklama yazın..."
                      minHeight="220px"
                    />
                  </div>
                );
              })()}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 px-8 py-5 rounded-[24px] bg-teal-600 text-white font-black hover:bg-teal-700 shadow-xl shadow-teal-100 transition-all hover:-translate-y-1"
              >
                {editing ? 'TERCİHLERİ GÜNCELLE' : 'ORTAĞI SİSTEME EKLE'}
              </button>
              <button
                type="button"
                onClick={() => { setEditing(null); setCreating(false); }}
                className="px-8 py-5 rounded-[24px] border border-stone-200 text-stone-500 font-bold hover:bg-stone-50 transition-all"
              >
                İptal
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="rounded-[40px] bg-white border border-stone-100 shadow-2xl shadow-stone-200/40 overflow-hidden">
        <ul className="divide-y divide-stone-50">
          {list.map((p) => (
            <li key={p.id} className="group flex items-center justify-between px-8 py-6 hover:bg-stone-50/80 transition-all">
              <div className="flex items-center gap-6">
                <div className="h-16 w-24 rounded-2xl border border-stone-200 bg-white overflow-hidden p-2 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                  {p.logoUrl ? (
                    <img
                      src={p.logoUrl.startsWith('http') ? p.logoUrl : `${API_BASE}${p.logoUrl.startsWith('/') ? '' : '/'}${p.logoUrl}`}
                      alt=""
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <Building2 className="h-6 w-6 text-stone-200" />
                  )}
                </div>
                <div>
                  <p className="text-lg font-black text-stone-800 tracking-tight">{p.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{p.country || 'Belirtilmemiş'}</span>
                    {p.website && (
                      <span className="text-[10px] text-stone-300 font-black px-2 py-0.5 rounded bg-stone-100">PRO</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(p)}
                  className="p-3 rounded-xl text-stone-400 hover:bg-white hover:text-teal-600 hover:shadow-lg transition-all"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  className="p-3 rounded-xl text-stone-300 hover:bg-red-50 hover:text-red-500 hover:shadow-lg transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        {list.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <Building2 className="w-16 h-16 text-stone-100 mb-4" />
            <p className="text-stone-400 font-bold">Henüz herhangi bir ortak eklenmemiş.</p>
          </div>
        )}
      </div>
    </div>
  );
}
