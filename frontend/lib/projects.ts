import { API_BASE } from './authApi';

export interface ProjectItem {
  id: number;
  slug: string;
  coverImageUrl: string | null;
  sortOrder: number;
  createdAt: string;
  title: string;
  subtitle: string;
  bodyHtml?: string;
  galleryImages: {
    id: number;
    imageUrl: string;
    sortOrder: number;
    caption: string | null;
  }[];
}

export async function getProjectsList(lang: string): Promise<ProjectItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/projects?lang=${encodeURIComponent(lang)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return [];
  }
}

export async function getProjectBySlug(slug: string, lang: string): Promise<ProjectItem | null> {
  try {
    const res = await fetch(`${API_BASE}/api/projects/by-slug/${encodeURIComponent(slug)}?lang=${encodeURIComponent(lang)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Failed to fetch project:', error);
    return null;
  }
}
