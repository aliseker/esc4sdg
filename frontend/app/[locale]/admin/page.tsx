'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Users, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { adminDashboard } from '@/lib/adminApi';

type DashboardData = { message: string; courses: number; users: number; timestamp: string } | null;

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminDashboard()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-red-800">
        <p className="font-medium">{error}</p>
        <p className="text-sm mt-1">Backend API çalışıyor mu? (örn. http://localhost:5137)</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-stone-900">Dashboard</h2>
        <p className="text-stone-600 mt-1">Backend API bağlantısı başarılı. Admin paneli buradan genişletilebilir.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-stone-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-teal-600" />
            </div>
            <span className="text-2xl font-bold text-stone-900">{data?.courses ?? 0}</span>
          </div>
          <h3 className="font-semibold text-stone-800">Kurslar</h3>
          <p className="text-sm text-stone-500 mt-1">Toplam kurs sayısı (API’den gelecek)</p>
        </div>
        <div className="rounded-2xl bg-white border border-stone-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-amber-700" />
            </div>
            <span className="text-2xl font-bold text-stone-900">{data?.users ?? 0}</span>
          </div>
          <h3 className="font-semibold text-stone-800">Kullanıcılar</h3>
          <p className="text-sm text-stone-500 mt-1">Kayıtlı kullanıcılar (API’den gelecek)</p>
        </div>
        <div className="rounded-2xl bg-white border border-stone-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Shield className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <h3 className="font-semibold text-stone-800">Admin</h3>
          <p className="text-sm text-stone-500 mt-1">JWT ile giriş yapıldı, backend hazır.</p>
        </div>
      </div>

      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6">
        <h3 className="font-semibold text-amber-900">Sonraki adımlar</h3>
        <ul className="mt-3 space-y-2 text-sm text-amber-800">
          <li>• Kurs / modül / ders CRUD API’leri (backend)</li>
          <li>• Kullanıcı listesi ve roller (backend)</li>
          <li>• Admin panelde kurs yönetimi sayfaları (frontend)</li>
        </ul>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-amber-700 hover:text-amber-800"
        >
          Siteye dön
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
