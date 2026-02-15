'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Languages, RefreshCw, Search, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import {
  adminLanguagesGetAll,
  adminSiteTranslationsGet,
  adminSiteTranslationsUpdate,
  adminSiteTranslationsAutoFill,
  type Language,
  type SiteTranslationItem,
} from '@/lib/adminApi';

const SECTION_NAMES: Record<string, string> = {
  common: 'Site başlığı / sekme',
  nav: 'Menü (üst navigasyon)',
  home: 'Ana sayfa – Hero',
  certificateSection: 'Ana sayfa – Sertifika bölümü',
  courses: 'Kurslar sayfası',
  about: 'Hakkımızda sayfası',
  projects: 'Projeler bölümü',
  projectsList: 'Proje kartları (başlık, açıklama)',
  partners: 'Ortaklar sayfası',
  footer: 'Footer',
  auth: 'Giriş / Kayıt',
  admin: 'Admin panel',
  other: 'Diğer',
};

const SECTION_ORDER = [
  'common',
  'nav',
  'home',
  'certificateSection',
  'courses',
  'about',
  'projects',
  'projectsList',
  'partners',
  'footer',
  'auth',
  'admin',
  'other',
];

export default function AdminTranslationsPage() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLangId, setSelectedLangId] = useState<number | null>(null);
  const [referenceLangId, setReferenceLangId] = useState<number | null>(null);
  const [data, setData] = useState<{
    languageId: number;
    languageCode: string;
    languageName: string;
    items: SiteTranslationItem[];
  } | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoFilling, setAutoFilling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['common', 'nav', 'home']));

  useEffect(() => {
    adminLanguagesGetAll()
      .then((list) => {
        setLanguages(list);
        if (list.length > 0 && selectedLangId == null) setSelectedLangId(list[0].id);
        if (list.length > 1 && referenceLangId == null) setReferenceLangId(list[1].id);
      })
      .catch(() => setError('Diller yüklenemedi'));
  }, []);

  useEffect(() => {
    if (selectedLangId == null || languages.length === 0) return;
    setLoading(true);
    setError('');
    const selectedCode = languages.find((l) => l.id === selectedLangId)?.code ?? undefined;
    adminSiteTranslationsGet(selectedLangId, referenceLangId ?? undefined, selectedCode)
      .then((d) => {
        setData(d);
        setEdits({});
        const initial: Record<string, string> = {};
        d.items.forEach((i) => { initial[i.key] = i.value; });
        setEdits(initial);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Yüklenemedi'))
      .finally(() => setLoading(false));
  }, [selectedLangId, referenceLangId, languages]);

  const handleSave = async () => {
    if (selectedLangId == null || !data) return;
    setSaving(true);
    setError('');
    setSuccess('');
    const selectedCode = languages.find((l) => l.id === selectedLangId)?.code;
    try {
      await adminSiteTranslationsUpdate(selectedLangId, edits, selectedCode);
      setSuccess('Kaydedildi.');
      setData((prev) => prev ? { ...prev, items: prev.items.map((i) => ({ ...i, value: edits[i.key] ?? i.value })) } : null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const handleAutoFill = async () => {
    if (selectedLangId == null) return;
    setAutoFilling(true);
    setError('');
    setSuccess('');
    const selectedCode = languages.find((l) => l.id === selectedLangId)?.code;
    try {
      const result = await adminSiteTranslationsAutoFill(selectedLangId, referenceLangId ?? undefined, selectedCode);
      setSuccess(result.message);
      adminSiteTranslationsGet(selectedLangId, referenceLangId ?? undefined, selectedCode).then((d) => {
        setData(d);
        const initial: Record<string, string> = {};
        d.items.forEach((i) => { initial[i.key] = i.value; });
        setEdits(initial);
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Otomatik çeviri başarısız');
    } finally {
      setAutoFilling(false);
    }
  };

  const grouped = useMemo(() => {
    if (!data) return {};
    return data.items.reduce((acc, item) => {
      const section = item.key.split('.')[0] || 'other';
      if (!acc[section]) acc[section] = [];
      acc[section].push(item);
      return acc;
    }, {} as Record<string, SiteTranslationItem[]>);
  }, [data]);

  const searchLower = search.trim().toLowerCase();
  const filteredGrouped = useMemo(() => {
    if (!searchLower) return grouped;
    const out: Record<string, SiteTranslationItem[]> = {};
    for (const [section, items] of Object.entries(grouped)) {
      const filtered = items.filter(
        (i) =>
          i.key.toLowerCase().includes(searchLower) ||
          (i.label && i.label.toLowerCase().includes(searchLower)) ||
          (i.value && i.value.toLowerCase().includes(searchLower)) ||
          (i.referenceValue && i.referenceValue.toLowerCase().includes(searchLower))
      );
      if (filtered.length) out[section] = filtered;
    }
    return out;
  }, [grouped, searchLower]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors" aria-label="Geri">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <Languages className="w-7 h-7 text-amber-600" />
          Site çevirileri
        </h1>
      </div>

      <p className="text-stone-600 text-sm">
        Metinleri <strong>sayfa / bölüm</strong> bazında düzenleyebilirsiniz. Arama ile aradığınız anahtarı hızlıca bulun; referans sütunu kaynak dildeki değeri gösterir.
      </p>

      {error && <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">{error}</div>}
      {success && <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">{success}</div>}

      <div className="flex flex-wrap items-end gap-4 p-4 rounded-xl bg-white border border-stone-200 shadow-sm">
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">Düzenlenecek dil</label>
          <select
            value={selectedLangId ?? ''}
            onChange={(e) => {
              const id = e.target.value ? Number(e.target.value) : null;
              setSelectedLangId(id);
              if (id != null && id === referenceLangId && languages.length > 1) {
                const other = languages.find((l) => l.id !== id);
                if (other) setReferenceLangId(other.id);
              }
            }}
            className="px-3 py-2 rounded-lg border border-stone-200 bg-white min-w-[180px] focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
          >
            {languages.map((l) => (
              <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">Referans dil (karşılaştırma)</label>
          <select
            value={referenceLangId ?? ''}
            onChange={(e) => setReferenceLangId(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-2 rounded-lg border border-stone-200 bg-white min-w-[180px] focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
          >
            {languages.map((l) => (
              <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
            ))}
          </select>
        </div>
        {data && (
          <p className="text-sm text-stone-500 ml-1">
            Şu an düzenlenen: <strong>{data.languageName} ({data.languageCode})</strong>
          </p>
        )}
        <div className="flex gap-2 ml-auto">
          <button
            type="button"
            onClick={handleAutoFill}
            disabled={autoFilling || selectedLangId == null}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 text-stone-700 font-medium hover:bg-stone-200 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${autoFilling ? 'animate-spin' : ''}`} />
            {autoFilling ? 'Çevriliyor...' : 'Otomatik çevir'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || selectedLangId == null}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      {!loading && data && data.items.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Anahtar veya metin ara (örn: hero, menü, sertifika...)"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-800 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
          />
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && data && (
        <div className="space-y-2">
          {SECTION_ORDER.filter((s) => filteredGrouped[s]?.length).map((section) => {
            const items = filteredGrouped[section];
            const sectionName = SECTION_NAMES[section] ?? section;
            const isOpen = openSections.has(section);
            return (
              <div key={section} className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleSection(section)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 bg-stone-50 hover:bg-stone-100 border-b border-stone-200 transition-colors text-left"
                >
                  {isOpen ? (
                    <ChevronDown className="w-5 h-5 text-stone-500 shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-stone-500 shrink-0" />
                  )}
                  <FileText className="w-5 h-5 text-amber-600 shrink-0" />
                  <span className="font-semibold text-stone-800">{sectionName}</span>
                  <span className="text-sm text-stone-500 ml-auto">{items.length} metin</span>
                </button>
                {isOpen && (
                  <div className="divide-y divide-stone-100">
                    {items.map((item) => (
                      <div key={item.key} className="p-4 flex flex-col gap-2 bg-white">
                        <label className="text-sm font-medium text-stone-700 flex items-baseline gap-2">
                          <span className="text-stone-500 font-mono text-xs">{item.key}</span>
                          {item.label && item.label !== item.key && (
                            <span className="text-stone-400">·</span>
                          )}
                          {item.label && item.label !== item.key && <span>{item.label}</span>}
                        </label>
                        {item.referenceValue && (
                          <div className="text-xs text-stone-500 bg-amber-50/60 rounded-lg px-3 py-2 border border-amber-100">
                            <span className="font-medium text-amber-800">Referans:</span>{' '}
                            <span className="break-words">{item.referenceValue.length > 180 ? item.referenceValue.slice(0, 180) + '…' : item.referenceValue}</span>
                          </div>
                        )}
                        <textarea
                          value={edits[item.key] ?? ''}
                          onChange={(e) => setEdits((prev) => ({ ...prev, [item.key]: e.target.value }))}
                          rows={item.value?.includes('\n') || (edits[item.key] ?? '').length > 80 ? 3 : 1}
                          className="w-full px-3 py-2 rounded-lg border border-stone-200 text-stone-800 resize-y min-h-[44px] focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
                          placeholder="Metin"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && data && data.items.length === 0 && (
        <div className="py-12 text-center text-stone-500">Bu dil için henüz çeviri anahtarı yok. Otomatik çevir veya manuel ekleyerek başlayın.</div>
      )}
    </div>
  );
}
