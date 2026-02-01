'use client';

import { useState, useMemo } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Circle,
  Video,
  FileQuestion,
  FileText,
  ClipboardCheck,
  ChevronDown,
  ChevronRight,
  Wrench,
  BookMarked,
  ClipboardList,
  List,
  X,
} from 'lucide-react';
import type { Course, Lesson, Module, QuizQuestion } from '@/lib/mockCourses';
import { markModuleCompleted } from '@/lib/progress';

type SectionId = 'intro' | 'preQuiz' | 'content' | 'listOfTools' | 'conclusion' | 'postQuiz' | 'evaluation';

const SECTIONS: { id: SectionId; icon: typeof Video; itemCount: (lesson: Lesson) => number }[] = [
  { id: 'intro', icon: Video, itemCount: () => 1 },
  { id: 'preQuiz', icon: FileQuestion, itemCount: (l) => (l.preQuiz?.length ? 1 : 0) },
  { id: 'content', icon: FileText, itemCount: () => 1 },
  { id: 'listOfTools', icon: Wrench, itemCount: (l) => l.tools?.length ?? 0 },
  { id: 'conclusion', icon: BookMarked, itemCount: () => 1 },
  { id: 'postQuiz', icon: ClipboardCheck, itemCount: () => 1 },
  { id: 'evaluation', icon: ClipboardList, itemCount: () => 1 },
];

type Props = {
  course: Course;
  module: Module;
  lesson: Lesson;
  locale: 'tr' | 'en';
  nextModuleSlug: string | null;
};

const SECTION_LABEL_KEYS: Record<SectionId, string> = {
  intro: 'introductionVideo',
  preQuiz: 'preQuiz',
  content: 'modulePresentation',
  listOfTools: 'listOfTools',
  conclusion: 'conclusion',
  postQuiz: 'postQuiz',
  evaluation: 'evaluation',
};

export function ModuleContentView({ course, module, lesson, locale, nextModuleSlug }: Props) {
  const t = useTranslations('courses');
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SectionId>('intro');
  const [preQuizAnswers, setPreQuizAnswers] = useState<Record<string, string>>({});
  const [postQuizAnswers, setPostQuizAnswers] = useState<Record<string, string>>({});
  const [postQuizSubmitted, setPostQuizSubmitted] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const preQuiz = lesson.preQuiz ?? [];
  const content = lesson.content?.[locale] ?? module.description[locale];
  const tools = lesson.tools ?? [];
  const conclusionText = lesson.conclusion?.[locale];
  const postQuiz = lesson.quiz;

  const visibleSections = useMemo(() => {
    return SECTIONS.filter((s) => {
      const n = s.itemCount(lesson);
      if (s.id === 'preQuiz' && n === 0) return false;
      if (s.id === 'listOfTools' && n === 0) return false;
      if (s.id === 'conclusion' && !conclusionText) return false;
      return true;
    });
  }, [lesson, conclusionText]);

  const totalItems = useMemo(
    () => visibleSections.reduce((acc, s) => acc + s.itemCount(lesson), 0),
    [visibleSections, lesson]
  );

  const completedItems = useMemo(() => {
    const idx = visibleSections.findIndex((s) => s.id === activeSection);
    let count = 0;
    for (let i = 0; i < idx; i++) count += visibleSections[i].itemCount(lesson);
    if (idx >= 0 && activeSection === 'postQuiz' && postQuizSubmitted)
      count += visibleSections[idx].itemCount(lesson);
    else if (idx >= 0 && activeSection !== 'postQuiz')
      count += visibleSections[idx].itemCount(lesson);
    return Math.min(count, totalItems);
  }, [activeSection, visibleSections, lesson, postQuizSubmitted, totalItems]);

  const postQuizScore = useMemo(() => {
    if (!postQuizSubmitted) return null;
    const total = postQuiz.length || 1;
    const correct = postQuiz.filter((q) => postQuizAnswers[q.id] === q.correctOptionId).length;
    return Math.round((correct / total) * 100);
  }, [postQuiz, postQuizAnswers, postQuizSubmitted]);

  const postQuizPassed = postQuizScore !== null && postQuizScore >= lesson.passScore;

  const handlePostQuizSubmit = () => {
    setPostQuizSubmitted(true);
    if (postQuizScore === null) {
      const total = postQuiz.length || 1;
      const correct = postQuiz.filter((q) => postQuizAnswers[q.id] === q.correctOptionId).length;
      const score = Math.round((correct / total) * 100);
      if (score >= lesson.passScore) {
        markModuleCompleted(course.slug, module.slug);
      }
    }
  };

  const sectionIndex = visibleSections.findIndex((s) => s.id === activeSection);
  const canGoNext = () => {
    if (activeSection === 'postQuiz') return postQuizSubmitted && postQuizPassed;
    return true;
  };
  const canGoPrev = () => sectionIndex > 0;

  const goNext = () => {
    if (activeSection === 'postQuiz' && postQuizSubmitted && postQuizPassed) {
      const nextIdx = sectionIndex + 1;
      if (nextIdx < visibleSections.length) {
        setActiveSection(visibleSections[nextIdx].id);
        return;
      }
      if (nextModuleSlug) {
        router.push(`/courses/${course.slug}/modules/${nextModuleSlug}`);
      } else {
        router.push(`/courses/${course.slug}/certificate`);
      }
      return;
    }
    if (activeSection === 'evaluation') {
      if (nextModuleSlug) {
        router.push(`/courses/${course.slug}/modules/${nextModuleSlug}`);
      } else {
        router.push(`/courses/${course.slug}/certificate`);
      }
      return;
    }
    const nextIdx = sectionIndex + 1;
    if (nextIdx < visibleSections.length) setActiveSection(visibleSections[nextIdx].id);
  };

  const goPrev = () => {
    if (sectionIndex > 0) setActiveSection(visibleSections[sectionIndex - 1].id);
  };

  const renderQuiz = (questions: QuizQuestion[], answers: Record<string, string>, setAnswers: (a: Record<string, string>) => void, isPostQuiz: boolean) => (
    <div className="space-y-6">
      {questions.map((q, idx) => (
        <div key={q.id} className="p-5 rounded-2xl border-2 border-stone-100 hover:border-teal-100 transition-colors">
          <p className="font-bold text-stone-900 text-lg">{idx + 1}. {q.prompt[locale]}</p>
          <div className="mt-4 grid gap-3">
            {q.options.map((opt) => {
              const selected = answers[q.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAnswers({ ...answers, [q.id]: opt.id })}
                  className={`text-left w-full px-5 py-4 rounded-xl border-2 transition-all flex items-start gap-3 ${
                    selected ? 'border-teal-500 bg-teal-50' : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {selected ? <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" /> : <Circle className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />}
                  <span className="text-stone-800 font-medium">{opt.text[locale]}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {isPostQuiz && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => { setPostQuizSubmitted(true); const total = postQuiz.length || 1; const correct = postQuiz.filter((q) => postQuizAnswers[q.id] === q.correctOptionId).length; const s = Math.round((correct / total) * 100); if (s >= lesson.passScore) markModuleCompleted(course.slug, module.slug); }}
            className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all"
          >
            {t('submit')}
          </button>
          {postQuizSubmitted && postQuizScore !== null && (
            <span className={`text-lg font-bold ${postQuizPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
              {t('score')}: {postQuizScore}% — {postQuizPassed ? t('passed') : t('failed')}
            </span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Top bar - orange accent */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href={`/courses/${course.slug}`} className="flex items-center gap-2 text-white/90 hover:text-white transition-colors font-semibold">
                <ArrowLeft className="w-5 h-5" />
                {t('backToCourse')}
              </Link>
              <span className="hidden sm:block text-white/60">|</span>
              <h1 className="text-lg font-bold truncate max-w-xs sm:max-w-md">{module.title[locale]}</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold">{completedItems} / {totalItems} {locale === 'tr' ? 'öğe' : 'items'}</span>
              <div className="w-32 h-2 rounded-full bg-white/30 overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${(completedItems / totalItems) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex relative">
        {/* Mobile: İçerik button to open sidebar */}
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="md:hidden fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-3 rounded-xl bg-teal-600 text-white font-bold shadow-lg shadow-teal-500/30"
        >
          <List className="w-5 h-5" />
          {locale === 'tr' ? 'İçerik' : 'Contents'}
        </button>
        {/* Sidebar – course contents (visible from md, or as overlay on mobile when sidebarOpen) */}
        <aside
          className={`flex-col w-72 shrink-0 border-r border-stone-200 bg-white z-20 ${
            sidebarOpen ? 'flex fixed inset-y-0 left-0 top-0 pt-14 shadow-xl' : 'hidden'
          } md:flex md:relative md:inset-auto md:shadow-none md:pt-0 flex flex-col`}
        >
          {sidebarOpen && (
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden absolute top-3 right-3 p-2 rounded-lg hover:bg-stone-100 text-stone-600 z-10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div className={`p-4 border-b border-stone-100 ${sidebarOpen ? 'pt-12' : ''} md:pt-4`}>
            <div className="relative">
              <input
                type="text"
                placeholder={t('searchContent')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-stone-200 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">🔍</span>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
            {visibleSections.map(({ id, icon: Icon, itemCount }) => {
              const n = itemCount(lesson);
              const isActive = activeSection === id;
              const currentIdx = visibleSections.findIndex((s) => s.id === id);
              const isCompleted =
                currentIdx < visibleSections.findIndex((s) => s.id === activeSection) ||
                (id === 'postQuiz' && postQuizSubmitted);
              const isOpen = collapsed[id] !== true;
              const toggleCollapsed = () => setCollapsed((c) => ({ ...c, [id]: !c[id] }));
              return (
                <div key={id} className="rounded-lg border border-stone-100 overflow-hidden">
                  <div className="flex items-center gap-1 bg-stone-50/80">
                    <button
                      type="button"
                      onClick={toggleCollapsed}
                      className="p-2 text-stone-500 hover:text-stone-700"
                      aria-label={isOpen ? 'Collapse' : 'Expand'}
                    >
                      {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <span className="text-xs font-bold text-stone-500 py-1 pr-2">{n}</span>
                    <span className="text-xs font-bold text-stone-700 flex-1 py-2 pr-2">
                      {t(SECTION_LABEL_KEYS[id] || id)}
                    </span>
                  </div>
                  {isOpen && (
                    <button
                      type="button"
                      onClick={() => setActiveSection(id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-b-lg text-left transition-all border-t border-stone-100 ${
                        isActive
                          ? 'bg-amber-100 text-amber-900 border-amber-200'
                          : 'hover:bg-stone-50 border-transparent'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      ) : (
                        <Icon className="w-5 h-5 text-stone-400 shrink-0" />
                      )}
                      <span className="font-semibold text-sm flex-1">
                        {t(SECTION_LABEL_KEYS[id] || id)}
                      </span>
                    </button>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-6 lg:p-10">
          <div className="max-w-3xl mx-auto">
            {activeSection === 'intro' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-stone-900">{t('introductionVideo')}</h2>
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-stone-900 shadow-xl border-2 border-stone-200">
                  {lesson.videoEmbedUrl ? (
                    <iframe
                      className="w-full h-full"
                      src={lesson.videoEmbedUrl}
                      title="Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/80">
                      <Play className="w-16 h-16" />
                    </div>
                  )}
                </div>
                <p className="text-stone-600">{locale === 'tr' ? 'Videoyu izledikten sonra Ön Quiz\'e geçin.' : 'After watching the video, proceed to the Pre Quiz.'}</p>
              </div>
            )}

            {activeSection === 'preQuiz' && preQuiz.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-stone-900">{t('preQuiz')}</h2>
                <p className="text-stone-600">{locale === 'tr' ? 'Modüle başlamadan önce bilginizi ölçün.' : 'Assess your knowledge before starting the module.'}</p>
                {renderQuiz(preQuiz, preQuizAnswers, setPreQuizAnswers, false)}
              </div>
            )}

            {activeSection === 'content' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-stone-900">{t('modulePresentation')}</h2>
                <div className="prose prose-stone prose-lg max-w-none p-6 rounded-2xl bg-white border-2 border-stone-100 shadow-lg">
                  <p className="text-stone-700 leading-relaxed whitespace-pre-line">{content}</p>
                </div>
              </div>
            )}

            {activeSection === 'listOfTools' && tools.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-stone-900">{t('listOfTools')}</h2>
                <p className="text-stone-600">
                  {locale === 'tr'
                    ? 'Bu modülde kullanabileceğiniz araçlar ve kaynaklar.'
                    : 'Tools and resources you can use in this module.'}
                </p>
                <ul className="space-y-3">
                  {tools.map((tool, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 p-4 rounded-xl border-2 border-stone-100 bg-white hover:border-teal-100 transition-colors"
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-100 text-teal-700 font-bold text-sm">
                        {i + 1}
                      </span>
                      <span className="font-medium text-stone-800">{tool.title[locale]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeSection === 'conclusion' && conclusionText && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-stone-900">{t('conclusion')}</h2>
                <div className="prose prose-stone prose-lg max-w-none p-6 rounded-2xl bg-white border-2 border-stone-100 shadow-lg">
                  <p className="text-stone-700 leading-relaxed whitespace-pre-line">{conclusionText}</p>
                </div>
              </div>
            )}

            {activeSection === 'evaluation' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-stone-900">{t('evaluation')}</h2>
                <p className="text-stone-600">
                  {locale === 'tr'
                    ? 'Modül değerlendirmesini Son Quiz bölümünde tamamlayabilirsiniz.'
                    : 'You can complete the module evaluation in the Post Quiz section.'}
                </p>
                <div className="p-6 rounded-2xl bg-stone-50 border-2 border-stone-100">
                  <p className="text-stone-700 font-medium mb-4">
                    {locale === 'tr'
                      ? 'Son Quiz\'i tamamladıysanız modül tamamlanmış sayılır.'
                      : 'Completing the Post Quiz counts as module completion.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveSection('postQuiz')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-100 text-teal-800 font-bold hover:bg-teal-200 transition-colors"
                  >
                    {t('postQuiz')} →
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'postQuiz' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-stone-900">{t('postQuiz')}</h2>
                <p className="text-stone-600 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-teal-100 text-teal-700 font-bold text-sm">{t('passScore')}: {lesson.passScore}%</span>
                </p>
                {renderQuiz(postQuiz, postQuizAnswers, setPostQuizAnswers, true)}
                {postQuizSubmitted && postQuizPassed && (
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200">
                    <p className="font-bold text-emerald-800 text-lg mb-4">{nextModuleSlug ? t('congrats') : t('congratsFinal')}</p>
                    {nextModuleSlug ? (
                      <Link href={`/courses/${course.slug}/modules/${nextModuleSlug}`} className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-lg">
                        {t('nextModule')}
                      </Link>
                    ) : (
                      <Link href={`/courses/${course.slug}/certificate`} className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-lg">
                        {t('viewCertificate')}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="mt-10 flex items-center justify-between gap-4 pt-8 border-t border-stone-200">
              <button
                type="button"
                onClick={goPrev}
                disabled={!canGoPrev()}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                ← {t('previous')}
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={activeSection === 'postQuiz' && (!postQuizSubmitted || !postQuizPassed)}
                className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {activeSection === 'postQuiz' && postQuizSubmitted && postQuizPassed
                  ? nextModuleSlug
                    ? t('nextModule')
                    : t('viewCertificate')
                  : activeSection === 'evaluation'
                    ? nextModuleSlug
                      ? t('nextModule')
                      : t('viewCertificate')
                    : t('next')}{' '}
                →
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
