'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { forgotPassword } from '@/lib/authApi';

export function ForgotPasswordClient() {
    const t = useTranslations('auth'); // Ensure 'auth' namespace has 'forgotPasswordTitle' etc. or add fallbacks
    const nav = useTranslations('nav');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            await forgotPassword(email);
            setMessage('Password reset link has been sent to your email.');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send reset link.');
        } finally {
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
                            <Mail className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Forgot Password</h1>
                            <p className="text-sm text-stone-500 mt-0.5">Enter your email to receive a reset link.</p>
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
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1.5">
                                Email
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 text-stone-900 bg-stone-50/80 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors placeholder:text-stone-400"
                                    placeholder="ornek@email.com"
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
                                    Send Reset Link
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
