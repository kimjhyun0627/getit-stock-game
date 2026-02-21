import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

export interface PortfolioItem {
  stockId: string;
  stockName: string;
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

interface SellUser {
  id: string;
  name: string;
  balance: number;
}

export function useSell() {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [user, setUser] = useState<SellUser | null>(null);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [sellQuantity, setSellQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchPortfolio = async () => {
    try {
      const response = await apiFetch('/portfolios');
      if (response.ok) {
        const portfolioData = await response.json();
        setPortfolio(portfolioData);
      }
    } catch (err) {
      console.error('포트폴리오를 가져오는데 실패했습니다:', err);
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

  useEffect(() => {
    fetchPortfolio();
    fetchUserInfo();
  }, []);

  const handleItemSelect = (item: PortfolioItem) => {
    setSelectedItem(item);
    setSellQuantity(1);
  };

  const handleQuantityChange = (value: number) => {
    if (!selectedItem) return;
    setSellQuantity((q) => Math.max(1, Math.min(selectedItem.quantity, q + value)));
  };

  const handleSell = async () => {
    if (!selectedItem) {
      setError('매도할 주식을 선택해주세요.');
      return;
    }
    if (!selectedItem.currentPrice || selectedItem.currentPrice <= 0) {
      setError('주식 가격 정보를 불러올 수 없습니다. 페이지를 새로고침해주세요.');
      return;
    }
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('로그인이 필요합니다. 다시 로그인해주세요.');
      navigate('/login');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      const response = await apiFetch('/portfolios/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stockId: selectedItem.stockId,
          quantity: sellQuantity,
          price: selectedItem.currentPrice,
        }),
      });

      if (response.ok) {
        await response.json();
        setShowSuccess(true);
        if (user) {
          const sellAmount = selectedItem.currentPrice * sellQuantity;
          const newBalance = user.balance + sellAmount;
          setUser({ ...user, balance: newBalance });
          localStorage.setItem('user', JSON.stringify({ ...user, balance: newBalance }));
        }
        await fetchPortfolio();
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
          setError(
            `매도 실패: ${errorData.message || '알 수 없는 오류가 발생했습니다.'}`,
          );
        }
      }
    } catch (err) {
      console.error('매도 중 오류 발생:', err);
      if (err instanceof Error && err.message.includes('인증이 만료')) {
        navigate('/login');
      } else {
        setError(err instanceof Error ? err.message : '매도 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sellAmount = selectedItem?.currentPrice
    ? selectedItem.currentPrice * sellQuantity
    : 0;
  const profitLoss = selectedItem?.currentPrice
    ? (selectedItem.currentPrice - selectedItem.averagePrice) * sellQuantity
    : 0;

  return {
    portfolio,
    user,
    selectedItem,
    sellQuantity,
    setSellQuantity,
    isLoading,
    showSuccess,
    error,
    handleItemSelect,
    handleQuantityChange,
    handleSell,
    fetchPortfolio,
    fetchUserInfo,
    sellAmount,
    profitLoss,
  };
}
