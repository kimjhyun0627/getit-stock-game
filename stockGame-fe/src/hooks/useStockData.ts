import { useState, useEffect } from 'react';
import type { Stock } from '../types';
import { stocksApi } from '../services/api';

export const useStockData = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 주식 데이터 가져오기
  const fetchStocks = async () => {
    try {
      setLoading(true);
      const data = await stocksApi.getAll();
      setStocks(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '주식 데이터를 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 주식 가격 시뮬레이션
  const simulatePrices = async () => {
    try {
      // 실제로는 관리자 비밀번호가 필요하지만, 데모용으로 빈 문자열 사용
      await stocksApi.simulatePrices('');
      await fetchStocks(); // 업데이트된 데이터 다시 가져오기
    } catch (err) {
      console.error('가격 시뮬레이션 실패:', err);
    }
  };

  // 특정 주식 정보 가져오기
  const getStockById = (id: string): Stock | undefined => {
    return stocks.find(stock => stock.id === id);
  };

  // 주식 검색
  const searchStocks = (query: string): Stock[] => {
    if (!query.trim()) return stocks;
    return stocks.filter(stock => 
      stock.name.toLowerCase().includes(query.toLowerCase()) ||
      stock.symbol.includes(query)
    );
  };

  // 초기 데이터 로드 및 주기적 업데이트
  useEffect(() => {
    fetchStocks();
    
    // 30초마다 주식 데이터 자동 새로고침
    const REFRESH_INTERVAL = 30000; // 30초
    
    const interval = setInterval(() => {
      fetchStocks();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return {
    stocks,
    loading,
    error,
    fetchStocks,
    simulatePrices,
    getStockById,
    searchStocks
  };
};
