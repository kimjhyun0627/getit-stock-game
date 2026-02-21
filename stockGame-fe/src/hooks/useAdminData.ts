import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { sortNews } from '../services/api';

export interface AdminUser {
  id: string;
  nickname?: string;
  name?: string;
  email?: string;
  role: string;
  balance?: number;
}

export interface AdminStock {
  id: string;
  name: string;
  symbol: string;
  currentPrice: number;
  volume: number;
}

export interface AdminNews {
  id: string;
  content: string;
  category: string;
  isPublished: boolean;
  publishYear?: number | null;
  reliability?: string | null;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  totalAssets: number;
  cashBalance: number;
  stockValue: number;
  rank: number;
  profitLoss: number;
  profitLossPercent: number;
  isVisible: boolean;
  lastUpdated: string;
}

export interface StockFormData {
  name: string;
  symbol: string;
  currentPrice: number;
  volume: number;
}

export interface NewsFormData {
  content: string;
  category: string;
  isPublished: boolean;
  publishYear: number | null;
  reliability: string | null;
}

const emptyStockForm: StockFormData = {
  name: '',
  symbol: '',
  currentPrice: 0,
  volume: 0,
};

const emptyNewsForm: NewsFormData = {
  content: '',
  category: 'all',
  isPublished: false,
  publishYear: null,
  reliability: null,
};

export function useAdminData() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stocks, setStocks] = useState<AdminStock[]>([]);
  const [news, setNews] = useState<AdminNews[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingStock, setEditingStock] = useState<AdminStock | null>(null);
  const [showStockForm, setShowStockForm] = useState(false);
  const [priceHistoryStock, setPriceHistoryStock] = useState<AdminStock | null>(null);
  const [priceHistoryRows, setPriceHistoryRows] = useState<{ year: number; price: number }[]>([]);
  const [savingPriceHistory, setSavingPriceHistory] = useState(false);
  const [stockFormData, setStockFormData] = useState<StockFormData>(emptyStockForm);

  const [editingNews, setEditingNews] = useState<AdminNews | null>(null);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [newsFormData, setNewsFormData] = useState<NewsFormData>(emptyNewsForm);
  const [newsCurrentYear, setNewsCurrentYear] = useState<number | null>(null);
  const [newsCurrentYearInput, setNewsCurrentYearInput] = useState('');
  const [savingYear, setSavingYear] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [gameStartYear, setGameStartYear] = useState<number | null>(null);
  const [gameEndYear, setGameEndYear] = useState<number | null>(null);
  const [gameStartYearInput, setGameStartYearInput] = useState('');
  const [gameEndYearInput, setGameEndYearInput] = useState('');
  const [savingGamePeriod, setSavingGamePeriod] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, stocksRes, newsRes, leaderboardRes, yearRes, gamePeriodRes] = await Promise.all([
        apiFetch('/users'),
        apiFetch('/stocks'),
        apiFetch('/news'),
        apiFetch('/leaderboard/admin'),
        apiFetch('/admin/settings/news-current-year').catch(() => null),
        apiFetch('/admin/settings/game-period').catch(() => null),
      ]);

      const usersData = await usersRes.json();
      const stocksData = await stocksRes.json();
      const newsData = await newsRes.json();
      const leaderboardData = await leaderboardRes.json();
      if (yearRes != null && yearRes.ok) {
        const yearData = await yearRes.json();
        setNewsCurrentYear(yearData.currentYear);
        setNewsCurrentYearInput(String(yearData.currentYear));
      }
      if (gamePeriodRes != null && gamePeriodRes.ok) {
        const periodData = await gamePeriodRes.json();
        setGameStartYear(periodData.startYear);
        setGameEndYear(periodData.endYear);
        setGameStartYearInput(String(periodData.startYear));
        setGameEndYearInput(String(periodData.endYear));
      }

      setUsers(usersData || []);
      setStocks(stocksData || []);
      setNews(sortNews(newsData || []));
      setLeaderboard(leaderboardData || []);
    } catch {
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUserRoleChange = async (userId: string, newRole: string) => {
    try {
      await apiFetch(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole }),
      });
      fetchData();
    } catch {
      setError('사용자 권한 변경에 실패했습니다.');
    }
  };

  const handleUserDelete = async (userId: string) => {
    if (!confirm('정말로 이 사용자를 삭제하시겠습니까?')) return;
    try {
      await apiFetch(`/users/${userId}`, { method: 'DELETE' });
      fetchData();
    } catch {
      setError('사용자 삭제에 실패했습니다.');
    }
  };

  const handleStockCreate = async () => {
    try {
      const payload = {
        name: stockFormData.name?.trim() ?? '',
        symbol: stockFormData.symbol?.trim() ?? '',
        currentPrice: Number(stockFormData.currentPrice) || 0,
        volume: Number(stockFormData.volume) || 0,
      };
      await apiFetch('/stocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      fetchData();
      setShowStockForm(false);
      setStockFormData(emptyStockForm);
      window.dispatchEvent(new CustomEvent('stocksUpdated'));
    } catch (err) {
      setError(err instanceof Error ? err.message : '주식 추가에 실패했습니다.');
    }
  };

  const handleStockUpdate = async (stockId: string, updates: Partial<AdminStock>) => {
    const validUpdates = {
      name: updates.name,
      symbol: updates.symbol,
      currentPrice: updates.currentPrice,
      volume: updates.volume,
    };
    const cleanUpdates = Object.fromEntries(
      Object.entries(validUpdates).filter(([, value]) => value !== undefined),
    );
    try {
      await apiFetch(`/stocks/${stockId}`, {
        method: 'PUT',
        body: JSON.stringify(cleanUpdates),
      });
      fetchData();
      setEditingStock(null);
      window.dispatchEvent(new CustomEvent('stocksUpdated'));
    } catch {
      setError('주식 정보 업데이트에 실패했습니다.');
    }
  };

  const handleStockDelete = async (stockId: string) => {
    if (!confirm('정말로 이 주식을 삭제하시겠습니까?')) return;
    try {
      await apiFetch(`/stocks/${stockId}`, { method: 'DELETE' });
      fetchData();
      window.dispatchEvent(new CustomEvent('stocksUpdated'));
    } catch {
      setError('주식 삭제에 실패했습니다.');
    }
  };

  const openPriceHistory = async (stock: AdminStock) => {
    setPriceHistoryStock(stock);
    try {
      const res = await apiFetch(`/admin/stocks/${stock.id}/price-history`);
      const data = await res.json();
      const existing = (data.prices || []) as { year: number; price: number }[];
      const start = gameStartYear ?? 2022;
      const end = gameEndYear ?? 2026;
      const rows: { year: number; price: number }[] = [];
      for (let y = start; y <= end; y++) {
        const found = existing.find((p: { year: number }) => p.year === y);
        rows.push({ year: y, price: found ? found.price : 0 });
      }
      setPriceHistoryRows(rows);
    } catch {
      const start = gameStartYear ?? 2022;
      const end = gameEndYear ?? 2026;
      setPriceHistoryRows(
        Array.from({ length: end - start + 1 }, (_, i) => ({ year: start + i, price: 0 })),
      );
    }
  };

  const savePriceHistory = async () => {
    if (!priceHistoryStock) return;
    setSavingPriceHistory(true);
    try {
      await apiFetch(`/admin/stocks/${priceHistoryStock.id}/price-history`, {
        method: 'PUT',
        body: JSON.stringify({ prices: priceHistoryRows }),
      });
      setPriceHistoryStock(null);
      setError(null);
    } catch {
      setError('연도별 가격 저장에 실패했습니다.');
    } finally {
      setSavingPriceHistory(false);
    }
  };

  const handleNewsCreate = async () => {
    if (newsFormData.category && newsFormData.category !== 'all') {
      const isValidCategory = stocks.some((s) => s.symbol === newsFormData.category);
      if (!isValidCategory) {
        setError(`유효하지 않은 카테고리입니다: ${newsFormData.category}`);
        return;
      }
    }
    try {
      await apiFetch('/news', {
        method: 'POST',
        body: JSON.stringify(newsFormData),
      });
      fetchData();
      setShowNewsForm(false);
      setNewsFormData(emptyNewsForm);
    } catch {
      setError('뉴스 추가에 실패했습니다.');
    }
  };

  const handleLeaderboardRefresh = async () => {
    try {
      await apiFetch('/leaderboard/admin/refresh', { method: 'POST' });
      fetchData();
    } catch {
      setError('리더보드 새로고침에 실패했습니다.');
    }
  };

  const handleUserVisibilityToggle = async (userId: string, isVisible: boolean) => {
    try {
      await apiFetch(`/leaderboard/admin/${userId}/visibility`, {
        method: 'PUT',
        body: JSON.stringify({ isVisible }),
      });
      fetchData();
    } catch {
      setError('사용자 노출 여부 변경에 실패했습니다.');
    }
  };

  const handleNewsUpdate = async (newsId: string, updates: Partial<AdminNews>) => {
    if (updates.category && updates.category !== 'all') {
      const isValidCategory = stocks.some((s) => s.symbol === updates.category);
      if (!isValidCategory) {
        setError(`유효하지 않은 카테고리입니다: ${updates.category}`);
        return;
      }
    }
    const validUpdates = {
      content: updates.content,
      category: updates.category,
      isPublished: updates.isPublished,
      publishYear: updates.publishYear,
      reliability: updates.reliability,
    };
    const cleanUpdates = Object.fromEntries(
      Object.entries(validUpdates).filter(([, value]) => value !== undefined),
    );
    try {
      await apiFetch(`/news/${newsId}`, {
        method: 'PUT',
        body: JSON.stringify(cleanUpdates),
      });
      fetchData();
      setEditingNews(null);
    } catch {
      setError('뉴스 업데이트에 실패했습니다.');
    }
  };

  const handleNewsDelete = async (newsId: string) => {
    if (!confirm('정말로 이 뉴스를 삭제하시겠습니까?')) return;
    try {
      await apiFetch(`/news/${newsId}`, { method: 'DELETE' });
      fetchData();
    } catch {
      setError('뉴스 삭제에 실패했습니다.');
    }
  };

  const handleNewsPublish = async (newsId: string, isPublished: boolean) => {
    try {
      await apiFetch(`/news/${newsId}/publish`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished }),
      });
      fetchData();
    } catch {
      setError('뉴스 게시 상태 변경에 실패했습니다.');
    }
  };

  const saveNewsCurrentYear = async () => {
    const y = parseInt(newsCurrentYearInput, 10);
    if (Number.isNaN(y) || y < 2000 || y > 2100) {
      setError('2000~2100 사이 연도를 입력하세요.');
      return;
    }
    setSavingYear(true);
    try {
      const res = await apiFetch('/admin/settings/news-current-year', {
        method: 'PUT',
        body: JSON.stringify({ currentYear: y }),
      });
      const data = await res.json();
      setNewsCurrentYear(data.currentYear);
      setNewsCurrentYearInput(String(data.currentYear));
      setError(null);
    } catch {
      setError('현재 연도 저장에 실패했습니다.');
    } finally {
      setSavingYear(false);
    }
  };

  const saveGamePeriod = async () => {
    const start = parseInt(gameStartYearInput, 10);
    const end = parseInt(gameEndYearInput, 10);
    if (
      Number.isNaN(start) ||
      Number.isNaN(end) ||
      start < 2000 ||
      start > 2100 ||
      end < 2000 ||
      end > 2100
    ) {
      setError('시작·종료 연도를 2000~2100 사이로 입력하세요.');
      return;
    }
    if (start > end) {
      setError('시작 연도는 종료 연도보다 크지 않아야 합니다.');
      return;
    }
    setSavingGamePeriod(true);
    try {
      const res = await apiFetch('/admin/settings/game-period', {
        method: 'PUT',
        body: JSON.stringify({ startYear: start, endYear: end }),
      });
      const data = await res.json();
      setGameStartYear(data.startYear);
      setGameEndYear(data.endYear);
      setGameStartYearInput(String(data.startYear));
      setGameEndYearInput(String(data.endYear));
      setError(null);
    } catch {
      setError('총 진행 연도 저장에 실패했습니다.');
    } finally {
      setSavingGamePeriod(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    users,
    stocks,
    news,
    leaderboard,
    loading,
    error,
    setError,
    fetchData,
    currentTime,
    gameStartYear,
    gameEndYear,
    newsCurrentYear,
    editingStock,
    setEditingStock,
    showStockForm,
    setShowStockForm,
    stockFormData,
    setStockFormData,
    priceHistoryStock,
    setPriceHistoryStock,
    priceHistoryRows,
    setPriceHistoryRows,
    savingPriceHistory,
    editingNews,
    setEditingNews,
    showNewsForm,
    setShowNewsForm,
    newsFormData,
    setNewsFormData,
    newsCurrentYearInput,
    setNewsCurrentYearInput,
    savingYear,
    gameStartYearInput,
    setGameStartYearInput,
    gameEndYearInput,
    setGameEndYearInput,
    savingGamePeriod,
    handleUserRoleChange,
    handleUserDelete,
    handleStockCreate,
    handleStockUpdate,
    handleStockDelete,
    openPriceHistory,
    savePriceHistory,
    handleNewsCreate,
    handleLeaderboardRefresh,
    handleUserVisibilityToggle,
    handleNewsUpdate,
    handleNewsDelete,
    handleNewsPublish,
    saveNewsCurrentYear,
    saveGamePeriod,
  };
}
