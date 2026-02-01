/**
 * Admin panel – backend API (backend klasöründeki ESC4SDG.Api) ile iletişim.
 * Backend varsayılan: http://localhost:5137
 */

export const API_BASE = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5137')
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5137';

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

export async function adminLogin(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
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
  const res = await fetch(`${API_BASE}/api/auth/me`, {
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
