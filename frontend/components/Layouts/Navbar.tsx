'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu, X, Globe, LogIn, UserPlus, ChevronDown, Gamepad2, User, LogOut, Award, BookOpen } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { getUserToken, getUserInfo, clearUserToken, AUTH_CHANGE_EVENT } from '@/lib/authApi';

import { getLanguages, type LanguageItem } from '@/lib/publicApi';

const DEFAULT_LOCALES = [
  { code: 'tr', name: 'Türkçe', short: 'TR' },
  { code: 'en', name: 'English', short: 'EN' },
];

function getLocalizedPath(pathname: string, locale: string): string {
  const path = pathname || '/';
  const segment = path === '/' ? '' : path;
  return locale === 'tr' ? `/tr${segment}` : `/${locale}${segment}`;
}

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [locales, setLocales] = useState(DEFAULT_LOCALES);
  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const locale = useLocale() as string;
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    getLanguages().then((list) => {
      if (list && list.length > 0) {
        setLocales(list.map(l => ({
          code: l.code,
          name: l.name,
          short: l.code.toUpperCase()
        })));
      }
    });
  }, []);

  useEffect(() => {
    setIsLoggedIn(!!getUserToken());
    const onAuthChange = () => setIsLoggedIn(!!getUserToken());
    window.addEventListener(AUTH_CHANGE_EVENT, onAuthChange);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, onAuthChange);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const handleLogout = () => {
    clearUserToken();
    window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
    setProfileOpen(false);
    setMenuOpen(false);
    router.push('/');
  };

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/about', label: t('about') },
    { href: '/courses', label: t('courses') },
    { href: '/proje', label: t('projects') },
    { href: '/ortaklar', label: t('partners') },
  ];

  const currentLang = locales.find((l) => l.code === locale) || locales[0];

  const handleLocaleChange = (newLocale: string) => {
    if (newLocale === locale) return;
    const url = getLocalizedPath(pathname || '/', newLocale);
    window.location.href = url;
  };

  // Admin panelinde kullanıcı navbar'ı (Giriş Yap, Kayıt Ol) gösterme; admin kendi header/sidebar'ına sahip
  const isAdmin = typeof pathname === 'string' && pathname.includes('/admin');
  if (isAdmin) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-stone-200/50 border-b border-stone-200/60'
        : 'bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-amber-50/90 border-b border-amber-200/50'
        }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16 lg:h-[4.25rem]">
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/30 group-hover:scale-105 transition-all duration-300">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo.jpeg"
                alt="Escape4SDG Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-extrabold text-xl tracking-tight hidden sm:inline text-stone-800 group-hover:text-teal-600 transition-colors duration-200">
              Escape4SDG
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2.5 text-sm font-semibold text-stone-600 hover:text-orange-600 rounded-xl hover:bg-orange-50/80 active:scale-[0.98] transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative" ref={langRef}>
              <button
                type="button"
                onClick={() => setLangOpen((o) => !o)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-semibold text-stone-600 hover:text-stone-900 rounded-xl border-2 border-stone-200/80 hover:border-amber-200 bg-white/80 hover:bg-amber-50/60 transition-all active:scale-[0.98]"
                aria-expanded={langOpen}
                aria-haspopup="true"
              >
                <Globe className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">{currentLang?.name ?? t('language')}</span>
                <span className="sm:hidden">{currentLang?.short ?? 'TR'}</span>
                <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 py-1.5 bg-white rounded-2xl shadow-xl shadow-stone-300/40 border-2 border-stone-100 ring-4 ring-amber-500/10">
                  {locales.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLocaleChange(lang.code)}
                      className={`w-full text-left px-4 py-2.5 text-sm font-semibold rounded-xl mx-1 transition-colors ${locale === lang.code
                        ? 'bg-amber-100 text-amber-800'
                        : 'text-stone-600 hover:bg-amber-50 hover:text-amber-800'
                        }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isLoggedIn ? (
              <div className="hidden sm:block relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold text-stone-700 hover:text-orange-600 rounded-xl border-2 border-stone-200 hover:border-amber-200 hover:bg-amber-50/80 bg-white/80 transition-all active:scale-[0.98]"
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-teal-600" />
                  </div>
                  <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>
                {profileOpen && (() => {
                  const userInfo = getUserInfo();
                  return (
                    <div className="absolute right-0 top-full mt-2 w-64 py-0 bg-white rounded-2xl shadow-xl shadow-stone-300/40 border-2 border-stone-100 ring-4 ring-amber-500/10 overflow-hidden">
                      <div className="px-4 py-3 bg-stone-50/80 border-b border-stone-100">
                        <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">{t('profile')}</p>
                        <div className="space-y-1.5 text-sm text-stone-700">
                          {userInfo?.displayName && (
                            <p className="font-semibold text-stone-900 truncate" title={userInfo.displayName}>
                              {userInfo.displayName}
                            </p>
                          )}
                          {userInfo?.email && (
                            <p className="truncate" title={userInfo.email}>
                              {userInfo.email}
                            </p>
                          )}
                          {userInfo?.username && (
                            <p className="text-stone-600 truncate" title={userInfo.username}>
                              @{userInfo.username}
                            </p>
                          )}
                          {!userInfo?.email && !userInfo?.username && !userInfo?.displayName && (
                            <p className="text-stone-500 italic">{t('profileNoInfo')}</p>
                          )}
                        </div>
                      </div>
                      <div className="py-1.5">
                        <Link
                          href="/my-courses"
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-50 rounded-xl mx-1 transition-colors text-left"
                          onClick={() => setProfileOpen(false)}
                        >
                          <BookOpen className="w-4 h-4" />
                          {t('myCourses')}
                        </Link>
                        <Link
                          href="/certificates"
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-50 rounded-xl mx-1 transition-colors text-left"
                          onClick={() => setProfileOpen(false)}
                        >
                          <Award className="w-4 h-4" />
                          {t('myCertificates')}
                        </Link>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-stone-600 hover:bg-red-50 hover:text-red-700 rounded-xl mx-1 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          {t('logout')}
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:text-orange-600 rounded-xl border-2 border-stone-200 hover:border-amber-200 hover:bg-amber-50/80 bg-white/80 transition-all active:scale-[0.98]"
                >
                  <LogIn className="w-4 h-4" />
                  {t('login')}
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 shadow-lg shadow-orange-400/30 hover:shadow-orange-400/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  <UserPlus className="w-4 h-4" />
                  {t('register')}
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="lg:hidden p-3 rounded-xl text-stone-600 hover:bg-amber-50 hover:text-orange-600 border-2 border-transparent hover:border-amber-200 transition-colors active:scale-95"
              aria-label="Menü"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobil menü */}
      {menuOpen && (
        <div className="lg:hidden border-t border-amber-200/60 bg-gradient-to-b from-amber-50/80 to-white">
          <div className="max-w-6xl mx-auto px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3.5 text-sm font-semibold text-stone-700 hover:bg-amber-100/80 hover:text-orange-700 rounded-xl transition-colors active:scale-[0.99]"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-amber-200/60 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">{t('language')}</span>
                <div className="flex gap-2">
                  {locales.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLocaleChange(lang.code)}
                      className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all ${locale === lang.code
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                        : 'bg-stone-100 text-stone-600 hover:bg-amber-100 hover:text-amber-800'
                        }`}
                    >
                      {lang.short}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                {isLoggedIn ? (
                  <button
                    type="button"
                    onClick={() => { handleLogout(); setMenuOpen(false); }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold text-stone-700 border-2 border-stone-200 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('logout')}
                  </button>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold text-stone-700 border-2 border-stone-200 rounded-xl hover:bg-amber-50 hover:border-amber-200 transition-colors"
                    >
                      <LogIn className="w-4 h-4" />
                      {t('login')}
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMenuOpen(false)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-400/30 hover:-translate-y-0.5 transition-all"
                    >
                      <UserPlus className="w-4 h-4" />
                      {t('register')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
