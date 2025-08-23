export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000,
  ADMIN_ENDPOINTS: {
    DASHBOARD: '/admin/dashboard',
    STOCKS_SIMULATE: '/admin/stocks/simulate',
    BACKUP: '/admin/backup'
  }
};
