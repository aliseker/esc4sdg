'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Video, FileText, HelpCircle, FileUp, Plus, Trash2, ImagePlus } from 'lucide-react';
import { QuizEditor } from '@/components/Admin/QuizEditor';
import { VideoDurationFetcher } from '@/components/Admin/VideoDurationFetcher';
import { RichTextEditor } from '@/components/Admin/RichTextEditor';
import {
  adminLanguagesGetAll,
  adminCourseGet,
  adminCourseUpdate,
  adminUploadCourseCover,
  adminUploadCourseMaterial,

  adminDeleteCourseCover,
  adminSiteTranslationsGet,
  API_BASE,
  type Language,
  type AdminCourseFull,
  type AdminCoursePayload,
} from '@/lib/adminApi';

const ITEM_TYPES = ['Video', 'Pdf', 'Text', 'Quiz'] as const;
type ItemType = (typeof ITEM_TYPES)[number];

type ModuleItemForm = {
  id?: number;
  sortOrder: number;
  type: ItemType;
  videoUrl?: string;
  mustWatch?: boolean;
  videoDurationSeconds?: number;
  filePath?: string;
  textContent?: string;
  quizDataJson?: string;
  passScorePercent?: number;
  translations: { languageId: number; title: string }[];
};

type ModuleForm = {
  id?: number;
  sortOrder: number;
  translations: { languageId: number; title: string; description: string }[];
  items: ModuleItemForm[];
};

function defaultItemForType(type: ItemType, langs: Language[]): ModuleItemForm {
  return {
    sortOrder: 0,
    type,
    translations: langs.map((l) => ({ languageId: l.id, title: '' })),
    ...(type === 'Video' && { mustWatch: false }),
    ...(type === 'Quiz' && { passScorePercent: 70 }),
  };
}

export function AdminCourseEditClient({ id }: { id: number }) {
  const router = useRouter();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [course, setCourse] = useState<AdminCourseFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [slug, setSlug] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverDeleting, setCoverDeleting] = useState(false);
  const [activeLangId, setActiveLangId] = useState<number | null>(null);
  const [courseTranslations, setCourseTranslations] = useState<{ languageId: number; title: string; summary: string; category: string; level: string }[]>([]);
  const [modules, setModules] = useState<ModuleForm[]>([]);

  const [addItemModuleIdx, setAddItemModuleIdx] = useState<number | null>(null);
  const [uploadingItem, setUploadingItem] = useState<{ modIdx: number; itemIdx: number } | null>(null);
  const [levelLabels, setLevelLabels] = useState<Record<string, string>>({
    Beginner: 'Beginner',
    Intermediate: 'Intermediate',
    Advanced: 'Advanced',
  });

  useEffect(() => {
    if (!id || isNaN(id)) {
      setLoading(false);
      return;
    }
    Promise.all([adminLanguagesGetAll(), adminCourseGet(id)])
      .then(([langs, c]) => {
        setLanguages(langs);
        setCourse(c);
        setSlug(c.slug);
        setImageUrl(c.imageUrl ?? '');
        setCourseTranslations(
          langs.map((l) => {
            const t = c.translations?.find((x) => x.languageId === l.id);
            return {
              languageId: l.id,
              title: t?.title ?? '',
              summary: t?.summary ?? '',
              category: t?.category ?? '',
              level: t?.level ?? 'Beginner'
            };
          })
        );
        setModules(
          (c.modules ?? []).map((m) => ({
            id: m.id,
            sortOrder: m.sortOrder,
            translations: langs.map((l) => {
              const t = m.translations?.find((x) => x.languageId === l.id);
              return { languageId: l.id, title: t?.title ?? '', description: t?.description ?? '' };
            }),
            items: (m.items ?? []).map((i) => ({
              id: i.id,
              sortOrder: i.sortOrder,
              type: (i.type ?? 'Text') as ItemType,
              videoUrl: i.videoUrl,
              mustWatch: (i as { mustWatch?: boolean }).mustWatch,
              videoDurationSeconds: (i as { videoDurationSeconds?: number }).videoDurationSeconds,
              filePath: i.filePath,
              textContent: i.textContent,
              quizDataJson: i.quizDataJson,
              passScorePercent: i.passScorePercent,
              translations: langs.map((l) => {
                const t = i.translations?.find((x) => x.languageId === l.id);
                return { languageId: l.id, title: t?.title ?? '' };
              }),
            })),
          }))
        );
        if (langs.length > 0) setActiveLangId(langs[0].id);
      })

      .catch((err) => setError(err instanceof Error ? err.message : 'Yüklenemedi'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (activeLangId) {
      adminSiteTranslationsGet(activeLangId)
        .then((data) => {
          const newLabels: Record<string, string> = {
            Beginner: 'Beginner',
            Intermediate: 'Intermediate',
            Advanced: 'Advanced',
          };
          data.items.forEach((item) => {
            if (item.key === 'courses.level_beginner' && item.value?.trim()) newLabels.Beginner = item.value;
            if (item.key === 'courses.level_intermediate' && item.value?.trim()) newLabels.Intermediate = item.value;
            if (item.key === 'courses.level_advanced' && item.value?.trim()) newLabels.Advanced = item.value;
          });
          setLevelLabels(newLabels);
        })
        .catch((err) => console.error('Translation fetch error:', err));
    }
  }, [activeLangId]);

  const addModule = () => {
    setModules((m) => [
      ...m,
      {
        sortOrder: m.length,
        translations: languages.map((l) => ({ languageId: l.id, title: '', description: '' })),
        items: [],
      },
    ]);
  };

  const addItemToModule = (modIdx: number, type: ItemType) => {
    setModules((m) =>
      m.map((mo, i) =>
        i === modIdx
          ? {
            ...mo,
            items: [...mo.items, { ...defaultItemForType(type, languages), sortOrder: mo.items.length }],
          }
          : mo
      )
    );
    setAddItemModuleIdx(null);
  };

  const removeItemFromModule = (modIdx: number, itemIdx: number) => {
    setModules((m) =>
      m.map((mo, i) =>
        i === modIdx
          ? { ...mo, items: mo.items.filter((_, j) => j !== itemIdx).map((it, j) => ({ ...it, sortOrder: j })) }
          : mo
      )
    );
  };

  const updateModuleItem = (modIdx: number, itemIdx: number, patch: Partial<ModuleItemForm>) => {
    setModules((m) =>
      m.map((mo, mi) =>
        mi === modIdx
          ? { ...mo, items: mo.items.map((it, ii) => (ii === itemIdx ? { ...it, ...patch } : it)) }
          : mo
      )
    );
  };

  const updateItemTranslationTitle = (modIdx: number, itemIdx: number, tri: number, value: string) => {
    setModules((m) =>
      m.map((mo, mi) =>
        mi === modIdx
          ? {
            ...mo,
            items: mo.items.map((it, ii) =>
              ii === itemIdx
                ? {
                  ...it,
                  translations: it.translations.map((t, ti) =>
                    ti === tri ? { ...t, title: value } : t
                  ),
                }
                : it
            ),
          }
          : mo
      )
    );
  };

  const buildPayload = (): AdminCoursePayload => ({
    slug: slug.trim() || 'kurs',
    durationMinutes: 0,
    imageUrl: imageUrl.trim() || undefined,
    hasCertificate: true,
    translations: courseTranslations.map((t) => ({
      languageId: t.languageId,
      title: t.title,
      summary: t.summary,
      category: t.category?.trim() || undefined,
      level: t.level?.trim() || undefined
    })),
    modules: modules.map((mod, i) => ({
      sortOrder: i,
      translations: mod.translations.map((t) => ({ languageId: t.languageId, title: t.title, description: t.description })),
      items: mod.items.map((item, j) => ({
        sortOrder: j,
        type: item.type,
        videoUrl: item.videoUrl || undefined,
        mustWatch: item.mustWatch,
        videoDurationSeconds: item.videoDurationSeconds ?? undefined,
        filePath: item.filePath || undefined,
        textContent: item.textContent || undefined,
        quizDataJson: item.quizDataJson || undefined,
        passScorePercent: item.passScorePercent ?? undefined,
        translations: item.translations.map((t) => ({ languageId: t.languageId, title: t.title })),
      })),
    })),
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || isNaN(id)) return;
    setError('');
    setSaving(true);
    try {
      await adminCourseUpdate(id, buildPayload());
      router.push('/admin/courses');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Güncelleme hatası');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !course) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/courses" className="p-2 rounded-lg hover:bg-stone-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-2xl font-bold text-stone-900">Kursu düzenle: {course.slug}</h2>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-800 text-sm">{error}</div>
      )}

      <form onSubmit={submit} className="space-y-8">
        <section className="rounded-2xl bg-white border border-stone-200 p-4 sm:p-6">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">İçeriği düzenlediğiniz dil</p>
          <div className="flex flex-wrap gap-2">
            {languages.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setActiveLangId(l.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeLangId === l.id
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-800'
                  }`}
              >
                {l.code}
              </button>
            ))}
          </div>
          <p className="text-xs text-stone-500 mt-2">Aşağıdaki kurs adı, özet ve modül başlıkları seçili dil için geçerlidir. Tek kurs — tüm diller birbirine bağlı; kursu sildiğinde hepsi silinir.</p>
        </section>

        <section className="rounded-2xl bg-white border border-stone-200 p-6 space-y-4">
          <h3 className="font-semibold text-stone-800">Temel bilgiler</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label>
              <span className="text-sm text-stone-600">Slug *</span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
              />
            </label>
            <label>
              <span className="text-sm text-stone-600">Kategori {activeLangId && `(${languages.find(l => l.id === activeLangId)?.code})`}</span>
              <input
                type="text"
                value={activeLangId ? courseTranslations.find(t => t.languageId === activeLangId)?.category || '' : ''}
                onChange={(e) => {
                  if (activeLangId) {
                    setCourseTranslations(prev => prev.map(t => t.languageId === activeLangId ? { ...t, category: e.target.value } : t));
                  }
                }}
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
              />
            </label>
            <label>
              <span className="text-sm text-stone-600">Seviye {activeLangId && `(${languages.find(l => l.id === activeLangId)?.code})`}</span>
              <select
                value={activeLangId ? courseTranslations.find(t => t.languageId === activeLangId)?.level || 'Beginner' : 'Beginner'}
                onChange={(e) => {
                  if (activeLangId) {
                    setCourseTranslations(prev => prev.map(t => t.languageId === activeLangId ? { ...t, level: e.target.value } : t));
                  }
                }}
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 bg-white"
              >
                <option value="Beginner">{levelLabels.Beginner}</option>
                <option value="Intermediate">{levelLabels.Intermediate}</option>
                <option value="Advanced">{levelLabels.Advanced}</option>
              </select>
            </label>
            <div className="sm:col-span-2 text-sm text-stone-500">
              <strong>Süre:</strong> İçeriklerden otomatik hesaplanır (video süresi, yazı okuma süresi, PDF/quiz varsayılanları).
            </div>
            <div className="sm:col-span-2">
              <span className="text-sm text-stone-600 block mb-2">Kapak fotoğrafı</span>
              <div className="flex flex-wrap items-start gap-4">
                {imageUrl ? (
                  <div className="relative">
                    <img
                      src={imageUrl.startsWith('http') ? imageUrl : `${API_BASE}${imageUrl}`}
                      alt="Kapak"
                      className="w-32 h-32 object-cover rounded-xl border border-stone-200"
                    />
                    <button
                      type="button"
                      disabled={coverDeleting}
                      onClick={async () => {
                        if (!id || isNaN(id)) return;
                        setCoverDeleting(true);
                        try {
                          await adminDeleteCourseCover(id);
                          setImageUrl('');
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Silinemedi');
                        } finally {
                          setCoverDeleting(false);
                        }
                      }}
                      className="absolute -top-2 -right-2 p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50"
                      title="Kapak fotoğrafını sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-stone-300 hover:border-teal-400 hover:bg-teal-50/50 text-stone-600 text-sm font-medium">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.gif"
                      className="sr-only"
                      disabled={coverUploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setCoverUploading(true);
                        try {
                          const { url } = await adminUploadCourseCover(file);
                          setImageUrl(url);
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Yükleme başarısız');
                        } finally {
                          setCoverUploading(false);
                          e.target.value = '';
                        }
                      }}
                    />
                    {coverUploading ? (
                      <span className="animate-pulse">Yükleniyor...</span>
                    ) : (
                      <>
                        <ImagePlus className="w-5 h-5" />
                        Kapak yükle
                      </>
                    )}
                  </label>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white border border-stone-200 p-6 space-y-4">
          <h3 className="font-semibold text-stone-800">
            Kurs başlığı ve özet
            {activeLangId != null && (
              <span className="ml-2 text-sm font-normal text-stone-500">
                ({languages.find((l) => l.id === activeLangId)?.code})
              </span>
            )}
          </h3>
          {activeLangId != null && (() => {
            const t = courseTranslations.find((x) => x.languageId === activeLangId);
            if (!t) return null;
            const i = courseTranslations.findIndex((x) => x.languageId === activeLangId);
            return (
              <div className="space-y-4 pt-2">
                <label className="block">
                  <span className="text-sm text-stone-600">Başlık</span>
                  <input
                    type="text"
                    placeholder="Başlık"
                    value={t.title}
                    onChange={(e) =>
                      setCourseTranslations((prev) =>
                        prev.map((x, j) => (j === i ? { ...x, title: e.target.value } : x))
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-stone-600">Özet</span>
                  <textarea
                    placeholder="Özet"
                    value={t.summary}
                    onChange={(e) =>
                      setCourseTranslations((prev) =>
                        prev.map((x, j) => (j === i ? { ...x, summary: e.target.value } : x))
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
                    rows={3}
                  />
                </label>
              </div>
            );
          })()}
        </section>

        <section className="rounded-2xl bg-white border border-stone-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-stone-800">Modüller</h3>
            <button type="button" onClick={addModule} className="text-sm text-teal-600 hover:underline">
              + Modül ekle
            </button>
          </div>
          {modules.map((mod, modIdx) => (
            <div key={modIdx} className="border border-stone-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-stone-600">Modül {modIdx + 1}</p>
              {activeLangId != null && (() => {
                const tr = mod.translations.find((t) => t.languageId === activeLangId);
                if (!tr) return null;
                const tri = mod.translations.findIndex((t) => t.languageId === activeLangId);
                return (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Modül başlığı"
                      value={tr.title}
                      onChange={(e) =>
                        setModules((m) =>
                          m.map((mo, mi) =>
                            mi === modIdx
                              ? { ...mo, translations: mo.translations.map((t, ti) => (ti === tri ? { ...t, title: e.target.value } : t)) }
                              : mo
                          )
                        )
                      }
                      className="flex-1 rounded-lg border border-stone-300 px-3 py-1.5 text-sm"
                    />
                  </div>
                );
              })()}
              <div className="flex flex-wrap gap-2 items-center pt-2">
                <button
                  type="button"
                  onClick={() => setAddItemModuleIdx(modIdx)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-teal-300 text-teal-700 hover:bg-teal-50 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  İçerik ekle
                </button>
              </div>
              {mod.items.map((item, itemIdx) => (
                <div key={itemIdx} className="mt-4 rounded-xl border-2 border-stone-200 bg-stone-50/50 overflow-hidden">
                  <div className="flex items-center justify-between gap-2 px-4 py-2 bg-white border-b border-stone-200">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700">
                      {item.type === 'Video' && <Video className="w-4 h-4 text-teal-600" />}
                      {item.type === 'Pdf' && <FileUp className="w-4 h-4 text-amber-600" />}
                      {item.type === 'Text' && <FileText className="w-4 h-4 text-stone-600" />}
                      {item.type === 'Quiz' && <HelpCircle className="w-4 h-4 text-violet-600" />}
                      {item.type === 'Video' && 'Video'}
                      {item.type === 'Pdf' && 'PDF'}
                      {item.type === 'Text' && 'Yazı'}
                      {item.type === 'Quiz' && 'Test'}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItemFromModule(modIdx, itemIdx)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50"
                      title="Kaldır"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-xs font-medium text-stone-500">Başlıklar (dillere göre)</p>
                    {activeLangId != null && (() => {
                      const tr = item.translations.find((t) => t.languageId === activeLangId);
                      if (!tr) return null;
                      const tri = item.translations.findIndex((t) => t.languageId === activeLangId);
                      return (
                        <div className="flex flex-wrap gap-2">
                          <input
                            type="text"
                            placeholder="Başlık"
                            value={tr.title}
                            onChange={(e) => updateItemTranslationTitle(modIdx, itemIdx, tri, e.target.value)}
                            className="flex-1 min-w-[120px] rounded-lg border border-stone-200 px-3 py-2 text-sm"
                          />
                        </div>
                      );
                    })()}
                    {item.type === 'Video' && (
                      <div className="space-y-3 pt-2 border-t border-stone-200">
                        <label className="block">
                          <span className="text-sm text-stone-600">Video URL</span>
                          <input
                            type="url"
                            placeholder="https://..."
                            value={item.videoUrl ?? ''}
                            onChange={(e) => updateModuleItem(modIdx, itemIdx, { videoUrl: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={!!item.mustWatch}
                            onChange={(e) => updateModuleItem(modIdx, itemIdx, { mustWatch: e.target.checked })}
                            className="rounded border-stone-300"
                          />
                          <span className="text-sm text-stone-700">Zorunlu izletilsin (ileri sarılamaz)</span>
                        </label>
                        {item.mustWatch && (
                          <label className="block">
                            <span className="text-sm text-stone-600">Video süresi (saniye)</span>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                min={1}
                                value={item.videoDurationSeconds ?? ''}
                                onChange={(e) =>
                                  updateModuleItem(modIdx, itemIdx, {
                                    videoDurationSeconds: e.target.value ? parseInt(e.target.value, 10) : undefined,
                                  })
                                }
                                placeholder="Örn. 300"
                                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                              />
                              {item.videoUrl && (
                                <VideoDurationFetcher
                                  videoUrl={item.videoUrl}
                                  onDurationFound={(d) => updateModuleItem(modIdx, itemIdx, { videoDurationSeconds: d })}
                                />
                              )}
                            </div>
                            <p className="text-xs text-stone-400 mt-1">
                              Video URL girildiğinde süre otomatik algılanmaya çalışılır.
                            </p>
                          </label>
                        )}
                      </div>
                    )}
                    {item.type === 'Pdf' && (
                      <div className="pt-2 border-t border-stone-200">
                        <label className="block mb-2">
                          <span className="text-sm text-stone-600">PDF Dosyası</span>
                        </label>

                        {item.filePath ? (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                            <FileUp className="w-8 h-8 text-amber-600" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-stone-900 truncate">{item.filePath.split('/').pop()}</p>
                              <a href={`${API_BASE}${item.filePath}`} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-700 hover:underline">Görüntüle</a>
                            </div>
                            <button
                              type="button"
                              onClick={() => updateModuleItem(modIdx, itemIdx, { filePath: '' })}
                              className="p-2 text-stone-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className={`flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-stone-300 transition-colors ${uploadingItem?.modIdx === modIdx && uploadingItem?.itemIdx === itemIdx
                            ? 'bg-stone-100 cursor-wait'
                            : 'hover:border-amber-400 hover:bg-amber-50/50 cursor-pointer'
                            }`}>
                            {uploadingItem?.modIdx === modIdx && uploadingItem?.itemIdx === itemIdx ? (
                              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <FileUp className="w-8 h-8 text-stone-400" />
                            )}
                            <span className="text-sm font-medium text-stone-600">
                              {uploadingItem?.modIdx === modIdx && uploadingItem?.itemIdx === itemIdx ? 'Yükleniyor...' : 'PDF Yükle'}
                            </span>
                            <input
                              type="file"
                              accept=".pdf"
                              disabled={uploadingItem !== null}
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setUploadingItem({ modIdx, itemIdx });
                                try {
                                  const { url } = await adminUploadCourseMaterial(file);
                                  updateModuleItem(modIdx, itemIdx, { filePath: url });
                                } catch (err) {
                                  alert('Yükleme başarısız: ' + (err instanceof Error ? err.message : String(err)));
                                } finally {
                                  setUploadingItem(null);
                                  e.target.value = '';
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    )}
                    {item.type === 'Text' && (
                      <div className="pt-2 border-t border-stone-200">
                        <div className="pt-2 border-t border-stone-200">
                          <div className="block">
                            <span className="text-sm text-stone-600 block mb-2">Metin içerik (araçlar listesi vb.)</span>
                            <RichTextEditor
                              value={item.textContent ?? ''}
                              onChange={(html) => updateModuleItem(modIdx, itemIdx, { textContent: html })}
                              placeholder="İçerik..."
                              minHeight="300px"
                              onUploadImage={adminUploadCourseMaterial}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    {item.type === 'Quiz' && (
                      <div className="space-y-3 pt-2 border-t border-stone-200">
                        <label className="block">
                          <span className="text-sm text-stone-600">Geçme notu (%)</span>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={item.passScorePercent ?? 70}
                            onChange={(e) =>
                              updateModuleItem(modIdx, itemIdx, {
                                passScorePercent: e.target.value ? parseInt(e.target.value, 10) : undefined,
                              })
                            }
                            className="mt-1 w-24 rounded-lg border border-stone-300 px-3 py-2 text-sm"
                          />
                          <span className="ml-2 text-sm text-stone-500">altında kalanlar testi geçemez</span>
                        </label>
                        <div className="block">
                          <QuizEditor
                            value={item.quizDataJson ?? ''}
                            onChange={(json) => updateModuleItem(modIdx, itemIdx, { quizDataJson: json || undefined })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
          {addItemModuleIdx !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setAddItemModuleIdx(null)}>
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                <h4 className="font-bold text-stone-900">Ne eklemek istiyorsun?</h4>
                <p className="text-sm text-stone-500">Modüle eklenecek içerik türünü seç.</p>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => addItemToModule(addItemModuleIdx, 'Video')} className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-stone-200 hover:border-teal-400 hover:bg-teal-50 transition-colors">
                    <Video className="w-10 h-10 text-teal-600" />
                    <span className="font-medium text-stone-800">Video</span>
                  </button>
                  <button type="button" onClick={() => addItemToModule(addItemModuleIdx, 'Pdf')} className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-stone-200 hover:border-amber-400 hover:bg-amber-50 transition-colors">
                    <FileUp className="w-10 h-10 text-amber-600" />
                    <span className="font-medium text-stone-800">PDF</span>
                  </button>
                  <button type="button" onClick={() => addItemToModule(addItemModuleIdx, 'Text')} className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-stone-200 hover:border-stone-400 hover:bg-stone-100 transition-colors">
                    <FileText className="w-10 h-10 text-stone-600" />
                    <span className="font-medium text-stone-800">Yazı</span>
                  </button>
                  <button type="button" onClick={() => addItemToModule(addItemModuleIdx, 'Quiz')} className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-stone-200 hover:border-violet-400 hover:bg-violet-50 transition-colors">
                    <HelpCircle className="w-10 h-10 text-violet-600" />
                    <span className="font-medium text-stone-800">Test</span>
                  </button>
                </div>
                <button type="button" onClick={() => setAddItemModuleIdx(null)} className="w-full py-2 rounded-xl border border-stone-300 text-stone-600 text-sm">İptal</button>
              </div>
            </div>
          )}
        </section>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor...' : 'Güncelle'}
          </button>
          <Link href="/admin/courses" className="px-6 py-2 rounded-xl border border-stone-300 text-stone-700">
            Iptal
          </Link>
        </div>
      </form>
    </div >
  );
}
