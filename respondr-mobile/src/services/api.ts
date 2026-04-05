import { auth } from '../firebase';
import { env } from '../config/env';

export type ApiError = {
  message: string;
  status?: number;
  code?: string;
  requestUrl?: string;
  rawError?: string;
};

const RETRYABLE_AUTH_PATTERNS = ['token expired', 'id-token-expired', 'auth/id-token-expired'];

function parseErrorMessage(data: unknown): { message: string; code?: string } {
  if (data && typeof data === 'object') {
    const value = data as { message?: unknown; error?: unknown; code?: unknown };
    const message =
      typeof value.message === 'string'
        ? value.message
        : typeof value.error === 'string'
          ? value.error
          : 'API request failed';
    const code = typeof value.code === 'string' ? value.code : undefined;
    return { message, code };
  }
  if (typeof data === 'string' && data.trim()) {
    return { message: data };
  }
  return { message: 'API request failed' };
}

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) return null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
  const text = await response.text();
  return text || null;
}

async function executeRequest(endpoint: string, options: RequestInit = {}) {
  if (!env.apiBaseUrl) {
    throw { message: 'Missing EXPO_PUBLIC_API_BASE_URL' } as ApiError;
  }

  const requestUrl = `${env.apiBaseUrl}${endpoint}`;
  let response: Response;

  try {
    response = await fetch(requestUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  } catch (error) {
    const raw = error instanceof Error ? error.message : String(error || 'Unknown network error');
    const localhostHint = env.apiBaseUrl.includes('localhost')
      ? ' If testing on a physical device, replace localhost with your computer LAN IP.'
      : '';

    throw {
      message: `Network request failed: ${requestUrl}.${localhostHint}`,
      requestUrl,
      rawError: raw,
    } as ApiError;
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    const parsed = parseErrorMessage(data);
    throw {
      message: `${parsed.message} (HTTP ${response.status})`,
      status: response.status,
      code: parsed.code,
      requestUrl,
    } as ApiError;
  }

  return data;
}

function shouldRetryAuth(err: ApiError) {
  if (err.status !== 401) return false;
  const message = String(err.message || '').toLowerCase();
  return RETRYABLE_AUTH_PATTERNS.some((pattern) => message.includes(pattern));
}

async function getAuthHeader(forceRefresh = false) {
  const user = auth.currentUser;
  if (!user) {
    throw { message: 'Authentication required' } as ApiError;
  }

  const token = await user.getIdToken(forceRefresh);
  return { Authorization: `Bearer ${token}` };
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}) {
  return executeRequest(endpoint, options) as Promise<T>;
}

export async function apiAuthRequest<T>(endpoint: string, options: RequestInit = {}) {
  try {
    const authHeader = await getAuthHeader(false);
    return (await executeRequest(endpoint, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...authHeader,
      },
    })) as T;
  } catch (error) {
    const err = (error || { message: 'API request failed' }) as ApiError;

    if (!shouldRetryAuth(err)) {
      throw err;
    }

    const refreshedHeader = await getAuthHeader(true);
    return (await executeRequest(endpoint, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...refreshedHeader,
      },
    })) as T;
  }
}
