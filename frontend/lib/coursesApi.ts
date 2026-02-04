/**
 * Public courses API – list, detail, enroll, progress, certificates.
 * Uses same backend as authApi.
 */
import { API_BASE } from './authApi';

export type CourseListItem = {
  id: number;
  slug: string;
  title: string | null;
  summary: string | null;
  category: string | null;
  level: string | null;
  durationMinutes: number;
  instructorName: string | null;
  imageUrl: string | null;
  hasCertificate: boolean;
  lessonCount: number;
};

export type CourseModule = {
  id: number;
  title: string;
  description: string | null;
  itemCount: number;
  items: {
    id: number;
    title: string;
    type: string;
    questionCount: number | null;
  }[];
};

export type CourseDetail = {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  category: string | null;
  level: string | null;
  durationMinutes: number;
  instructorName: string | null;
  imageUrl: string | null;
  hasCertificate: boolean;
  sectionCount: number;
  lessonCount: number;
  modules: CourseModule[];
};

export type MyCourseItem = {
  courseId: number;
  courseSlug: string;
  courseTitle: string;
  enrolledAt: string;
  completedAt: string | null;
  completedCount: number;
  totalItems: number;
  completed: boolean;
  hasCertificate: boolean;
  quizScores: { itemId: number; scorePercent: number | null }[];
};

export async function getMyCourses(token: string, lang?: string): Promise<MyCourseItem[]> {
  const q = lang ? `?lang=${encodeURIComponent(lang)}` : '';
  const res = await fetch(`${API_BASE}/api/courses/my-courses${q}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getCoursesList(lang: string): Promise<CourseListItem[]> {
  const res = await fetch(`${API_BASE}/api/courses?lang=${encodeURIComponent(lang)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function getCourseBySlug(slug: string, lang: string): Promise<CourseDetail | null> {
  const res = await fetch(
    `${API_BASE}/api/courses/by-slug/${encodeURIComponent(slug)}?lang=${encodeURIComponent(lang)}`
  );
  if (!res.ok) return null;
  return res.json();
}

export async function enrollCourse(courseId: number, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/courses/${courseId}/enroll`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Enroll failed');
}

export async function getCourseProgress(courseId: number, token: string): Promise<{
  enrolled: boolean;
  completedAt: string | null;
  completedItemIds: number[];
  completedCount: number;
  totalItems: number;
  hasCertificate: boolean;
  completed: boolean;
}> {
  const res = await fetch(`${API_BASE}/api/courses/${courseId}/progress`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load progress');
  return res.json();
}

export async function completeModuleItem(
  itemId: number,
  token: string,
  scorePercent?: number
): Promise<{ completed: boolean; completedCount: number; totalItems: number }> {
  const res = await fetch(`${API_BASE}/api/courses/items/${itemId}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ scorePercent }),
  });
  if (!res.ok) throw new Error('Failed to complete');
  return res.json();
}

export async function getModuleItemContent(
  courseId: number,
  itemId: number,
  token: string,
  lang?: string
): Promise<{
  id: number;
  title: string;
  type: string;
  videoUrl?: string;
  mustWatch?: boolean;
  videoDurationSeconds?: number;
  filePath?: string;
  textContent?: string;
  quizDataJson?: string;
  passScorePercent?: number;
}> {
  const q = lang ? `?lang=${encodeURIComponent(lang)}` : '';
  const res = await fetch(`${API_BASE}/api/courses/${courseId}/items/${itemId}${q}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load content');
  return res.json();
}

export type CertificateItem = {
  id: number;
  courseId: number;
  courseSlug: string;
  courseTitle: string | null;
  issuedAt: string;
};

export async function getMyCertificates(token: string, lang?: string): Promise<CertificateItem[]> {
  const q = lang ? `?lang=${encodeURIComponent(lang)}` : '';
  const res = await fetch(`${API_BASE}/api/certificates${q}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getCertificate(
  id: number,
  token: string,
  lang?: string
): Promise<{
  id: number;
  courseId: number;
  courseSlug: string;
  courseTitle: string;
  userName: string;
  issuedAt: string;
}> {
  const q = lang ? `?lang=${encodeURIComponent(lang)}` : '';
  const res = await fetch(`${API_BASE}/api/certificates/${id}${q}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Certificate not found');
  return res.json();
}
