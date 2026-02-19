'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  Clock,
  Star,
  ArrowRight,
  Filter,
  Search,
  BookOpen,
  FileQuestion,
  Award,
  Layers,
  Globe,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { getCoursesList, type CourseListItem } from '@/lib/coursesApi';
import { API_BASE } from '@/lib/authApi';
import AnimateInView from '@/components/UI/AnimateInView';
import studyCover from '@/public/images/study.jpg';

function courseImageSrc(imageUrl: string | null | undefined) {
  if (!imageUrl) return studyCover;
  return imageUrl.startsWith('http') ? imageUrl : `${API_BASE}${imageUrl}`;
}

const CARD_THEMES = [
  { gradient: 'from-teal-500/80 to-emerald-600/90', accent: 'teal' },
  { gradient: 'from-orange-500/80 to-amber-600/90', accent: 'orange' },
  { gradient: 'from-violet-500/80 to-purple-600/90', accent: 'violet' },
];

const CourseCardApi = ({
  course,
  locale,
  themeIndex = 0,
}: {
  course: CourseListItem;
  locale: string;
  themeIndex?: number;
}) => {
  const t = useTranslations('courses');
  const theme = CARD_THEMES[themeIndex % CARD_THEMES.length];
  const title = course.title ?? course.slug;
  const summary = course.summary ?? '';
  const lessonCount = course.lessonCount ?? 0;
  const accentClasses =
    theme.accent === 'teal'
      ? 'group-hover:border-teal-200 group-hover:shadow-teal-500/20'
      : theme.accent === 'orange'
        ? 'group-hover:border-orange-200 group-hover:shadow-orange-500/20'
        : 'group-hover:border-violet-200 group-hover:shadow-violet-500/20';

  return (
    <Link href={`/courses/${course.slug}`} className="block h-full">
      <div
        className={`group relative overflow-hidden rounded-2xl bg-white shadow-xl shadow-stone-200/30 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 h-full flex flex-col border-2 border-stone-100/80 hover:border-2 ${accentClasses}`}
      >
        <div className="relative overflow-hidden h-48 flex-shrink-0">
          <Image
            src={courseImageSrc(course.imageUrl)}
            alt=""
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized={!!course.imageUrl}
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${theme.gradient} opacity-65`} />
          <div className="absolute inset-0 bg-dots opacity-10" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[120px]" />
          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/95 backdrop-blur-sm border border-white/50 shadow-lg">
            {(() => {
              const lvl = course.level || 'Beginner';
              const key = `level_${lvl.toLowerCase()}`;
              // @ts-ignore - dynamic key check
              return t.has(key) ? t(key) : lvl;
            })()}
          </div>
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/95 backdrop-blur-sm border border-white/50 shadow-lg">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-stone-700">
              {course.averageRating > 0 ? course.averageRating.toFixed(1) : '-'}
            </span>
            {course.ratingCount > 0 && (
              <span className="text-xs text-stone-500">({course.ratingCount})</span>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/95 via-stone-900/85 to-stone-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5">
            <div className="translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
              <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-3">{t('featuresTitle')}</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-white text-sm font-medium">
                  <BookOpen className="w-4 h-4 text-teal-300 flex-shrink-0" />
                  {t('featureLessons', { count: lessonCount })}
                </li>
                <li className="flex items-center gap-2 text-white text-sm font-medium">
                  <Award className="w-4 h-4 text-amber-300 flex-shrink-0" />
                  {t('featureCertificate')}
                </li>
                <li className="flex items-center gap-2 text-white text-sm font-medium">
                  <Clock className="w-4 h-4 text-teal-300 flex-shrink-0" />
                  {course.durationMinutes} dakika
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col p-6">
          <span className="inline-block px-2.5 py-1 rounded-lg bg-stone-100 text-stone-600 text-xs font-semibold mb-3 w-fit">
            {course.category ?? 'Education'}
          </span>
          <h3 className="text-lg font-bold text-stone-900 line-clamp-2 group-hover:text-teal-700 transition-colors leading-tight mb-2">
            {title}
          </h3>
          <p className="text-sm text-stone-500 line-clamp-2 mb-4 font-medium">{summary}</p>
          <div className="flex items-center gap-2 text-sm text-stone-500 mb-5 flex-wrap">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-600">
              <Clock className="w-4 h-4" />
              {course.durationMinutes} dk
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-600">
              <Layers className="w-3.5 h-3.5" />
              {lessonCount} ders
            </span>
          </div>
          <div className="mt-auto">
            <span className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-500/25 transition-all group-hover:scale-[1.03] group-hover:shadow-teal-500/35">
              {t('viewDetails')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};


export default function CoursesPage() {
  const t = useTranslations('courses');
  const locale = useLocale();
  const [apiCourses, setApiCourses] = useState<CourseListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState<'All' | string>('All');
  const [showFilters, setShowFilters] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    getCoursesList(locale).then(setApiCourses);
  }, [locale]);

  const categories = Array.from(
    new Set([...(apiCourses.map((c) => c.category).filter(Boolean) as string[])])
  ).sort();
  const levels = ['Beginner', 'Intermediate', 'Advanced'] as const;
  // const languages = ['tr', 'en'] as const;
  const [languages, setLanguages] = useState<string[]>([]);

  useEffect(() => {
    import('@/lib/publicApi').then(({ getLanguages }) => {
      getLanguages().then((langs) => {
        setLanguages(langs.map((l) => l.code));
      });
    });
  }, []);

  const filteredCourses = apiCourses
    .filter((course) => {
      const title = course.title ?? course.slug;
      const titleStr = typeof title === 'string' ? title : '';
      const matchesSearch =
        titleStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.instructorName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      const cat = course.category;
      const matchesCategory = selectedCategory === 'All' || cat === selectedCategory;
      const lvl = course.level;
      const matchesLevel = selectedLevel === 'All' || lvl === selectedLevel;
      // const langOk = selectedLanguage === 'All' || locale === selectedLanguage; // FIXME: API'de dil filtresi yoksa
      const langOk = true;
      return matchesSearch && matchesCategory && matchesLevel && langOk;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') {
        return b.averageRating - a.averageRating;
      }
      // Default: newest (by ID desc)
      return b.id - a.id;
    });

  return (
    <div className="min-h-screen bg-stone-50 overflow-hidden">
      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-600" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_120%,rgba(251,146,60,0.25),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_-10%,rgba(168,85,247,0.2),transparent)]" />
        <div className="absolute top-20 left-[10%] w-32 h-32 rounded-full bg-white/5 blur-2xl animate-float" />
        <div className="absolute bottom-20 right-[15%] w-40 h-40 rounded-full bg-white/5 blur-3xl animate-float-slow" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimateInView animation="fade-up" delay={0}>
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-bold mb-8 border border-white/20">
              <BookOpen className="w-4 h-4" />
              {t('headerBadge')}
            </span>
          </AnimateInView>
          <AnimateInView animation="fade-up" delay={100}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 drop-shadow-lg">
              {t('title')}
            </h1>
          </AnimateInView>
          <AnimateInView animation="fade-up" delay={200}>
            <p className="text-xl text-white/90 max-w-2xl mx-auto font-medium">
              {t('subtitle')}
            </p>
          </AnimateInView>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="relative -mt-8 z-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <AnimateInView animation="fade-up" delay={0}>
            <div className="rounded-2xl bg-white shadow-xl shadow-stone-200/50 border-2 border-stone-100 p-6 overflow-hidden">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-stone-800"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-3.5 border-2 border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-bold text-stone-700 bg-stone-50 cursor-pointer"
                  >
                    <option value="newest">{locale === 'tr' ? 'En Yeni' : 'Newest'}</option>
                    <option value="rating">{locale === 'tr' ? 'En Yüksek Puan' : 'Highest Rated'}</option>
                  </select>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all ${showFilters
                      ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                  >
                    <Filter className="w-5 h-5" />
                    {t('filter')}
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="mt-6 pt-6 border-t border-stone-200 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-up">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">Kategori</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium text-stone-800"
                    >
                      <option value="All">Tümü</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">Seviye</label>
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium text-stone-800"
                    >
                      <option value="All">Tümü</option>
                      {levels.map((level) => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">Dil</label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium text-stone-800"
                    >
                      <option value="All">Tümü</option>
                      {languages.map((lang) => (
                        <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </AnimateInView>
        </div>
      </section>

      {/* Course Grid */}
      <section className="relative py-16 lg:py-24">
        <div className="absolute inset-0 bg-dots opacity-20" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-200/15 rounded-full blur-3xl -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-200/15 rounded-full blur-3xl translate-x-1/2" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateInView animation="fade-up" className="mb-8">
            <p className="text-stone-600 font-bold">
              <span className="text-teal-600">
                {t('results', { count: filteredCourses.length })}
              </span>
            </p>
          </AnimateInView>

          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course, i) => (
                <AnimateInView key={course.id} animation="fade-up" delay={Math.min(i * 80, 400)}>
                  <CourseCardApi course={course} locale={locale} themeIndex={i} />
                </AnimateInView>
              ))}
            </div>
          ) : (
            <AnimateInView animation="fade-up">
              <div className="text-center py-20 rounded-3xl bg-white border-2 border-stone-100 shadow-xl">
                <div className="w-20 h-20 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-10 h-10 text-stone-400" />
                </div>
                <h3 className="text-2xl font-bold text-stone-800 mb-2">{t('notFoundTitle')}</h3>
                <p className="text-stone-500 max-w-md mx-auto">{t('notFoundDesc')}</p>
              </div>
            </AnimateInView>
          )}
        </div>
      </section>
    </div>
  );
}
