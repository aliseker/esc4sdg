'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Users, Shield, Layers, Building2, Globe, Share2 } from 'lucide-react';
import { adminDashboard } from '@/lib/adminApi';

type DashboardData = {
  message: string;
  courses: number;
  users: number;
  projects: number;
  partners: number;
  languages: number;
  socialLinks: number;
  timestamp: string
} | null;

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
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-stone-900 tracking-tight">Dashboard</h2>
          <p className="text-stone-500 font-medium mt-1">Sitenin genel durumuna hızlı bir bakış.</p>
        </div>
        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
          Son Güncelleme: {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : '-'}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Kurslar */}
        <div className="group rounded-[2rem] bg-white border border-stone-200 p-8 shadow-sm hover:shadow-xl hover:shadow-teal-500/5 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center group-hover:bg-teal-500 group-hover:scale-110 transition-all duration-300">
              <BookOpen className="w-7 h-7 text-teal-600 group-hover:text-white transition-colors" />
            </div>
            <span className="text-4xl font-black text-stone-900 tabular-nums">{data?.courses ?? 0}</span>
          </div>
          <h3 className="text-lg font-bold text-stone-800">Kurslar</h3>
          <p className="text-sm text-stone-500 mt-2 font-medium">Sistemdeki toplam eğitim içeriği sayısı.</p>
        </div>

        {/* Projeler */}
        <div className="group rounded-[2rem] bg-white border border-stone-200 p-8 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center group-hover:bg-orange-600 group-hover:scale-110 transition-all duration-300">
              <Layers className="w-7 h-7 text-orange-600 group-hover:text-white transition-colors" />
            </div>
            <span className="text-4xl font-black text-stone-900 tabular-nums">{data?.projects ?? 0}</span>
          </div>
          <h3 className="text-lg font-bold text-stone-800">Projeler</h3>
          <p className="text-sm text-stone-500 mt-2 font-medium">Yürütülen ve sergilenen proje sayısı.</p>
        </div>

        {/* Ortaklar */}
        <div className="group rounded-[2rem] bg-white border border-stone-200 p-8 shadow-sm hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-500 group-hover:scale-110 transition-all duration-300">
              <Building2 className="w-7 h-7 text-amber-600 group-hover:text-white transition-colors" />
            </div>
            <span className="text-4xl font-black text-stone-900 tabular-nums">{data?.partners ?? 0}</span>
          </div>
          <h3 className="text-lg font-bold text-stone-800">Ortaklar</h3>
          <p className="text-sm text-stone-500 mt-2 font-medium">İş birliği yapılan kurum ve kuruluşlar.</p>
        </div>

        {/* Kullanıcılar */}
        <div className="group rounded-[2rem] bg-white border border-stone-200 p-8 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-500 group-hover:scale-110 transition-all duration-300">
              <Users className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <span className="text-4xl font-black text-stone-900 tabular-nums">{data?.users ?? 0}</span>
          </div>
          <h3 className="text-lg font-bold text-stone-800">Kullanıcılar</h3>
          <p className="text-sm text-stone-500 mt-2 font-medium">Platforma kayıtlı toplam öğrenci sayısı.</p>
        </div>

        {/* Diller */}
        <div className="group rounded-[2rem] bg-white border border-stone-200 p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-500 group-hover:scale-110 transition-all duration-300">
              <Globe className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors" />
            </div>
            <span className="text-4xl font-black text-stone-900 tabular-nums">{data?.languages ?? 0}</span>
          </div>
          <h3 className="text-lg font-bold text-stone-800">Diller</h3>
          <p className="text-sm text-stone-500 mt-2 font-medium">Desteklenen ve içerik sunulan diller.</p>
        </div>

        {/* Sosyal Medya */}
        <div className="group rounded-[2rem] bg-white border border-stone-200 p-8 shadow-sm hover:shadow-xl hover:shadow-pink-500/5 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center group-hover:bg-pink-500 group-hover:scale-110 transition-all duration-300">
              <Share2 className="w-7 h-7 text-pink-600 group-hover:text-white transition-colors" />
            </div>
            <span className="text-4xl font-black text-stone-900 tabular-nums">{data?.socialLinks ?? 0}</span>
          </div>
          <h3 className="text-lg font-bold text-stone-800">Sosyal Medya</h3>
          <p className="text-sm text-stone-500 mt-2 font-medium">Tanımlı aktif sosyal medya bağlantıları.</p>
        </div>
      </div>

      <div className="rounded-3xl bg-emerald-50 border border-emerald-100 p-6 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-bold text-emerald-900">Sistem Durumu: Çevrimiçi</h4>
          <p className="text-sm text-emerald-700 font-medium">Backend API bağlantısı sağlıklı. Tüm modüller aktif.</p>
        </div>
      </div>
    </div>
  );
}
