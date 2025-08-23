const API_BASE_URL = 'http://localhost:3000/api';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('accessToken');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
    throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
  }

  return response;
};

export const apiGet = (endpoint: string) => apiFetch(endpoint);

export const apiPost = (endpoint: string, data?: any) => apiFetch(endpoint, {
  method: 'POST',
  body: data ? JSON.stringify(data) : undefined,
});

export const apiPut = (endpoint: string, data?: any) => apiFetch(endpoint, {
  method: 'PUT',
  body: data ? JSON.stringify(data) : undefined,
});

export const apiDelete = (endpoint: string) => apiFetch(endpoint, {
  method: 'DELETE',
});
