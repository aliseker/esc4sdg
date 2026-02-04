'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { getCourseBySlug, getModuleItemContent, completeModuleItem, getCourseProgress, type CourseDetail } from '@/lib/coursesApi';
import { getUserToken, API_BASE } from '@/lib/authApi';
import { parseQuizJson, type QuizQuestion } from '@/components/Admin/QuizEditor';
import { ArrowLeft, ArrowRight, Video, HelpCircle, FileText, FileUp, Award, CheckCircle } from 'lucide-react';

type ItemContent = {
  id: number;
  title: string;
  type: string;
  videoUrl?: string;
  mustWatch?: boolean;
  videoDurationSeconds?: number;
  filePath?: string;
  textContent?: string;
  quizDataJson?: string;
  passScorePercent?: number;
};

/** YouTube watch/youtu.be ve Vimeo linklerini iframe embed URL'ine çevirir; diğerlerini olduğu gibi döndürür */
function toEmbedVideoUrl(url: string): string {
  const u = url.trim();
  if (!u) return '';
  const ytMatch = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  if (u.includes('youtube.com/embed/') || u.includes('player.vimeo.com/video/')) return u;
  return u;
}

function isDirectVideoUrl(url: string): boolean {
  const u = url.toLowerCase();
  return /\.(mp4|webm|ogg|m3u8)(\?|$)/.test(u) || u.includes('video/mp4');
}

function getAllItemsInOrder(course: CourseDetail): { id: number; title: string; type: string }[] {
  return (course.modules ?? []).flatMap((m) => m.items ?? []);
}

function TextContentView({ textContent, onViewed, locale }: { textContent: string; onViewed: () => void; locale: string }) {
  const called = useRef(false);
  useEffect(() => {
    if (called.current) return;
    const t = setTimeout(() => {
      called.current = true;
      onViewed();
    }, 2000);
    return () => clearTimeout(t);
  }, [onViewed]);
  return (
    <div className="space-y-3">
      <div className="whitespace-pre-wrap text-stone-700">{textContent}</div>
      <p className="text-xs text-stone-500">
        {locale === 'tr' ? 'İçerik görüntülendiğinde otomatik tamamlanır.' : 'Content is marked complete when viewed.'}
      </p>
    </div>
  );
}

export default function CourseItemPage() {
  const params = useParams();
  const router = useRouter();
  const courseSlug = typeof params.courseSlug === 'string' ? params.courseSlug : '';
  const itemIdParam = typeof params.itemId === 'string' ? params.itemId : '';
  const itemId = parseInt(itemIdParam, 10);
  const locale = useLocale();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [content, setContent] = useState<ItemContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [completing, setCompleting] = useState(false);
  const [progress, setProgress] = useState<{
    completedCount: number;
    totalItems: number;
    hasCertificate: boolean;
    completed: boolean;
  } | null>(null);
  const completedSentRef = useRef(false);

  const token = typeof window !== 'undefined' ? getUserToken() : null;

  const markItemComplete = useCallback(() => {
    if (!token || completedSentRef.current) return;
    completedSentRef.current = true;
    completeModuleItem(itemId, token)
      .then((res) => {
        setProgress((p) =>
          p
            ? { ...p, completedCount: res.completedCount, totalItems: res.totalItems, hasCertificate: res.completedCount >= res.totalItems ? true : p.hasCertificate, completed: res.completedCount >= res.totalItems }
            : { completedCount: res.completedCount, totalItems: res.totalItems, hasCertificate: res.completedCount >= res.totalItems, completed: res.completedCount >= res.totalItems }
        );
      })
      .catch(() => { completedSentRef.current = false; });
  }, [itemId, token]);

  useEffect(() => {
    if (!courseSlug || Number.isNaN(itemId)) {
      setLoading(false);
      return;
    }
    if (!token) {
      router.replace(`/login?returnUrl=${encodeURIComponent(`/courses/${courseSlug}/item/${itemId}`)}`);
      return;
    }
    getCourseBySlug(courseSlug, locale)
      .then((c) => {
        if (!c) {
          setLoading(false);
          return;
        }
        setCourse(c);
        const allItems = getAllItemsInOrder(c);
        const found = allItems.some((i) => i.id === itemId);
        if (!found) {
          setLoading(false);
          return;
        }
        return Promise.all([
          getModuleItemContent(c.id, itemId, token, locale).then(setContent),
          getCourseProgress(c.id, token).then(setProgress),
        ]);
      })
      .catch(() => setLoading(false))
      .finally(() => setLoading(false));
  }, [courseSlug, itemId, locale, token, router]);

  const allItems = course ? getAllItemsInOrder(course) : [];
  const currentIndex = allItems.findIndex((i) => i.id === itemId);
  const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : null;
  const nextItem = currentIndex >= 0 && currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;

  const handleQuizSubmit = useCallback(() => {
    if (!content?.quizDataJson || !token) return;
    const questions = parseQuizJson(content.quizDataJson);
    let correct = 0;
    questions.forEach((q) => {
      if (quizAnswers[q.id] === q.correctOptionId) correct++;
    });
    const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;
    setQuizScore(score);
    setQuizSubmitted(true);
    const passPercent = content.passScorePercent ?? 70;
    setCompleting(true);
    completeModuleItem(itemId, token, score)
      .then((res) => {
        if (res.totalItems > 0 && res.completedCount >= res.totalItems) {
          setProgress((p) => ({
            completedCount: res.completedCount,
            totalItems: res.totalItems,
            hasCertificate: true,
            completed: true,
          }));
        } else {
          setProgress((p) => p ? { ...p, completedCount: res.completedCount, totalItems: res.totalItems } : null);
        }
      })
      .catch(() => {})
      .finally(() => setCompleting(false));
  }, [content, itemId, token, quizAnswers]);

  if (loading || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 gap-4">
        <p className="text-stone-600">{locale === 'tr' ? 'İçerik bulunamadı.' : 'Content not found.'}</p>
        <Link href={`/courses/${courseSlug}`} className="text-teal-600 font-semibold hover:underline">
          ← {locale === 'tr' ? 'Kursa dön' : 'Back to course'}
        </Link>
      </div>
    );
  }

  const questions: QuizQuestion[] = parseQuizJson(content.quizDataJson);
  const passPercent = content.passScorePercent ?? 70;
  const passed = quizScore !== null && quizScore >= passPercent;

  return (
    <div className="min-h-screen bg-stone-50 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          href={`/courses/${courseSlug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-stone-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {locale === 'tr' ? 'Kursa dön' : 'Back to course'}
        </Link>

        <div className="rounded-2xl bg-white border border-stone-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-3">
            {content.type === 'Video' && <Video className="w-5 h-5 text-teal-600" />}
            {content.type === 'Quiz' && <HelpCircle className="w-5 h-5 text-amber-600" />}
            {content.type === 'Pdf' && <FileUp className="w-5 h-5 text-amber-600" />}
            {(content.type === 'Text' || !['Video', 'Quiz', 'Pdf'].includes(content.type)) && (
              <FileText className="w-5 h-5 text-stone-500" />
            )}
            <h1 className="text-xl font-bold text-stone-900">{content.title}</h1>
          </div>

          <div className="p-6">
            {content.type === 'Video' && (
              content.videoUrl ? (() => {
                const embedUrl = toEmbedVideoUrl(content.videoUrl);
                const directVideo = isDirectVideoUrl(content.videoUrl);
                const displayUrl = directVideo ? (content.videoUrl.startsWith('http') ? content.videoUrl : `${API_BASE}${content.videoUrl}`) : embedUrl;
                if (directVideo) {
                  return (
                    <div className="space-y-3">
                      <div className="aspect-video rounded-xl overflow-hidden bg-stone-900">
                        <video
                          src={displayUrl}
                          controls
                          className="w-full h-full"
                          title={content.title}
                          onEnded={markItemComplete}
                        >
                          {locale === 'tr' ? 'Tarayıcınız video oynatmayı desteklemiyor.' : 'Your browser does not support video.'}
                        </video>
                      </div>
                      <p className="text-xs text-stone-500">
                        {locale === 'tr' ? 'Videoyu sonuna kadar izlediğinizde otomatik tamamlanır.' : 'Item is marked complete when you finish the video.'}
                      </p>
                    </div>
                  );
                }
                if (embedUrl && (embedUrl.includes('youtube.com/embed') || embedUrl.includes('player.vimeo.com'))) {
                  return (
                    <div className="space-y-3">
                      <div className="aspect-video rounded-xl overflow-hidden bg-stone-900">
                        <iframe
                          src={embedUrl}
                          title={content.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      <button
                        type="button"
                        onClick={markItemComplete}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {locale === 'tr' ? 'Videoyu izledim, tamamla' : 'I watched the video, mark complete'}
                      </button>
                    </div>
                  );
                }
                return (
                  <div className="aspect-video rounded-xl bg-stone-100 flex flex-col items-center justify-center gap-3 p-6">
                    <p className="text-stone-600 text-center font-medium">
                      {locale === 'tr' ? 'Bu link burada oynatılamıyor.' : 'This link cannot be played here.'}
                    </p>
                    <a
                      href={content.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700"
                    >
                      {locale === 'tr' ? 'Videoyu yeni sekmede aç' : 'Open video in new tab'}
                    </a>
                    <button
                      type="button"
                      onClick={markItemComplete}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-medium hover:bg-stone-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {locale === 'tr' ? 'İzledim, tamamla' : 'Mark as watched'}
                    </button>
                  </div>
                );
              })() : (
                <p className="text-stone-500 py-4">{locale === 'tr' ? 'Video URL eklenmemiş.' : 'No video URL.'}</p>
              )
            )}

            {content.type === 'Quiz' && (
              <div className="space-y-6">
                {!quizSubmitted ? (
                  <>
                    {questions.map((q) => (
                      <div key={q.id} className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                        <p className="font-medium text-stone-900 mb-3">{q.prompt}</p>
                        <div className="space-y-2">
                          {q.options.map((opt) => (
                            <label key={opt.id} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-stone-200 cursor-pointer hover:border-teal-300">
                              <input
                                type="radio"
                                name={q.id}
                                checked={quizAnswers[q.id] === opt.id}
                                onChange={() => setQuizAnswers((a) => ({ ...a, [q.id]: opt.id }))}
                                className="text-teal-600"
                              />
                              <span className="text-stone-800">{opt.text}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleQuizSubmit}
                      disabled={completing}
                      className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold disabled:opacity-50"
                    >
                      {completing ? '...' : locale === 'tr' ? 'Gönder' : 'Submit'}
                    </button>
                  </>
                ) : (
                  <div className={`p-6 rounded-xl ${passed ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                    <p className="font-bold text-stone-900">
                      {locale === 'tr' ? 'Sonuç' : 'Result'}: %{quizScore}
                      {passed ? ` (${locale === 'tr' ? 'Geçtiniz' : 'Passed'})` : ` (${locale === 'tr' ? 'Geçme notu' : 'Pass score'} %${passPercent})`}
                    </p>
                    {!passed && (
                      <p className="mt-2 text-sm text-stone-600">
                        {locale === 'tr' ? 'Tekrar deneyebilirsiniz.' : 'You can try again.'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {content.type === 'Pdf' && content.filePath && (
              <div className="space-y-4">
                <a
                  href={content.filePath.startsWith('http') ? content.filePath : `${API_BASE}${content.filePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={markItemComplete}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold"
                >
                  <FileUp className="w-5 h-5" />
                  {locale === 'tr' ? 'PDF\'i aç' : 'Open PDF'}
                </a>
                <p className="text-xs text-stone-500">
                  {locale === 'tr' ? 'PDF\'i açtığınızda içerik tamamlanmış sayılır.' : 'Opening the PDF marks this item complete.'}
                </p>
              </div>
            )}

            {(content.type === 'Text' || (content.textContent && !content.videoUrl && !content.quizDataJson)) && content.textContent && (
              <TextContentView textContent={content.textContent} onViewed={markItemComplete} locale={locale} />
            )}

          </div>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          {prevItem ? (
            <Link
              href={`/courses/${courseSlug}/item/${prevItem.id}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-stone-200 bg-white font-semibold text-stone-700 hover:bg-stone-50"
            >
              <ArrowLeft className="w-4 h-4" />
              {prevItem.title}
            </Link>
          ) : (
            <span />
          )}
          {nextItem ? (
            <Link
              href={`/courses/${courseSlug}/item/${nextItem.id}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700"
            >
              {nextItem.title}
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : progress && progress.totalItems > 0 && (progress.completedCount >= progress.totalItems || progress.hasCertificate) ? (
            <Link
              href={`/courses/${courseSlug}/certificate`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold"
            >
              <Award className="w-4 h-4" />
              {locale === 'tr' ? 'Sertifikayı göster' : 'View certificate'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href={`/courses/${courseSlug}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700"
            >
              {locale === 'tr' ? 'Müfredata dön' : 'Back to curriculum'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
