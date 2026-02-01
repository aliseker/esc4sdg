'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import Link from 'next/link';
import { Shield, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { getStoredToken, clearStoredToken, adminMe } from '@/lib/adminApi';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoginPage = pathname?.includes('/admin/login');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoginPage) return;
    const token = getStoredToken();
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    adminMe()
      .then(setUser)
      .catch(() => {
        clearStoredToken();
        router.replace('/admin/login');
      });
  }, [mounted, isLoginPage, router]);

  const handleLogout = () => {
    clearStoredToken();
    router.replace('/admin/login');
  };

  if (isLoginPage) return <>{children}</>;

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-stone-200 flex flex-col transform transition-transform lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 text-stone-800 font-bold">
            <Shield className="w-6 h-6 text-amber-600" />
            Admin
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1 flex-1">
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              pathname === '/admin' || pathname?.endsWith('/admin')
                ? 'bg-amber-100 text-amber-900'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
        </nav>
        <div className="p-4 border-t border-stone-100">
          <p className="text-xs text-stone-500 truncate px-2 mb-2">{user.email}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-stone-600 hover:bg-red-50 hover:text-red-700 font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Çıkış
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-stone-200 px-4 lg:px-8 py-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-stone-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-stone-800">Admin Panel</h1>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}
    </div>
  );
}
