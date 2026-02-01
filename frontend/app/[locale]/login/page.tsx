'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations('auth');
  const nav = useTranslations('nav');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Demo: Backend/JWT bağlandığında buraya taşınacak
    }, 600);
  };

  return (
    <div className="min-h-screen flex bg-stone-50 pt-14 lg:pt-16">
      {/* Sol panel – sadece lg+ */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[42%] flex-col justify-between bg-gradient-to-br from-teal-600 to-teal-700 p-12 xl:p-16">
        <Link href="/" className="flex items-center gap-2.5 text-white/90 hover:text-white transition-colors">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center font-bold text-sm">
            E4
          </div>
          <span className="font-bold text-lg tracking-tight">Escape4SDG</span>
        </Link>
        <div>
          <h2 className="text-2xl xl:text-3xl font-bold text-white tracking-tight leading-tight">
            MOOC&apos;larla SDG hedeflerine adım adım.
          </h2>
          <p className="mt-4 text-teal-100 text-base max-w-sm">
            Giriş yaparak kurslarınıza devam edin, ilerlemenizi takip edin ve sertifikalarınızı alın.
          </p>
        </div>
        <p className="text-sm text-white/60">
          © Escape4SDG
        </p>
      </div>

      {/* Form alanı */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700">
              ← {nav('home')}
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-xl bg-teal-100 flex items-center justify-center">
                <LogIn className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-stone-900 tracking-tight">{t('loginTitle')}</h1>
                <p className="text-sm text-stone-500 mt-0.5">{t('loginSubtitle')}</p>
              </div>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-stone-700 mb-1.5">
                  {t('email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-stone-900 bg-stone-50/80 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors placeholder:text-stone-400"
                    placeholder="ornek@email.com"
                    required
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password" className="block text-sm font-medium text-stone-700">
                    {t('password')}
                  </label>
                  <button
                    type="button"
                    className="text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline"
                  >
                    {t('forgotPassword')}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-stone-900 bg-stone-50/80 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors placeholder:text-stone-400"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-60 transition-colors"
              >
                {loading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {t('loginButton')}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 pt-6 border-t border-stone-100 text-center text-sm text-stone-600">
              {t('newUser')}{' '}
              <Link href="/register" className="font-semibold text-teal-600 hover:text-teal-700 hover:underline">
                {nav('register')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
