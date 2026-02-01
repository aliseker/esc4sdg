'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { UserPlus, Mail, Lock, User, ArrowRight, AtSign, GraduationCap } from 'lucide-react';
import { API_BASE, registerUser, setUserToken, setUserInfo } from '@/lib/authApi';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const nav = useTranslations('nav');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState<string>('');
  const [school, setSchool] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser({
        email,
        username,
        password,
        displayName,
        gender: gender || undefined,
        age: age ? parseInt(age, 10) : undefined,
        school: school || undefined,
      });
      setUserToken(data.token);
      setUserInfo({
        email: data.email ?? undefined,
        username: data.username ?? undefined,
        displayName: displayName || undefined,
      });
      router.push('/courses');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Register failed';
      const isNetwork = msg === 'Failed to fetch' || msg.toLowerCase().includes('fetch');
      setError(isNetwork ? `${t('connectionError')} (${API_BASE})` : msg);
    } finally {
      setLoading(false);
    }
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
            Sürdürülebilir kalkınma hedefleriyle öğrenin.
          </h2>
          <p className="mt-4 text-teal-100 text-base max-w-sm">
            Ücretsiz hesap oluşturun, kurslara kaydolun ve sertifikalarınızı tamamlayın.
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
                <UserPlus className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-stone-900 tracking-tight">{t('registerTitle')}</h1>
                <p className="text-sm text-stone-500 mt-0.5">{t('registerSubtitle')}</p>
              </div>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="reg-displayName" className="block text-sm font-medium text-stone-700 mb-1.5">
                  {t('displayName')}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
                  <input
                    id="reg-displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-stone-900 bg-stone-50/80 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors placeholder:text-stone-400"
                    placeholder={t('displayNamePlaceholder')}
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="reg-username" className="block text-sm font-medium text-stone-700 mb-1.5">
                  {t('username')}
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
                  <input
                    id="reg-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-stone-900 bg-stone-50/80 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors placeholder:text-stone-400"
                    placeholder={t('usernamePlaceholder')}
                    minLength={4}
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-stone-700 mb-1.5">
                  {t('email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
                  <input
                    id="reg-email"
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
                <label htmlFor="reg-gender" className="block text-sm font-medium text-stone-700 mb-1.5">
                  {t('gender')}
                </label>
                <select
                  id="reg-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 text-stone-900 bg-stone-50/80 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors"
                >
                  <option value="">{t('genderPlaceholder')}</option>
                  <option value="Male">{t('genderMale')}</option>
                  <option value="Female">{t('genderFemale')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="reg-age" className="block text-sm font-medium text-stone-700 mb-1.5">
                  {t('age')}
                </label>
                <input
                  id="reg-age"
                  type="number"
                  min={1}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-3 text-stone-900 bg-stone-50/80 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors placeholder:text-stone-400"
                  placeholder={t('agePlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="reg-school" className="block text-sm font-medium text-stone-700 mb-1.5">
                  {t('school')}
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
                  <input
                    id="reg-school"
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-stone-900 bg-stone-50/80 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors placeholder:text-stone-400"
                    placeholder={t('schoolPlaceholder')}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium text-stone-700 mb-1.5">
                  {t('password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
                  <input
                    id="reg-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-stone-900 bg-stone-50/80 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors placeholder:text-stone-400"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="reg-confirm" className="block text-sm font-medium text-stone-700 mb-1.5">
                  {t('confirmPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
                  <input
                    id="reg-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    {t('registerButton')}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 pt-6 border-t border-stone-100 text-center text-sm text-stone-600">
              {t('haveAccount')}{' '}
              <Link href="/login" className="font-semibold text-teal-600 hover:text-teal-700 hover:underline">
                {nav('login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
