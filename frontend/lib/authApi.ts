/**
 * User auth – backend API (backend/Api).
 * Backend varsayılan: http://localhost:5071
 */
export const API_BASE =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071')
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';

const TOKEN_KEY = 'esc4sdg_user_token';
const USER_INFO_KEY = 'esc4sdg_user_info';

export type UserInfo = {
  email?: string;
  displayName?: string;
  username?: string;
};

export function getUserToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUserInfo(): UserInfo | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_INFO_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as UserInfo;
    return data;
  } catch {
    return null;
  }
}

export function setUserInfo(info: UserInfo): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(info));
}

export const AUTH_CHANGE_EVENT = 'esc4sdg-auth-change';

export function setUserToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
}

/** Çıkış yapınca token ve profil bilgisini siler; güvenlik için zorunlu. */
export function clearUserToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_INFO_KEY);
  window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
}

/** 401 alındığında tokeni siler ve login'e atar */
export function handleUser401(): never {
  if (typeof window !== 'undefined') {
    clearUserToken();
    window.location.href = '/login?expired=1';
  }
  throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
}

export type AuthResponse = {
  token: string;
  role: string;
  expiresAt: string;
  email?: string;
  username?: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  displayName?: string;
  gender?: string;
  age?: number;
  school?: string;
};

export async function readErrorMessage(res: Response): Promise<string> {
  const text = await res.text().catch(() => '');
  if (!text) return res.statusText || 'Request failed';
  try {
    const json = JSON.parse(text) as { message?: string; error?: string; detail?: string };
    const msg = json.message || json.error || text;
    if (json.detail && json.detail !== msg) return `${msg}: ${json.detail}`;
    return msg;
  } catch {
    return text;
  }
}

export async function registerUser(payload: RegisterRequest): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }

  return res.json();
}

export async function loginUser(emailOrUsername: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrUsername, password }),
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }

  return res.json();
}

export async function updateProfile(token: string, displayName: string): Promise<{ displayName: string }> {
  const res = await fetch(`${API_BASE}/api/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ displayName }),
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }

  return res.json();
}

export async function forgotPassword(email: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
}

export async function resetPassword(email: string, token: string, newPassword: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, token, newPassword }),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
}
