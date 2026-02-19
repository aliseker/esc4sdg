'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { resetPassword } from '@/lib/authApi';
import { useSearchParams } from 'next/navigation';

export function ResetPasswordClient() {
    const t = useTranslations('auth');
    const searchParams = useSearchParams();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const e = searchParams.get('email');
        const tok = searchParams.get('token');
        if (e) setEmail(e);
        if (tok) setToken(tok);
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError(t('passwordsDoNotMatch') || 'Passwords do not match.');
            return;
        }

        if (!token || !email) {
            setError('Invalid reset link. Missing token or email.');
            return;
        }

        setLoading(true);
        try {
            await resetPassword(email, token, newPassword);
            setMessage('Password has been reset successfully. Redirecting to login...');
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reset password.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6 sm:p-8 lg:p-12">
            <div className="w-full max-w-md">
                <div className="mb-8">
                    <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700">
                        <ArrowLeft className="w-4 h-4" /> Back to Login
                    </Link>
                </div>
                <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm p-8 sm:p-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-11 h-11 rounded-xl bg-teal-100 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Reset Password</h1>
                            <p className="text-sm text-stone-500 mt-0.5">Enter your new password.</p>
                        </div>
                    </div>

                    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
                                {error}
                            </div>
                        )}
                        {message && (
                            <div className="p-3 rounded-xl bg-green-50 border border-green-100 text-sm text-green-700">
                                {message}
                            </div>
                        )}

                        {/* Hidden inputs to keep state logic working if needed, though state is enough */}

                        <div>
                            <label htmlFor="new-password" className="block text-sm font-medium text-stone-700 mb-1.5">
                                New Password
                            </label>
                            <input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 text-stone-900 bg-stone-50/80 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors placeholder:text-stone-400"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-stone-700 mb-1.5">
                                Confirm New Password
                            </label>
                            <input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 text-stone-900 bg-stone-50/80 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors placeholder:text-stone-400"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
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
                                    Reset Password
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
