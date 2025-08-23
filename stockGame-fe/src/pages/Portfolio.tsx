import React, { useEffect, useState } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import { useStockData } from '../hooks/useStockData';
import type { PortfolioItem, Transaction } from '../types';
import { PieChart, TrendingUp, TrendingDown, DollarSign, BarChart3, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Portfolio: React.FC = () => {
  const { user, totalPortfolioValue, totalProfitLoss, loading, error, refetch } = usePortfolio();
  const { stocks, getStockById } = useStockData();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');

  // 포트폴리오 가치 업데이트
  useEffect(() => {
    const currentPrices: Record<string, number> = {};
    stocks.forEach(stock => {
      currentPrices[stock.id] = stock.currentPrice;
    });
  }, [stocks]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR');
  };

  const formatBalance = (balance: number) => {
    return balance.toLocaleString('ko-KR');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCurrentPrice = (stockId: string) => {
    const stock = getStockById(stockId);
    return stock?.currentPrice || 0;
  };

  const calculateTotalAssets = () => {
    return user.balance + totalPortfolioValue;
  };

  const calculateTotalReturn = () => {
    const totalAssets = calculateTotalAssets();
    const initialBalance = 10000000; // 초기 잔액
    return ((totalAssets - initialBalance) / initialBalance) * 100;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'buy':
        return 'text-green-600 bg-green-100';
      case 'sell':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'buy':
        return <ArrowUpRight className="w-4 h-4" />;
      case 'sell':
        return <ArrowDownRight className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={refetch} 
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <PieChart className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">포트폴리오</h1>
              <p className="text-gray-600">투자 현황과 거래 내역을 확인하세요</p>
            </div>
          </div>

          {/* 요약 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span className="ml-2 text-sm font-medium text-blue-800">총 자산</span>
              </div>
              <p className="text-xl font-bold text-blue-900 mt-1">
                {formatPrice(calculateTotalAssets())}원
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="ml-2 text-sm font-medium text-green-800">총 포트폴리오 가치</span>
              </div>
              <p className="text-xl font-bold text-green-900 mt-1">
                {formatPrice(totalPortfolioValue)}원
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <span className="ml-2 text-sm font-medium text-purple-800">수익/손실</span>
              </div>
              <p className={`text-xl font-bold mt-1 ${
                totalProfitLoss > 0 ? 'text-green-600' : 
                totalProfitLoss < 0 ? 'text-red-600' : 'text-purple-900'
              }`}>
                {totalProfitLoss > 0 ? '+' : ''}{formatPrice(totalProfitLoss)}원
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <span className="ml-2 text-sm font-medium text-orange-800">수익률</span>
              </div>
              <p className={`text-xl font-bold mt-1 ${
                calculateTotalReturn() > 0 ? 'text-green-600' : 
                calculateTotalReturn() < 0 ? 'text-red-600' : 'text-orange-900'
              }`}>
                {calculateTotalReturn() > 0 ? '+' : ''}{calculateTotalReturn().toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                포트폴리오 개요
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'transactions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                거래 내역
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' ? (
              /* 포트폴리오 개요 */
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">보유 주식 현황</h2>
                
                {user.portfolio.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <PieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">보유한 주식이 없습니다</p>
                    <p className="text-sm">주식을 매수하여 포트폴리오를 구성해보세요.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {user.portfolio.map((item) => {
                      const currentPrice = getCurrentPrice(item.stockId);
                      const profitLoss = (currentPrice - item.averagePrice) * item.quantity;
                      const profitLossPercent = ((currentPrice - item.averagePrice) / item.averagePrice) * 100;
                      
                      return (
                        <div key={item.stockId} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">{item.stockName}</h3>
                              <p className="text-sm text-gray-500">보유: {item.quantity}주</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">
                                {formatPrice(currentPrice)}원
                              </p>
                              <p className={`text-sm font-medium ${
                                profitLossPercent > 0 ? 'text-green-600' : 
                                profitLossPercent < 0 ? 'text-red-600' : 'text-gray-600'
                              }`}>
                                {profitLossPercent > 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">평균 매수가:</span>
                              <p className="font-medium">{formatPrice(item.averagePrice)}원</p>
                            </div>
                            <div>
                              <span className="text-gray-600">총 보유 가치:</span>
                              <p className="font-medium">{formatPrice(item.totalValue)}원</p>
                            </div>
                            <div>
                              <span className="text-gray-600">수익/손실:</span>
                              <p className={`font-medium ${
                                profitLoss > 0 ? 'text-green-600' : 
                                profitLoss < 0 ? 'text-red-600' : 'text-gray-600'
                              }`}>
                                {profitLoss > 0 ? '+' : ''}{formatPrice(profitLoss)}원
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">비중:</span>
                              <p className="font-medium">
                                {((item.totalValue / totalPortfolioValue) * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* 거래 내역 */
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">거래 내역</h2>
                <p className="text-sm text-gray-500 mb-4">최신 거래부터 표시됩니다 (거래 시간 기준 최신순)</p>
                
                {user.transactions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">거래 내역이 없습니다</p>
                    <p className="text-sm">주식을 매수하거나 매도하면 거래 내역이 표시됩니다.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {user.transactions.map((transaction) => (
                      <div key={transaction.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${getCategoryColor(transaction.type)}`}>
                              {getCategoryIcon(transaction.type)}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{transaction.stockName}</h3>
                              <p className="text-sm text-gray-500">
                                {transaction.type === 'buy' ? '매수' : '매도'} • {transaction.quantity}주
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatPrice(transaction.totalAmount)}원
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatPrice(transaction.price)}원/주
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatDate(transaction.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
