import { useState, useEffect } from 'react';
import type { PortfolioItem, Transaction, User } from '../types';
import { apiFetch } from '../utils/api';

export const usePortfolio = () => {
  const [user, setUser] = useState<User>({
    id: '1',
    name: '김투자',
    balance: 0,
    portfolio: [],
    transactions: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 로드
  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [portfolioRes, transactionsRes, balanceRes] = await Promise.all([
        apiFetch('/portfolios'),
        apiFetch('/portfolios/transactions'),
        apiFetch('/portfolios/balance')
      ]);

      const portfolioData = await portfolioRes.json();
      const transactionsData = await transactionsRes.json();
      const balanceData = await balanceRes.json();

      setUser(prev => ({
        ...prev,
        portfolio: portfolioData,
        transactions: transactionsData,
        balance: balanceData.balance
      }));
    } catch (err) {
      setError('포트폴리오 데이터를 불러오는데 실패했습니다.');
      console.error('포트폴리오 데이터 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  // 주식 매수
  const buyStock = async (stockId: string, stockName: string, quantity: number, price: number) => {
    const totalAmount = quantity * price;
    
    if (totalAmount > user.balance) {
      throw new Error('잔액이 부족합니다.');
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      stockId,
      stockName,
      type: 'buy',
      quantity,
      price,
      totalAmount,
      date: new Date().toISOString()
    };

    // 기존 포트폴리오 아이템 찾기
    const existingItem = user.portfolio.find(item => item.stockId === stockId);
    
    let newPortfolio: PortfolioItem[];
    
    if (existingItem) {
      // 기존 보유 주식이 있는 경우 평균 매수가 계산
      const totalQuantity = existingItem.quantity + quantity;
      const totalCost = (existingItem.averagePrice * existingItem.quantity) + totalAmount;
      const newAveragePrice = totalCost / totalQuantity;
      
      newPortfolio = user.portfolio.map(item =>
        item.stockId === stockId
          ? {
              ...item,
              quantity: totalQuantity,
              averagePrice: newAveragePrice,
              totalValue: totalQuantity * price,
              profitLoss: (price - newAveragePrice) * totalQuantity,
              profitLossPercent: ((price - newAveragePrice) / newAveragePrice) * 100
            }
          : item
      );
    } else {
      // 새로운 주식 추가
      const newItem: PortfolioItem = {
        stockId,
        stockName,
        quantity,
        averagePrice: price,
        currentPrice: price,
        totalValue: totalAmount,
        profitLoss: 0,
        profitLossPercent: 0
      };
      
      newPortfolio = [...user.portfolio, newItem];
    }

    setUser(prev => ({
      ...prev,
      balance: prev.balance - totalAmount,
      portfolio: newPortfolio,
      transactions: [...prev.transactions, newTransaction]
    }));
  };

  // 주식 매도
  const sellStock = (stockId: string, quantity: number, price: number) => {
    const existingItem = user.portfolio.find(item => item.stockId === stockId);
    
    if (!existingItem || existingItem.quantity < quantity) {
      throw new Error('보유 수량이 부족합니다.');
    }

    const totalAmount = quantity * price;
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      stockId,
      stockName: existingItem.stockName,
      type: 'sell',
      quantity,
      price,
      totalAmount,
      date: new Date().toISOString()
    };

    let newPortfolio: PortfolioItem[];
    
    if (existingItem.quantity === quantity) {
      // 전량 매도
      newPortfolio = user.portfolio.filter(item => item.stockId !== stockId);
    } else {
      // 부분 매도
      newPortfolio = user.portfolio.map(item =>
        item.stockId === stockId
          ? {
              ...item,
              quantity: item.quantity - quantity,
              totalValue: (item.quantity - quantity) * price,
              profitLoss: (price - item.averagePrice) * (item.quantity - quantity),
              profitLossPercent: ((price - item.averagePrice) / item.averagePrice) * 100
            }
          : item
      );
    }

    setUser(prev => ({
      ...prev,
      balance: prev.balance + totalAmount,
      portfolio: newPortfolio,
      transactions: [...prev.transactions, newTransaction]
    }));
  };

  // 포트폴리오 가치 업데이트 (현재 가격 반영)
  const updatePortfolioValues = (currentPrices: Record<string, number>) => {
    setUser(prev => ({
      ...prev,
      portfolio: prev.portfolio.map(item => {
        const currentPrice = currentPrices[item.stockId] || item.currentPrice;
        const totalValue = item.quantity * currentPrice;
        const profitLoss = (currentPrice - item.averagePrice) * item.quantity;
        const profitLossPercent = ((currentPrice - item.averagePrice) / item.averagePrice) * 100;
        
        return {
          ...item,
          currentPrice,
          totalValue,
          profitLoss,
          profitLossPercent
        };
      })
    }));
  };

  // 포트폴리오 총 가치
  const totalPortfolioValue = user.portfolio.reduce((sum, item) => sum + item.totalValue, 0);
  
  // 총 수익/손실
  const totalProfitLoss = user.portfolio.reduce((sum, item) => sum + item.profitLoss, 0);

  return {
    user,
    buyStock,
    sellStock,
    updatePortfolioValues,
    totalPortfolioValue,
    totalProfitLoss,
    loading,
    error,
    refetch: fetchPortfolioData
  };
};
