'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Shield, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { adminLogin, setStoredToken, API_BASE } from '@/lib/adminApi';

export default function AdminLoginPage() {
  const t = useTranslations('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await adminLogin(email, password);
      setStoredToken(data.token);
      router.push('/admin');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      const isNetwork = msg === 'Failed to fetch' || msg.toLowerCase().includes('fetch');
      setError(isNetwork ? `${t('connectionError')} (${API_BASE})` : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-stone-50 pt-14 lg:pt-16">
      {/* Sol panel – admin branding */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[42%] flex-col justify-between bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 p-12 xl:p-16">
        <Link href="/" className="flex items-center gap-2.5 text-white/90 hover:text-white transition-colors">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center font-bold text-sm">
            E4
          </div>
          <span className="font-bold text-lg tracking-tight">Escape4SDG</span>
        </Link>
        <div>
          <div className="flex items-center gap-2 text-white/90 mb-4">
            <Shield className="w-8 h-8" />
            <span className="font-bold text-lg">{t('panelTitle')}</span>
          </div>
          <h2 className="text-2xl xl:text-3xl font-bold text-white tracking-tight leading-tight">
            {t('panelSubtitle')}
          </h2>
          <p className="mt-4 text-amber-100 text-base max-w-sm">
            {t('panelDescription')}
          </p>
        </div>
        <p className="text-sm text-white/60">© Escape4SDG Admin</p>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-700">
              ← {t('backToSite')}
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 shadow-lg p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-stone-900 tracking-tight">{t('loginTitle')}</h1>
                <p className="text-sm text-stone-500 mt-0.5">{t('loginSubtitle')}</p>
              </div>
            </div>

            {error && (
              <div className="mt-6 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="admin-email" className="block text-sm font-medium text-stone-700 mb-1.5">
                  {t('email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-stone-900 bg-stone-50/80 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-colors placeholder:text-stone-400"
                    placeholder="admin@esc4sdg.local"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="admin-password" className="block text-sm font-medium text-stone-700 mb-1.5">
                  {t('password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
                  <input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-stone-900 bg-stone-50/80 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-colors placeholder:text-stone-400"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-60 transition-colors shadow-lg shadow-amber-500/20"
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
              {t('hint')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
