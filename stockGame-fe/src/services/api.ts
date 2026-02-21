import { API_CONFIG } from '../config/api';
import type { Stock, News, CreateStockDto, UpdateStockDto, CreateNewsDto, UpdateNewsDto } from '../types';
import { apiFetch } from '../utils/api';

const json = <T>(r: Awaited<ReturnType<typeof apiFetch>>): Promise<T> => r.json();

export const stocksApi = {
  getAll: (): Promise<Stock[]> => apiFetch('/stocks').then(json<Stock[]>),
  getById: (id: string): Promise<Stock> => apiFetch(`/stocks/${id}`).then(json<Stock>),
  create: (data: CreateStockDto, password: string): Promise<Stock> =>
    apiFetch('/stocks', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'x-admin-password': password },
    }).then(json<Stock>),
  update: (id: string, data: UpdateStockDto, password: string): Promise<Stock> =>
    apiFetch(`/stocks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'x-admin-password': password },
    }).then(json<Stock>),
  delete: (id: string, password: string): Promise<void> =>
    apiFetch(`/stocks/${id}`, { method: 'DELETE', headers: { 'x-admin-password': password } }).then(() => undefined),
  simulatePrices: (password: string): Promise<void> =>
    apiFetch('/stocks/simulate', {
      method: 'POST',
      headers: { 'x-admin-password': password },
    }).then(() => undefined),
};

/** 뉴스 공통 정렬: 공개 연도 내림차순 → 신뢰도(전년도 결산, 상, 중, 하, 전체공개) → 카테고리순 (관리자/일반 동일) */
export function sortNews(list: News[]): News[] {
  const relOrder: Record<string, number> = {
    YEAR_END: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
    ALL: 4,
  };
  return [...list].sort((a, b) => {
    const yearA = a.publishYear ?? -1;
    const yearB = b.publishYear ?? -1;
    if (yearA !== yearB) return yearB - yearA;
    const rA = relOrder[a.reliability ?? ''] ?? 99;
    const rB = relOrder[b.reliability ?? ''] ?? 99;
    if (rA !== rB) return rA - rB;
    return (a.category || '').localeCompare(b.category || '', 'ko');
  });
}

export const newsApi = {
  getAll: (): Promise<News[]> => apiFetch('/news').then(json<News[]>),
  getPublished: (year?: number | null): Promise<News[]> =>
    apiFetch(year != null ? `/news/published?year=${year}` : '/news/published')
      .then(json<News[]>)
      .then(sortNews),
  getCurrentYear: (): Promise<{ currentYear: number }> =>
    apiFetch('/news/current-year').then(json<{ currentYear: number }>),
  getGamePeriod: (): Promise<{ startYear: number; endYear: number }> =>
    apiFetch('/news/game-period').then(json<{ startYear: number; endYear: number }>),
  getByCategory: (category: string): Promise<News[]> => apiFetch(`/news/category/${category}`).then(json<News[]>),
  getById: (id: string): Promise<News> => apiFetch(`/news/${id}`).then(json<News>),
  create: (data: CreateNewsDto, password: string): Promise<News> =>
    apiFetch('/news', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'x-admin-password': password },
    }).then(json<News>),
  update: (id: string, data: UpdateNewsDto, password: string): Promise<News> =>
    apiFetch(`/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'x-admin-password': password },
    }).then(json<News>),
  delete: (id: string, password: string): Promise<void> =>
    apiFetch(`/news/${id}`, { method: 'DELETE', headers: { 'x-admin-password': password } }).then(() => undefined),
  publish: (id: string, password: string): Promise<News> =>
    apiFetch(`/news/${id}/publish`, { method: 'PUT', headers: { 'x-admin-password': password } }).then(json<News>),
};

export const adminApi = {
  getDashboard: (password: string) =>
    apiFetch(API_CONFIG.ADMIN_ENDPOINTS.DASHBOARD, { headers: { 'x-admin-password': password } }),
  getStatus: (password: string) =>
    apiFetch('/admin/status', { headers: { 'x-admin-password': password } }),
  simulateStocks: (password: string): Promise<void> =>
    apiFetch(API_CONFIG.ADMIN_ENDPOINTS.STOCKS_SIMULATE, {
      method: 'POST',
      headers: { 'x-admin-password': password },
    }).then(() => undefined),
  backup: (password: string): Promise<void> =>
    apiFetch(API_CONFIG.ADMIN_ENDPOINTS.BACKUP, {
      method: 'POST',
      headers: { 'x-admin-password': password },
    }).then(() => undefined),
};

