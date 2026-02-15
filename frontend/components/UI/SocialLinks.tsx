'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Youtube,
  Linkedin,
  Instagram,
  Facebook,
  Twitter,
  ExternalLink,
} from 'lucide-react';
import { getSocialLinks, type SocialLinkItem } from '@/lib/publicApi';

type Variant = 'footer' | 'about';

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  youtube: Youtube,
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  x: Twitter,
};

function getIcon(platform: string) {
  const key = platform.toLowerCase().trim();
  return PLATFORM_ICONS[key] ?? ExternalLink;
}

type Props = { variant?: Variant; initialLinks?: SocialLinkItem[] | null };

export function SocialLinks({ variant = 'footer', initialLinks }: Props) {
  const t = useTranslations('footer');
  const [links, setLinks] = useState<SocialLinkItem[]>(initialLinks ?? []);

  useEffect(() => {
    if (initialLinks === undefined) {
      getSocialLinks().then(setLinks);
    } else {
      setLinks(initialLinks ?? []);
    }
  }, [initialLinks]);

  if (links.length === 0) return null;

  if (variant === 'footer') {
    return (
      <div>
        <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-5">
          {t('social')}
        </h3>
        <div className="flex flex-wrap gap-3">
          {links.map((link) => {
            const Icon = getIcon(link.platform);
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-xl bg-stone-700/80 hover:bg-teal-500/90 flex items-center justify-center text-stone-300 hover:text-white transition-all duration-200 hover:scale-105"
                title={link.label || link.platform}
                aria-label={link.label || link.platform}
              >
                <Icon className="w-5 h-5" />
              </a>
            );
          })}
        </div>
      </div>
    );
  }

  // variant === 'about'
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {links.map((link) => {
        const Icon = getIcon(link.platform);
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/95 hover:bg-white border border-stone-200 shadow-lg shadow-stone-200/50 hover:shadow-xl hover:shadow-teal-500/20 hover:border-teal-200 transition-all duration-200 hover:-translate-y-0.5"
            title={link.label || link.platform}
            aria-label={link.label || link.platform}
          >
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white">
              <Icon className="w-5 h-5" />
            </span>
            <span className="font-semibold text-stone-800">
              {link.label || link.platform}
            </span>
          </a>
        );
      })}
    </div>
  );
}
