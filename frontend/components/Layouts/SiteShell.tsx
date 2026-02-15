'use client';

import { usePathname } from '@/i18n/navigation';
import Navbar from '@/components/Layouts/Navbar';
import Footer from '@/components/Layouts/Footer';
import type { SocialLinkItem } from '@/lib/publicApi';

type SiteShellProps = {
  children: React.ReactNode;
  socialLinks: SocialLinkItem[];
};

export default function SiteShell({ children, socialLinks }: SiteShellProps) {
  const pathname = usePathname() ?? '';
  const isAdmin = pathname.includes('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer socialLinks={socialLinks} />
    </>
  );
}
