'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import {
  adminProjectGet,
  adminProjectUpdate,
  adminLanguagesGetAll,
  adminUploadProjectCover,
  type AdminProjectFull,
  type Language,
} from '@/lib/adminApi';
import { API_BASE } from '@/lib/adminApi';
import { RichTextEditor } from '@/components/Admin/RichTextEditor';

export function AdminProjectEditClient({ id }: { id: number }) {
  const router = useRouter();
  const [project, setProject] = useState<AdminProjectFull | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [slug, setSlug] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [translations, setTranslations] = useState<{ languageId: number; title: string; subtitle: string; bodyHtml: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLangId, setActiveLangId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!Number.isFinite(id)) return;
    Promise.all([adminProjectGet(id), adminLanguagesGetAll()])
      .then(([p, langs]) => {
        setProject(p);
        setSlug(p.slug);
        setCoverImageUrl(p.coverImageUrl ?? '');
        setLanguages(langs);
        setTranslations(
          langs.map((l) => ({
            languageId: l.id,
            title: p.translations?.find((t) => t.languageId === l.id)?.title ?? '',
            subtitle: p.translations?.find((t) => t.languageId === l.id)?.subtitle ?? '',
            bodyHtml: p.translations?.find((t) => t.languageId === l.id)?.bodyHtml ?? '',
          }))
        );
        if (langs.length > 0) setActiveLangId(langs[0].id);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Yüklenemedi'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    adminUploadProjectCover(file)
      .then(({ url }) => setCoverImageUrl(url))
      .catch((err) => setError(err instanceof Error ? err.message : 'Yükleme başarısız'))
      .finally(() => { setUploadingCover(false); e.target.value = ''; });
  };

  const update = (langId: number, field: 'title' | 'subtitle' | 'bodyHtml', value: string) =>
    setTranslations((prev) => prev.map((x) => (x.languageId === langId ? { ...x, [field]: value } : x)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    const s = slug.trim().toLowerCase().replace(/\s+/g, '-');
    if (!s) {
      setError('Slug zorunludur.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const trs = languages.map((l) => ({
        languageId: l.id,
        title: translations.find((t) => t.languageId === l.id)?.title?.trim() ?? '',
        subtitle: translations.find((t) => t.languageId === l.id)?.subtitle?.trim() ?? undefined,
        bodyHtml: translations.find((t) => t.languageId === l.id)?.bodyHtml?.trim() ?? undefined,
      })).filter((t) => t.title);
      await adminProjectUpdate(project.id, {
        slug: s,
        coverImageUrl: coverImageUrl || undefined,
        translations: trs,
        galleryImages: project.galleryImages?.map((g) => ({ imageUrl: g.imageUrl, caption: g.caption ?? undefined })) ?? [],
      });
      router.push('/admin/projects');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setSaving(false);
    }
  };

  const coverSrc = () => (coverImageUrl ? (coverImageUrl.startsWith('http') ? coverImageUrl : `${API_BASE}${coverImageUrl}`) : '');

  if (loading || !project) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/projects" className="p-2 rounded-lg text-stone-600 hover:bg-stone-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-2xl font-bold text-stone-900">Projeyi düzenle</h2>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">{error}</div>
      )}

      <form onSubmit={submit} className="space-y-6">
        <div className="rounded-2xl bg-white border border-stone-200 p-4 sm:p-6 mb-6">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">İçeriği düzenlediğiniz dil</p>
          <div className="flex flex-wrap gap-2">
            {languages.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setActiveLangId(l.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeLangId === l.id
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-200 scale-105'
                  : 'bg-stone-50 text-stone-500 hover:bg-stone-100 hover:text-stone-700'
                  }`}
              >
                {l.name} ({l.code.toUpperCase()})
              </button>
            ))}
          </div>
        </div>

        <section className="rounded-2xl bg-white border border-stone-200 p-6 space-y-6 mb-8 shadow-sm">
          <h3 className="text-lg font-bold text-stone-800 border-b border-stone-100 pb-4">Genel Bilgiler</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Slug (URL) *</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                required
                placeholder="proje-url-adresi"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Kapak Fotoğrafı</label>
              <div className="flex items-center gap-4">
                {coverImageUrl && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                    <img src={coverSrc()} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <label className="cursor-pointer flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 font-bold border-2 border-dashed border-stone-200 transition-all">
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploadingCover} />
                  {uploadingCover ? 'Yükleniyor...' : coverImageUrl ? 'Fotoğrafı Değiştir' : 'Fotoğraf Yükle'}
                </label>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white border border-stone-200 p-6 space-y-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <h3 className="text-lg font-bold text-stone-800">Çeviri İçeriği</h3>
            {activeLangId && (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-[10px] font-black uppercase rounded-full">
                {languages.find(l => l.id === activeLangId)?.name} DÜZENLENİYOR
              </span>
            )}
          </div>

          {activeLangId && (() => {
            const t = translations.find((x) => x.languageId === activeLangId) ?? { languageId: activeLangId, title: '', subtitle: '', bodyHtml: '' };
            return (
              <div className="space-y-5 animate-in fade-in slide-in-from-top-1 duration-300">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2 whitespace-nowrap">Başlık *</label>
                  <input
                    type="text"
                    value={t.title}
                    onChange={(e) => update(activeLangId, 'title', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all shadow-sm"
                    placeholder="Proje başlığı..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2 whitespace-nowrap">Alt Başlık</label>
                  <input
                    type="text"
                    value={t.subtitle}
                    onChange={(e) => update(activeLangId, 'subtitle', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all shadow-sm"
                    placeholder="Kısa özet..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2 whitespace-nowrap">Metin İçeriği</label>
                  <div className="bg-white rounded-xl overflow-hidden border border-stone-200 shadow-sm">
                    <RichTextEditor
                      value={t.bodyHtml}
                      onChange={(html) => update(activeLangId, 'bodyHtml', html)}
                      placeholder="Proje detaylarını buraya yazın..."
                      minHeight="300px"
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </section>

        <div className="flex items-center gap-3 pt-4 pb-12">
          <button type="submit" disabled={saving} className="px-8 py-4 rounded-2xl bg-orange-600 text-white font-black hover:bg-orange-700 disabled:opacity-50 shadow-xl shadow-orange-200 transition-all hover:-translate-y-0.5">
            {saving ? 'KAYDEDİLİYOR...' : 'PROJEYİ KAYDET'}
          </button>
          <Link href="/admin/projects" className="px-8 py-4 rounded-2xl border border-stone-200 text-stone-700 font-bold hover:bg-stone-50 transition-all">Vazgeç</Link>
        </div>
      </form>
    </div>
  );
}
