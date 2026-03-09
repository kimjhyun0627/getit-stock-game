import { API_CONFIG } from '../config/api';

type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
  user: unknown;
};

const clearAuthAndNotify = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.dispatchEvent(new CustomEvent('userLoggedOut'));
  window.dispatchEvent(new Event('auth-change'));
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as AuthTokensResponse;

    if (!data.accessToken || !data.refreshToken) {
      return null;
    }

    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    window.dispatchEvent(new Event('auth-change'));

    return data.accessToken;
  } catch {
    return null;
  }
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const doRequest = async (accessToken?: string) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    return fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  };

  const token = localStorage.getItem('accessToken') || undefined;
  let response = await doRequest(token);

  if (response.status === 401) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      response = await doRequest(newToken);
    }
  }

  if (response.status === 401) {
    clearAuthAndNotify();
    throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
  }

  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    } catch {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  return response;
};

export const apiGet = (endpoint: string) => apiFetch(endpoint);

export const apiPost = (endpoint: string, data?: unknown) => apiFetch(endpoint, {
  method: 'POST',
  body: data ? JSON.stringify(data) : undefined,
});

export const apiPut = (endpoint: string, data?: unknown) => apiFetch(endpoint, {
  method: 'PUT',
  body: data ? JSON.stringify(data) : undefined,
});

export const apiDelete = (endpoint: string) => apiFetch(endpoint, {
  method: 'DELETE',
});
