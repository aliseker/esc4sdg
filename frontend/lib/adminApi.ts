/**
 * Admin panel – backend API (backend klasöründeki ESC4SDG.Api) ile iletişim.
 * Backend varsayılan: http://localhost:5071
 */

export const API_BASE = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071')
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';

const TOKEN_KEY = 'esc4sdg_admin_token';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

export type LoginResponse = {
  token: string;
  email: string;
  role: string;
  expiresAt: string;
};

export async function adminLogin(usernameOrEmail: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernameOrEmail, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || 'Login failed');
  }
  return res.json();
}

export async function adminMe(): Promise<{ email: string; role: string }> {
  const token = getStoredToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${API_BASE}/api/admin/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

export async function adminDashboard(): Promise<{ message: string; courses: number; users: number; timestamp: string }> {
  const token = getStoredToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${API_BASE}/api/admin/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

function authHeaders(): HeadersInit {
  const token = getStoredToken();
  if (!token) throw new Error('Not authenticated');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

// ——— Partners ———
export type Partner = {
  id: number;
  name: string;
  country: string;
  countryCode?: string;
  type?: string;
  website?: string;
  logoUrl?: string | null;
  role?: string;
  sortOrder: number;
  createdAt: string;
  translations: { languageId: number; description?: string }[];
};

export async function adminPartnersGetAll(): Promise<Partner[]> {
  const res = await fetch(`${API_BASE}/api/admin/partners`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load partners');
  return res.json();
}

export async function adminPartnerCreate(body: Partial<Partner> & { name: string; country: string }): Promise<{ id: number }> {
  const res = await fetch(`${API_BASE}/api/admin/partners`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})) as { message?: string }).message || 'Failed');
  return res.json();
}

export async function adminPartnerUpdate(id: number, body: Partial<Partner>): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/partners/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) });
  if (!res.ok) throw new Error('Failed to update');
}

export async function adminPartnerDelete(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/partners/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to delete');
}

export async function adminUploadPartnerLogo(file: File): Promise<{ url: string }> {
  const token = getStoredToken();
  if (!token) throw new Error('Not authenticated');
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/api/admin/partners/upload-logo`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || 'Yükleme başarısız');
  }
  return res.json();
}

// ——— Social links ———
export type SocialLink = {
  id: number;
  platform: string;
  label?: string;
  url: string;
  sortOrder: number;
};

export async function adminSocialGetAll(): Promise<SocialLink[]> {
  const res = await fetch(`${API_BASE}/api/admin/social-links`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load');
  return res.json();
}

export async function adminSocialCreate(body: { platform: string; label?: string; url: string; sortOrder?: number }): Promise<{ id: number }> {
  const res = await fetch(`${API_BASE}/api/admin/social-links`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export async function adminSocialUpdate(id: number, body: Partial<SocialLink>): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/social-links/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) });
  if (!res.ok) throw new Error('Failed');
}

export async function adminSocialDelete(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/social-links/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error('Failed');
}

// ——— Languages ———
export type Language = { id: number; code: string; name: string; sortOrder: number };

export async function adminLanguagesGetAll(): Promise<Language[]> {
  const res = await fetch(`${API_BASE}/api/admin/languages`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export async function adminLanguageCreate(body: { code: string; name: string; sortOrder: number }): Promise<{ id: number }> {
  const res = await fetch(`${API_BASE}/api/admin/languages`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})) as { message?: string }).message || 'Failed');
  return res.json();
}

export async function adminLanguageUpdate(id: number, body: Partial<Language>): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/languages/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) });
  if (!res.ok) throw new Error('Failed');
}

export async function adminLanguageDelete(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/languages/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error('Failed');
}

// ——— Courses (admin) ———
export type AdminCourseListItem = {
  id: number;
  slug: string;
  category?: string;
  level?: string;
  durationMinutes: number;
  instructorName?: string;
  hasCertificate: boolean;
  moduleCount: number;
  lessonCount: number;
  createdAt: string;
};

export type AdminCourseFull = AdminCourseListItem & {
  imageUrl?: string;
  updatedAt: string;
  translations: { languageId: number; title: string; summary?: string }[];
  modules: {
    id: number;
    sortOrder: number;
    translations: { languageId: number; title: string; description?: string }[];
    items: {
      id: number;
      sortOrder: number;
      type: string;
      videoUrl?: string;
      mustWatch?: boolean;
      videoDurationSeconds?: number;
      filePath?: string;
      textContent?: string;
      quizDataJson?: string;
      passScorePercent?: number;
      translations: { languageId: number; title: string }[];
    }[];
  }[];
};

export async function adminCoursesGetAll(): Promise<AdminCourseListItem[]> {
  const res = await fetch(`${API_BASE}/api/admin/courses`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load courses');
  return res.json();
}

export async function adminCourseGet(id: number): Promise<AdminCourseFull> {
  const res = await fetch(`${API_BASE}/api/admin/courses/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load course');
  return res.json();
}

function apiErrorMessage(res: Response, data: unknown, fallback: string): string {
  if (typeof data === 'string') return data;
  const obj = data as { message?: string; title?: string; detail?: string } | null;
  const msg = obj?.message ?? obj?.detail ?? obj?.title;
  if (msg && typeof msg === 'string') return msg;
  if (res.status === 409) return 'Bu slug zaten kullanılıyor. Farklı bir slug deneyin.';
  return fallback;
}

export async function adminCourseCreate(body: AdminCoursePayload): Promise<{ id: number }> {
  const res = await fetch(`${API_BASE}/api/admin/courses`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
  if (!res.ok) {
    const data: unknown = await res.json().catch(async () => {
      const text = await res.text();
      return text ? { message: text } : {};
    });
    throw new Error(apiErrorMessage(res, data, `Kurs oluşturulamadı (${res.status}).`));
  }
  return res.json();
}

export async function adminCourseUpdate(id: number, body: AdminCoursePayload): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/courses/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) });
  if (!res.ok) throw new Error('Failed to update');
}

export async function adminCourseDelete(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/courses/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(data?.message ?? `Silinemedi (${res.status}).`);
  }
}

export async function adminUploadCourseCover(file: File): Promise<{ url: string }> {
  const token = getStoredToken();
  if (!token) throw new Error('Not authenticated');
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/api/admin/courses/upload-cover`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || 'Yükleme başarısız');
  }
  return res.json();
}

export async function adminDeleteCourseCover(courseId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/courses/${courseId}/cover`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Silinemedi');
}

export type AdminCoursePayload = {
  slug: string;
  category?: string;
  level?: string;
  durationMinutes: number;
  instructorName?: string;
  imageUrl?: string;
  hasCertificate: boolean;
  translations: { languageId: number; title: string; summary?: string }[];
  modules?: {
    sortOrder: number;
    translations: { languageId: number; title: string; description?: string }[];
    items?: {
      sortOrder: number;
      type: string;
      videoUrl?: string;
      mustWatch?: boolean;
      videoDurationSeconds?: number;
      filePath?: string;
      textContent?: string;
      quizDataJson?: string;
      passScorePercent?: number;
      translations: { languageId: number; title: string }[];
    }[];
  }[];
};
