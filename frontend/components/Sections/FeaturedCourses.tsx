'use client';

import Image from 'next/image';
import { Clock, Star, ArrowRight, BookOpen, Sparkles, PlayCircle } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { courses as allCourses } from '@/lib/mockCourses';
import AnimateInView from '@/components/UI/AnimateInView';
import studyCover from '@/images/study.jpg';

/** Featured Hero Card - spans 2 cols, bold gradient, horizontal layout */
const FeaturedCourseCard = ({
  course,
  locale,
  delay = 0,
}: {
  course: (typeof allCourses)[number];
  locale: 'tr' | 'en';
  delay?: number;
}) => (
  <AnimateInView animation="fade-up" delay={delay} className="sm:col-span-2">
    <Link href={`/courses/${course.slug}`} className="block h-full">
      <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 p-0 min-h-[280px] flex flex-col sm:flex-row shadow-2xl shadow-teal-500/30 hover:shadow-teal-500/40 hover:-translate-y-1 transition-all duration-500">
        {/* Left: Image + overlay */}
        <div className="relative w-full sm:w-2/5 h-48 sm:h-auto min-h-[200px] flex-shrink-0">
          <Image src={studyCover} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 640px) 100vw, 40vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/90 via-teal-600/50 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_0%_50%,rgba(255,255,255,0.15),transparent)]" />
          {/* Decorative circles */}
          <div className="absolute top-6 right-6 w-20 h-20 rounded-full border-2 border-white/20" />
          <div className="absolute top-12 right-12 w-12 h-12 rounded-full border-2 border-white/15" />
          <div className="absolute bottom-6 left-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
            <PlayCircle className="w-5 h-5 text-white" />
            <span className="text-sm font-bold text-white">{locale === 'tr' ? 'Başla' : 'Start'}</span>
          </div>
        </div>
        {/* Right: Content */}
        <div className="flex-1 p-8 sm:p-10 flex flex-col justify-center relative">
          <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-amber-400/90 text-stone-900 text-xs font-bold">
            {course.level}
          </div>
          <span className="inline-flex items-center gap-1.5 text-teal-200 text-sm font-bold mb-3">
            <Sparkles className="w-4 h-4" />
            {locale === 'tr' ? 'Öne Çıkan' : 'Featured'}
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight group-hover:text-amber-100 transition-colors">
            {course.title[locale]}
          </h3>
          <p className="text-teal-100/90 text-sm mb-6 line-clamp-2">{course.summary[locale]}</p>
          <div className="flex items-center gap-4 mb-6">
            <span className="flex items-center gap-2 text-white/80 text-sm">
              <Clock className="w-4 h-4" />
              {course.duration}
            </span>
            <span className="flex items-center gap-1.5 text-amber-300">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-bold">4.8</span>
            </span>
          </div>
          <span className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-teal-700 font-bold text-sm w-fit group-hover:bg-amber-100 group-hover:text-teal-800 transition-colors shadow-lg">
            {locale === 'tr' ? 'Kursa Git' : 'Go to course'}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  </AnimateInView>
);

/** Bold card - full bleed image, diagonal accent */
const BoldCourseCard = ({ course, locale, delay = 0, themeIndex = 0, className = '' }: {
  course: (typeof allCourses)[number]; locale: 'tr' | 'en'; delay?: number; themeIndex?: number; className?: string;
}) => {
  const overlays = [
    'from-teal-900/70 via-teal-800/50 to-transparent',
    'from-orange-900/70 via-amber-800/50 to-transparent',
    'from-violet-900/70 via-purple-800/50 to-transparent',
  ];
  const btns = [
    'bg-teal-500 hover:bg-teal-600 text-white',
    'bg-orange-500 hover:bg-orange-600 text-white',
    'bg-violet-500 hover:bg-violet-600 text-white',
  ];
  const i = themeIndex % 3;
  return (
    <AnimateInView animation="fade-up" delay={delay} className={`h-full ${className}`}>
      <Link href={`/courses/${course.slug}`} className="block h-full">
        <div className="group relative h-full rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 min-h-[240px]">
          <div className="absolute inset-0">
            <Image src={studyCover} alt="" fill className="object-cover group-hover:scale-110 transition-transform duration-700" sizes="(max-width: 1024px) 50vw, 33vw" />
            <div className={`absolute inset-0 bg-gradient-to-t ${overlays[i]}`} />
          </div>
          {/* Diagonal accent bar */}
          <div className="absolute top-0 right-0 w-32 h-32 -translate-y-1/2 translate-x-1/2 rotate-45 bg-white/10" />
          <div className="relative p-6 h-full flex flex-col justify-end">
            <div className="absolute top-4 right-4 flex items-center gap-1.5 text-amber-400">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-bold">4.8</span>
            </div>
            <span className="absolute top-4 left-4 px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-white text-xs font-bold">
              {course.level}
            </span>
            <h3 className="text-xl font-bold text-white mb-1 leading-tight drop-shadow-lg">
              {course.title[locale]}
            </h3>
            <p className="text-white/80 text-sm mb-4">{course.duration}</p>
            <span className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm w-fit ${btns[i]} transition-colors shadow-lg`}>
              {locale === 'tr' ? 'İncele' : 'Explore'}
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    </AnimateInView>
  );
};

const FeaturedCourses = () => {
  const locale = useLocale() as 'tr' | 'en';
  const t = useTranslations('nav');
  const featuredCourses = allCourses.slice(0, 5);
  const [featured, ...rest] = featuredCourses;

  return (
    <section className="relative pt-12 lg:pt-16 pb-24 lg:pb-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/40 via-white to-teal-50/30" />
      <div className="absolute inset-0 bg-dots opacity-30" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-200/15 rounded-full blur-3xl -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-200/15 rounded-full blur-3xl translate-x-1/2" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateInView animation="fade-up" className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-teal-700 text-sm font-bold mb-6">
            <BookOpen className="w-4 h-4" />
            {locale === 'tr' ? 'Popüler Kurslar' : 'Popular courses'}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 mb-4 tracking-tight">
            {locale === 'tr' ? (
              <>Öne çıkan <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">kurslar</span></>
            ) : (
              <>Featured <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">courses</span></>
            )}
          </h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto font-medium">
            {locale === 'tr'
              ? 'Ekip ruhu ve SDG odaklı MOOC içerikleri.'
              : 'Team spirit and SDG-focused MOOC content.'}
          </p>
        </AnimateInView>

        {/* Grid: 1 hero (2 cols) + 4 photo cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          <FeaturedCourseCard course={featured} locale={locale} delay={0} />
          <BoldCourseCard course={rest[0]} locale={locale} delay={100} themeIndex={0} />
          <BoldCourseCard course={rest[1]} locale={locale} delay={150} themeIndex={1} />
          <BoldCourseCard course={rest[2]} locale={locale} delay={200} themeIndex={2} />
          <BoldCourseCard course={rest[3]} locale={locale} delay={250} themeIndex={0} />
        </div>

        <AnimateInView animation="fade-up" delay={350} className="text-center">
          <Link
            href="/courses"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 text-white rounded-2xl font-bold hover:from-teal-700 hover:via-emerald-700 hover:to-teal-700 transition-all shadow-xl shadow-teal-500/30 hover:shadow-teal-500/40 hover:-translate-y-0.5"
          >
            {t('courses')}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </AnimateInView>
      </div>
    </section>
  );
};

export default FeaturedCourses;
