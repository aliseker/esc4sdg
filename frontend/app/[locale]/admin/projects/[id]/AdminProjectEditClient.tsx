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
    <div className="max-w-2xl space-y-6">
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
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Slug (URL) *</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Kapak fotoğrafı</label>
          <div className="flex items-center gap-4">
            {coverImageUrl && (
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-stone-100">
                <img src={coverSrc()} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium">
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploadingCover} />
              {uploadingCover ? 'Yükleniyor...' : coverImageUrl ? 'Değiştir' : 'Yükle'}
            </label>
          </div>
        </div>

        {languages.map((lang) => {
          const t = translations.find((x) => x.languageId === lang.id) ?? { languageId: lang.id, title: '', subtitle: '', bodyHtml: '' };
          return (
            <div key={lang.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3">
              <p className="text-sm font-semibold text-stone-700">{lang.name}</p>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Başlık *</label>
                <input type="text" value={t.title} onChange={(e) => update(lang.id, 'title', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200" />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Alt başlık</label>
                <input type="text" value={t.subtitle} onChange={(e) => update(lang.id, 'subtitle', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200" />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Metin</label>
                <RichTextEditor
                  value={t.bodyHtml}
                  onChange={(html) => update(lang.id, 'bodyHtml', html)}
                  placeholder="İçerik yazın..."
                  minHeight="200px"
                />
              </div>
            </div>
          );
        })}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50">
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          <Link href="/admin/projects" className="px-6 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-medium hover:bg-stone-50">İptal</Link>
        </div>
      </form>
    </div>
  );
}
