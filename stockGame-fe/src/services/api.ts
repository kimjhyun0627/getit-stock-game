import { API_CONFIG } from '../config/api';
import type { Stock, News, CreateStockDto, UpdateStockDto, CreateNewsDto, UpdateNewsDto } from '../types';

const API_BASE_URL = API_CONFIG.BASE_URL;

// 공통 fetch 함수
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// 주식 관련 API
export const stocksApi = {
  getAll: (): Promise<Stock[]> => apiFetch('/stocks'),
  getById: (id: string): Promise<Stock> => apiFetch(`/stocks/${id}`),
  create: (data: CreateStockDto, password: string): Promise<Stock> => 
    apiFetch('/stocks', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'x-admin-password': password }
    }),
  update: (id: string, data: UpdateStockDto, password: string): Promise<Stock> => 
    apiFetch(`/stocks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'x-admin-password': password }
    }),
  delete: (id: string, password: string): Promise<void> => 
    apiFetch(`/stocks/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': password }
    }),
  simulatePrices: (password: string): Promise<void> => 
    apiFetch('/stocks/simulate', {
      method: 'POST',
      headers: { 'x-admin-password': password }
    }),
};

// 뉴스 관련 API
export const newsApi = {
  getAll: (): Promise<News[]> => apiFetch('/news'),
  getPublished: (): Promise<News[]> => apiFetch('/news/published'),
  getByCategory: (category: string): Promise<News[]> => apiFetch(`/news/category/${category}`),
  getById: (id: string): Promise<News> => apiFetch(`/news/${id}`),
  create: (data: CreateNewsDto, password: string): Promise<News> => 
    apiFetch('/news', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'x-admin-password': password }
    }),
  update: (id: string, data: UpdateNewsDto, password: string): Promise<News> => 
    apiFetch(`/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'x-admin-password': password }
    }),
  delete: (id: string, password: string): Promise<void> => 
    apiFetch(`/news/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': password }
    }),
  publish: (id: string, password: string): Promise<News> => 
    apiFetch(`/news/${id}/publish`, {
      method: 'PUT',
      headers: { 'x-admin-password': password }
    }),
};

// 관리자 관련 API
export const adminApi = {
  getDashboard: (password: string): Promise<any> => 
    apiFetch(API_CONFIG.ADMIN_ENDPOINTS.DASHBOARD, {
      headers: { 'x-admin-password': password }
    }),
  getStatus: (password: string): Promise<any> => 
    apiFetch('/admin/status', {
      headers: { 'x-admin-password': password }
    }),
  simulateStocks: (password: string): Promise<void> => 
    apiFetch(API_CONFIG.ADMIN_ENDPOINTS.STOCKS_SIMULATE, {
      method: 'POST',
      headers: { 'x-admin-password': password }
    }),
  backup: (password: string): Promise<void> => 
    apiFetch(API_CONFIG.ADMIN_ENDPOINTS.BACKUP, {
      method: 'POST',
      headers: { 'x-admin-password': password }
    }),
};

