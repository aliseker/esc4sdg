/**
 * Admin panel – backend API (backend klasöründeki ESC4SDG.Api) ile iletişim.
 * Backend varsayılan: http://localhost:5071
 */

export const API_BASE = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071')
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';

const TOKEN_KEY = 'esc4sdg_admin_token';
const EXPIRES_KEY = 'esc4sdg_admin_expires';

export const ADMIN_UNAUTHORIZED_EVENT = 'esc4sdg_admin_unauthorized';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string, expiresAt?: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  if (expiresAt) localStorage.setItem(EXPIRES_KEY, expiresAt);
}

export function clearStoredToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRES_KEY);
  window.dispatchEvent(new CustomEvent(ADMIN_UNAUTHORIZED_EVENT));
}

/** Token süresi dolmuşsa true döner */
export function isTokenExpired(): boolean {
  if (typeof window === 'undefined') return true;
  const expires = localStorage.getItem(EXPIRES_KEY);
  if (!expires) return false;
  try {
    return new Date(expires).getTime() <= Date.now();
  } catch {
    return false;
  }
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
  if (res.status === 401) handle401();
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

export async function adminDashboard(): Promise<{ message: string; courses: number; users: number; timestamp: string }> {
  const token = getStoredToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${API_BASE}/api/admin/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) handle401();
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

function authHeaders(): HeadersInit {
  if (typeof window !== 'undefined' && isTokenExpired()) {
    clearStoredToken();
    throw new Error('Oturum süresi dolmuş.');
  }
  const token = getStoredToken();
  if (!token) throw new Error('Not authenticated');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

/** 401 alındığında token siler ve çıkış eventi tetikler */
function handle401(): never {
  clearStoredToken();
  throw new Error('Oturum süresi dolmuş. Tekrar giriş yapın.');
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
  logoPosition?: string | null;
  role?: string;
  sortOrder: number;
  createdAt: string;
  translations: { languageId: number; description?: string }[];
};

export async function adminPartnersGetAll(): Promise<Partner[]> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/partners`, { headers: authHeaders() });
    if (res.status === 401) handle401();
    if (!res.ok) {
      const msg = await readApiError(res, 'Ortaklar yüklenemedi');
      throw new Error(msg);
    }
    return res.json();
  } catch (e) {
    if (e instanceof TypeError && (e.message === 'Failed to fetch' || e.message.includes('fetch'))) {
      throw new Error('API\'ye bağlanılamadı. Backend çalışıyor mu? (http://localhost:5071)');
    }
    throw e;
  }
}

export async function adminPartnerCreate(body: Partial<Partner> & { name: string; country: string }): Promise<{ id: number }> {
  const res = await fetch(`${API_BASE}/api/admin/partners`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
  if (res.status === 401) handle401();
  if (!res.ok) throw new Error(await readApiError(res, 'Ortak eklenemedi'));
  return res.json();
}

export async function adminPartnerUpdate(id: number, body: Partial<Partner>): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/partners/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) });
  if (res.status === 401) handle401();
  if (!res.ok) throw new Error(await readApiError(res, 'Ortak güncellenemedi'));
}

export async function adminPartnerDelete(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/partners/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (res.status === 401) handle401();
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
  if (res.status === 401) handle401();
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || 'Yükleme başarısız');
  }
  return res.json();
}

// ——— Projects ———
export type AdminProjectListItem = {
  id: number;
  slug: string;
  coverImageUrl: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  translations: { languageId: number; title: string; subtitle?: string }[];
  galleryCount: number;
};

export type AdminProjectFull = {
  id: number;
  slug: string;
  coverImageUrl: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  translations: { languageId: number; title: string; subtitle?: string; bodyHtml?: string }[];
  galleryImages: { id: number; imageUrl: string; sortOrder: number; caption?: string }[];
};

export type AdminProjectPayload = {
  slug: string;
  coverImageUrl?: string;
  sortOrder?: number;
  translations?: { languageId: number; title: string; subtitle?: string; bodyHtml?: string }[];
  galleryImages?: { imageUrl: string; caption?: string }[];
};

export async function adminProjectsGetAll(): Promise<AdminProjectListItem[]> {
  const res = await fetch(`${API_BASE}/api/admin/projects`, { headers: authHeaders() });
  if (res.status === 401) handle401();
  if (!res.ok) throw new Error(await readApiError(res, 'Projeler yüklenemedi'));
  return res.json();
}

export async function adminProjectGet(id: number): Promise<AdminProjectFull> {
  const res = await fetch(`${API_BASE}/api/admin/projects/${id}`, { headers: authHeaders() });
  if (res.status === 401) handle401();
  if (!res.ok) throw new Error(await readApiError(res, 'Proje yüklenemedi'));
  return res.json();
}

export async function adminProjectCreate(body: AdminProjectPayload): Promise<{ id: number }> {
  const res = await fetch(`${API_BASE}/api/admin/projects`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
  if (res.status === 401) handle401();
  if (!res.ok) throw new Error(await readApiError(res, 'Proje eklenemedi'));
  return res.json();
}

export async function adminProjectUpdate(id: number, body: AdminProjectPayload): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/projects/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) });
  if (res.status === 401) handle401();
  if (!res.ok) throw new Error(await readApiError(res, 'Proje güncellenemedi'));
}

export async function adminProjectDelete(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/projects/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (res.status === 401) handle401();
  if (!res.ok) throw new Error('Silinemedi');
}

export async function adminUploadProjectCover(file: File): Promise<{ url: string }> {
  const token = getStoredToken();
  if (!token) throw new Error('Not authenticated');
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/api/admin/projects/upload-cover`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (res.status === 401) handle401();
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || 'Yükleme başarısız');
  }
  return res.json();
}

export async function adminUploadProjectGallery(file: File): Promise<{ url: string }> {
  const token = getStoredToken();
  if (!token) throw new Error('Not authenticated');
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/api/admin/projects/upload-gallery`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (res.status === 401) handle401();
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || 'Yükleme başarısız');
  }
  return res.json();
}

export async function adminUploadProjectInline(file: File): Promise<{ url: string }> {
  const token = getStoredToken();
  if (!token) throw new Error('Not authenticated');
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/api/admin/projects/upload-inline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (res.status === 401) handle401();
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
  if (res.status === 401) handle401();
  if (!res.ok) throw new Error('Failed to load');
  return res.json();
}

async function readApiError(res: Response, fallback: string): Promise<string> {
  try {
    const text = await res.text();
    if (text.startsWith('{')) {
      const data = JSON.parse(text) as { message?: string; title?: string; detail?: string } | null;
      const msg = data?.message ?? data?.detail ?? data?.title;
      if (typeof msg === 'string') return msg;
    }
  } catch { /* ignore */ }
  const statusHint = res.status !== 0 ? ` (HTTP ${res.status})` : '';
  return `${fallback}${statusHint}`;
}

export async function adminSocialCreate(body: { platform: string; label?: string; url: string; sortOrder?: number }): Promise<{ id: number }> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/social-links`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
    if (res.status === 401) handle401();
    if (!res.ok) {
      if (res.status === 403) throw new Error('Bu işlem için yetkiniz yok. Admin girişi yapın.');
      throw new Error(await readApiError(res, 'Link eklenemedi'));
    }
    return res.json();
  } catch (e) {
    if (e instanceof TypeError && (e.message === 'Failed to fetch' || e.message.includes('fetch'))) {
      throw new Error('API\'ye bağlanılamadı. Backend çalışıyor mu? (http://localhost:5071)');
    }
    throw e;
  }
}

export async function adminSocialUpdate(id: number, body: Partial<SocialLink>): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/social-links/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) });
  if (res.status === 401) handle401();
  if (!res.ok) throw new Error('Failed');
}

export async function adminSocialDelete(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/social-links/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (res.status === 401) handle401();
  if (!res.ok) throw new Error('Failed');
}

// ——— Languages ———
export type Language = { id: number; code: string; name: string; sortOrder: number };

export async function adminLanguagesGetAll(): Promise<Language[]> {
  const res = await fetch(`${API_BASE}/api/admin/languages`, { headers: authHeaders() });
  if (res.status === 401) handle401();
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export async function adminLanguageCreate(body: { code: string; name: string; sortOrder: number }): Promise<{ id: number }> {
  const res = await fetch(`${API_BASE}/api/admin/languages`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
  if (res.status === 401) handle401();
  if (!res.ok) throw new Error((await res.json().catch(() => ({})) as { message?: string }).message || 'Failed');
  return res.json();
}

export async function adminLanguageUpdate(id: number, body: Partial<Language>): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/languages/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) });
  if (res.status === 401) handle401();
  if (!res.ok) throw new Error('Failed');
}

export async function adminLanguageDelete(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/languages/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (res.status === 401) handle401();
  if (!res.ok) throw new Error('Failed');
}

// ——— Site translations (site metinleri / çeviriler) ———
export type SiteTranslationItem = { key: string; label: string; value: string; referenceValue: string };

export async function adminSiteTranslationsGet(
  languageId: number,
  referenceLanguageId?: number,
  languageCode?: string
): Promise<{
  languageId: number;
  languageCode: string;
  languageName: string;
  items: SiteTranslationItem[];
}> {
  const params = new URLSearchParams({ languageId: String(languageId) });
  if (referenceLanguageId != null) params.set('referenceLanguageId', String(referenceLanguageId));
  if (languageCode != null && languageCode.trim() !== '') params.set('languageCode', languageCode.trim());
  const res = await fetch(`${API_BASE}/api/admin/site-translations?${params}`, { headers: authHeaders(), cache: 'no-store' });
  if (res.status === 401) handle401();
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string; detail?: string; title?: string };
    const msg = body.message || body.detail || body.title || res.statusText || 'Yüklenemedi';
    throw new Error(msg);
  }
  return res.json();
}

export async function adminSiteTranslationsUpdate(
  languageId: number,
  updates: Record<string, string>,
  languageCode?: string
): Promise<void> {
  const body: { languageId: number; languageCode?: string; updates: Record<string, string> } = { languageId, updates };
  if (languageCode != null && languageCode.trim() !== '') body.languageCode = languageCode.trim();
  const res = await fetch(`${API_BASE}/api/admin/site-translations`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (res.status === 401) handle401();
  if (!res.ok) throw new Error((await res.json().catch(() => ({})) as { message?: string }).message || 'Kaydedilemedi');
}

export async function adminSiteTranslationsAutoFill(
  targetLanguageId: number,
  sourceLanguageId?: number,
  targetLanguageCode?: string
): Promise<{ translated: number; message: string }> {
  const body: { targetLanguageId: number; targetLanguageCode?: string; sourceLanguageId?: number } = {
    targetLanguageId,
    sourceLanguageId: sourceLanguageId ?? undefined,
  };
  if (targetLanguageCode != null && targetLanguageCode.trim() !== '') body.targetLanguageCode = targetLanguageCode.trim();
  const res = await fetch(`${API_BASE}/api/admin/site-translations/auto-fill`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (res.status === 401) handle401();
  if (!res.ok) throw new Error((await res.json().catch(() => ({})) as { message?: string }).message || 'Otomatik çeviri başarısız');
  return res.json();
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
  translations: { languageId: number; title: string; summary?: string; category?: string; level?: string }[];
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
  if (res.status === 401) handle401();
  if (!res.ok) throw new Error('Failed to load courses');
  return res.json();
}

export async function adminCourseGet(id: number): Promise<AdminCourseFull> {
  const res = await fetch(`${API_BASE}/api/admin/courses/${id}`, { headers: authHeaders() });
  if (res.status === 401) handle401();
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
  if (res.status === 401) handle401();
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
  if (res.status === 401) handle401();
  if (!res.ok) throw new Error('Failed to update');
}

export async function adminCourseDelete(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/courses/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (res.status === 401) handle401();
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
  if (res.status === 401) handle401();
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || 'Yükleme başarısız');
  }
  return res.json();
}

export async function adminUploadCourseMaterial(file: File): Promise<{ url: string }> {
  const token = getStoredToken();
  if (!token) throw new Error('Not authenticated');
  const form = new FormData();
  form.append('file', file);
  const url = `${API_BASE}/api/admin/courses/upload-material-v2`;
  console.log('Uploading material to:', url);
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (res.status === 401) handle401();
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = (data as { message?: string }).message || `Yükleme başarısız (${res.status} ${res.statusText})`;
    throw new Error(msg);
  }
  return res.json();
}

export async function adminDeleteCourseCover(courseId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/courses/${courseId}/cover`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (res.status === 401) handle401();
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
  translations: { languageId: number; title: string; summary?: string; category?: string; level?: string }[];
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
