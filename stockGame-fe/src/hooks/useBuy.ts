import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import type { PricePoint } from '../components/PriceLineChart';

export interface BuyStock {
  id: string;
  name: string;
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
}

interface BuyUser {
  id: string;
  name: string;
  balance: number;
}

export function useBuy() {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState<BuyStock[]>([]);
  const [user, setUser] = useState<BuyUser | null>(null);
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [gameStartYear, setGameStartYear] = useState<number | null>(null);
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);

  useEffect(() => {
    fetchStocks();
    fetchUserInfo();
  }, []);

  useEffect(() => {
    const fetchYearAndPeriod = async () => {
      try {
        const [yearRes, periodRes] = await Promise.all([
          apiFetch('/news/current-year'),
          apiFetch('/news/game-period').catch(() => null),
        ]);
        if (yearRes.ok) {
          const data = await yearRes.json();
          setCurrentYear(data.currentYear ?? null);
        }
        if (periodRes?.ok) {
          const period = await periodRes.json();
          setGameStartYear(period.startYear ?? null);
        }
      } catch {
        setCurrentYear(null);
        setGameStartYear(null);
      }
    };
    fetchYearAndPeriod();
  }, []);

  useEffect(() => {
    if (!selectedStock) {
      setPriceHistory([]);
      return;
    }
    const fetchPriceHistory = async () => {
      try {
        const res = await apiFetch(`/stocks/${selectedStock}/price-history`);
        if (res.ok) {
          const data = await res.json();
          const list: PricePoint[] = Array.isArray(data.prices) ? data.prices : [];
          setPriceHistory(list);
        } else {
          setPriceHistory([]);
        }
      } catch {
        setPriceHistory([]);
      }
    };
    fetchPriceHistory();
  }, [selectedStock]);

  const fetchStocks = async () => {
    try {
      const response = await apiFetch('/stocks');
      if (response.ok) {
        const stocksData = await response.json();
        setStocks(stocksData);
        if (stocksData.length > 0) {
          setSelectedStock(stocksData[0].id);
        }
      }
    } catch (err) {
      console.error('주식 정보를 가져오는데 실패했습니다:', err);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
      }
    } catch (err) {
      console.error('사용자 정보를 가져오는데 실패했습니다:', err);
    }
  };

  const handleQuantityChange = (value: number) => {
    setQuantity((q) => Math.max(1, q + value));
  };

  const handleBuy = async () => {
    if (!selectedStock || quantity <= 0) {
      setError('주식과 수량을 선택해주세요.');
      return;
    }
    const stock = stocks.find((s) => s.id === selectedStock);
    if (!stock) {
      setError('주식을 찾을 수 없습니다.');
      return;
    }
    if (!stock.currentPrice || stock.currentPrice <= 0) {
      setError('상장폐지 종목은 매수할 수 없습니다.');
      return;
    }
    const totalCost = stock.currentPrice * quantity;
    if (user && user.balance < totalCost) {
      setError('잔고가 부족합니다.');
      return;
    }
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('로그인이 필요합니다. 다시 로그인해주세요.');
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await apiFetch('/portfolios/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stockId: selectedStock,
          quantity,
          price: stock.currentPrice,
        }),
      });
      if (response.ok) {
        await response.json();
        setShowSuccess(true);
        if (user) {
          const newBalance = user.balance - totalCost;
          setUser({ ...user, balance: newBalance });
          localStorage.setItem('user', JSON.stringify({ ...user, balance: newBalance }));
        }
        setTimeout(() => navigate('/portfolio'), 1500);
      } else {
        const errorData = await response.json();
        if (response.status === 401) {
          setError('로그인이 만료되었습니다. 다시 로그인해주세요.');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          setError(`매수 실패: ${errorData.message || '알 수 없는 오류가 발생했습니다.'}`);
        }
      }
    } catch (err) {
      console.error('매수 중 오류 발생:', err);
      if (err instanceof Error && err.message.includes('인증이 만료')) {
        navigate('/login');
      } else {
        setError('매수 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectedStockData = selectedStock ? stocks.find((s) => s.id === selectedStock) : null;
  const totalAmount = selectedStockData ? selectedStockData.currentPrice * quantity : 0;
  const canAfford = user ? totalAmount <= user.balance : false;
  const isPriceValid = selectedStockData != null && selectedStockData.currentPrice > 0;

  const chartData = useMemo(() => {
    if (currentYear == null) return [];
    const start = gameStartYear ?? currentYear;
    const years = Array.from(
      { length: Math.max(0, currentYear - start + 1) },
      (_, i) => start + i,
    );
    const byYear = new Map(
      priceHistory.filter((p) => p.year <= currentYear).map((p) => [p.year, p.price]),
    );
    return years.map((year) => ({ year, price: byYear.get(year) ?? 0 }));
  }, [currentYear, gameStartYear, priceHistory]);

  return {
    stocks,
    user,
    selectedStock,
    setSelectedStock,
    quantity,
    setQuantity,
    currentYear,
    gameStartYear,
    priceHistory,
    chartData,
    selectedStockData,
    totalAmount,
    canAfford,
    isPriceValid,
    isLoading,
    showSuccess,
    error,
    fetchStocks,
    fetchUserInfo,
    handleQuantityChange,
    handleBuy,
  };
}
