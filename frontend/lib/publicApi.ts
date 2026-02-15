import { API_BASE } from './authApi';

export type SocialLinkItem = {
  id: number;
  platform: string;
  label: string | null;
  url: string;
  sortOrder: number;
};

export async function getSocialLinks(): Promise<SocialLinkItem[]> {
  const res = await fetch(`${API_BASE}/api/social-links`, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' },
  });
  if (!res.ok) return [];
  return res.json();
}

export type PartnerItem = {
  id: number;
  name: string;
  country: string;
  website: string | null;
  logoUrl: string | null;
  logoPosition?: string | null;
  description: string | null;
};

export async function getPartners(lang?: string): Promise<PartnerItem[]> {
  const q = lang ? `?lang=${encodeURIComponent(lang)}` : '';
  const res = await fetch(`${API_BASE}/api/partners${q}`, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' },
  });
  if (!res.ok) return [];
  return res.json();
}

export type LanguageItem = { id: number; code: string; name: string; sortOrder: number };

export async function getLanguages(): Promise<LanguageItem[]> {
  const res = await fetch(`${API_BASE}/api/languages`, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' },
  });
  if (!res.ok) return [];
  return res.json();
}
