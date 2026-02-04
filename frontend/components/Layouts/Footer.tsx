'use client';

import { Mail, Phone, MapPin } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { SocialLinks } from '@/components/UI/SocialLinks';
import type { SocialLinkItem } from '@/lib/publicApi';

type FooterProps = { socialLinks?: SocialLinkItem[] };

const Footer = ({ socialLinks = [] }: FooterProps) => {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { href: '/about', label: t('about') },
    { href: '/courses', label: t('courses') },
    { href: '/proje', label: t('projects') },
    { href: '/ortaklar', label: t('partners') },
  ];

  return (
    <footer className="relative bg-[#1a202c] text-stone-300 overflow-hidden">
      {/* Subtle gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Brand, Tagline & Sosyal Medya */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-teal-500/25">
                E4
              </div>
              <span className="text-xl font-black text-white tracking-tight">Escape4SDG</span>
            </Link>
            <p className="text-stone-400 text-sm leading-relaxed max-w-xs mb-6">
              {t('tagline')}
            </p>
            <SocialLinks variant="footer" initialLinks={socialLinks} />
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-5">
              {t('links')}
            </h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-stone-400 hover:text-teal-400 transition-colors text-sm font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* İletişim - Contact section */}
          <div className="lg:col-span-2">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-5">
              {t('contact')}
            </h3>
            <div className="space-y-5">
              <a
                href="https://maps.google.com/?q=Tahılpazarı+Mahallesi+477+sk.+Yerebakan+İş+Merkezi+Muratpaşa+Antalya"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 text-stone-300 hover:text-teal-400 transition-colors group"
              >
                <span className="shrink-0 w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/20 transition-colors">
                  <MapPin className="w-5 h-5" />
                </span>
                <span className="text-sm leading-relaxed pt-1">
                  {t('address')}
                  <br />
                  {t('city')}
                </span>
              </a>
              <a
                href="tel:+905054469007"
                className="flex items-center gap-4 text-stone-300 hover:text-teal-400 transition-colors group"
              >
                <span className="shrink-0 w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/20 transition-colors">
                  <Phone className="w-5 h-5" />
                </span>
                <span className="text-sm font-medium">{t('phone')}</span>
              </a>
              <a
                href={`mailto:${t('email')}`}
                className="flex items-center gap-4 text-stone-300 hover:text-teal-400 transition-colors group"
              >
                <span className="shrink-0 w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/20 transition-colors">
                  <Mail className="w-5 h-5" />
                </span>
                <span className="text-sm font-medium">{t('email')}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-stone-700/80">
          <p className="text-stone-500 text-sm text-center">
            {t('copyright', { year: currentYear })}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
