/** One backend address for auth, data, and sync. Vite proxies /api in development. */
const configuredBase = import.meta.env?.VITE_API_BASE_URL?.trim() || '/api';
if (!configuredBase.startsWith('/') && !/^https?:\/\//i.test(configuredBase)) {
  throw new Error('VITE_API_BASE_URL must be an absolute HTTP URL or a path beginning with /.');
}
export const API_BASE_URL = configuredBase.replace(/\/+$/, '');
export const STORAGE_PREFIX = `crm:v2:${encodeURIComponent(API_BASE_URL)}`;

export class ApiError extends Error {
  constructor(message: string, public status = 0, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T = any>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);
  try {
    const headers = new Headers(options.headers);
    if (options.body) headers.set('Content-Type', 'application/json');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
      credentials: 'same-origin',
    });
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new ApiError('عنوان الخادم غير صحيح أو خدمة البيانات غير متاحة. تأكد من تشغيل المشروع بالكامل.', response.status);
    }
    const data = await response.json();
    if (!response.ok || data.success === false) {
      // A late response from a previous login must not end a newer user's session.
      if (response.status === 401 && token
        && readStored<{ accessToken?: string } | null>(SESSION_KEY, null)?.accessToken === token) {
        window.dispatchEvent(new CustomEvent('crm:session-expired'));
      }
      const fallback = response.status === 401
        ? 'بيانات الدخول غير صحيحة أو انتهت الجلسة. يرجى تسجيل الدخول مجددًا.'
        : `تعذر إكمال الطلب (${response.status}).`;
      const message = typeof data.error === 'string' ? data.error : typeof data.message === 'string' ? data.message : fallback;
      throw new ApiError(message, response.status, data.code);
    }
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error instanceof Error && error.name === 'AbortError'
        ? 'انتهت مهلة الاتصال بالخادم. حاول مرة أخرى.'
        : 'تعذر الاتصال بالخادم. تأكد من تشغيل المشروع باستخدام npm run dev ثم أعد المحاولة.',
    );
  } finally {
    window.clearTimeout(timeout);
  }
}

export function readStored<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

export const SESSION_KEY = `${STORAGE_PREFIX}:session`;
export const userStorageKey = (userId: string, name: string) => `${STORAGE_PREFIX}:${userId}:${name}`;
