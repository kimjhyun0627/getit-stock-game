import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StockPriceBoard from '../components/StockPriceBoard';
import NewsModal from '../components/NewsModal';

import { useStockData } from '../hooks/useStockData';
import { newsApi } from '../services/api';
import type { News } from '../types';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Sparkles, Trophy } from 'lucide-react';

interface HomeProps {
  isLoggedIn: boolean;
}

const Home: React.FC<HomeProps> = ({ isLoggedIn }) => {
  const { stocks, loading: stocksLoading, error: stocksError, fetchStocks } = useStockData();
  const [news, setNews] = useState<News[]>([]);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [nextRefresh, setNextRefresh] = useState<Date>(new Date(Date.now() + 30000));
  const navigate = useNavigate();

  // 거래량 포맷팅 함수
  const formatTotalVolume = (totalVolume: number) => {
    if (totalVolume >= 1000000) {
      const millions = totalVolume / 1000000;
      if (millions >= 10) {
        return `${Math.round(millions)}M`;
      } else {
        return `${millions.toFixed(1)}M`;
      }
    } else if (totalVolume >= 1000) {
      const thousands = totalVolume / 1000;
      if (thousands >= 10) {
        return `${Math.round(thousands)}K`;
      } else {
        return `${thousands.toFixed(1)}K`;
      }
    } else if (totalVolume >= 100) {
      return `${Math.round(totalVolume / 100) * 100}`;
    } else if (totalVolume >= 10) {
      return `${Math.round(totalVolume / 10) * 10}`;
    } else {
      return totalVolume.toString();
    }
  };

  // 뉴스 데이터 가져오기
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const publishedNews = await newsApi.getPublished();
        setNews(publishedNews);
      } catch (err) {
        console.error('뉴스 데이터를 가져오는데 실패했습니다:', err);
        // 에러 시 빈 배열로 설정
        setNews([]);
      }
    };

    fetchNews();
  }, []);

  const handleStockClick = (stock: unknown) => {
    if (!isLoggedIn) {
      alert('로그인이 필요한 서비스입니다. 먼저 로그인해주세요.');
      return;
    }
    // 주식 클릭 시 매수 페이지로 이동
    navigate('/buy', { state: { selectedStock: stock } });
  };

  const handleNewsClick = (newsItem: News) => {
    setSelectedNews(newsItem);
    setIsNewsModalOpen(true);
  };

  const closeNewsModal = () => {
    setIsNewsModalOpen(false);
    setSelectedNews(null);
  };

  // 수동 새로고침 함수
  const handleManualRefresh = async () => {
    setLastRefresh(new Date());
    setNextRefresh(new Date(Date.now() + 30000));
    await fetchStocks();
  };

  // 30초마다 다음 새로고침 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setNextRefresh(new Date(Date.now() + 30000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const quickActions = [
    {
      title: '매수하기',
      description: '주식을 구매하세요',
      icon: TrendingUp,
      color: 'gradient-bg-green',
      path: '/buy'
    },
    {
      title: '매도하기',
      description: '보유 주식을 판매하세요',
      icon: TrendingDown,
      color: 'gradient-bg-purple',
      path: '/sell'
    },
    {
      title: '포트폴리오',
      description: '투자 현황을 확인하세요',
      icon: BarChart3,
      color: 'gradient-bg-blue',
      path: '/portfolio'
    },
    {
      title: '리더보드',
      description: '전체 순위를 확인하세요',
      icon: Trophy,
      color: 'gradient-bg-yellow',
      path: '/leaderboard'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* 헤더 섹션 */}
      <div className="relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute top-0 left-0 w-72 h-72 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-white opacity-5 rounded-full translate-y-1/2"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center text-white">
            {/* 메인 제목 */}
            <div className="mb-6">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                GETIT 주식게임
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                실시간 주식 시세와 함께하는 <span className="font-semibold">투자 경험</span>
              </p>
            </div>

            {/* 빠른 액션 버튼들 */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                const isProtectedAction = ['/buy', '/sell', '/portfolio'].includes(action.path);
                
                if (isProtectedAction && !isLoggedIn) {
                  return (
                    <button
                      key={action.title}
                      onClick={() => alert('로그인이 필요한 서비스입니다. 먼저 로그인해주세요.')}
                      className={`${action.color} transition-all duration-300 text-white px-8 py-4 rounded-2xl font-semibold flex items-center space-x-3 shadow-2xl`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                      title="로그인이 필요합니다"
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-lg">{action.title}</span>
                    </button>
                  );
                }
                
                return (
                  <button
                    key={action.title}
                    onClick={() => navigate(action.path)}
                    className={`${action.color} hover:scale-105 transition-all duration-300 text-white px-8 py-4 rounded-2xl font-semibold flex items-center space-x-3 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 btn-hover-effect`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-lg">{action.title}</span>
                  </button>
                );
              })}
            </div>

            {/* 통계 카드들 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="glass rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-center space-x-3">
                  <div className="p-3 bg-green-400 bg-opacity-20 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-green-200" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-100">상승 종목</p>
                    <p className="text-2xl font-bold text-white">
                      {stocks.filter(s => s.change > 0).length}개
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-center space-x-3">
                  <div className="p-3 bg-red-400 bg-opacity-20 rounded-xl">
                    <TrendingDown className="w-6 h-6 text-red-200" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-100">하락 종목</p>
                    <p className="text-2xl font-bold text-white">
                      {stocks.filter(s => s.change < 0).length}개
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-center space-x-3">
                  <div className="p-3 bg-blue-400 bg-opacity-20 rounded-xl">
                    <DollarSign className="w-6 h-6 text-blue-200" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-100">거래량 총합</p>
                    <p className="text-2xl font-bold text-white">
                      {formatTotalVolume(stocks.reduce((sum, s) => sum + s.volume, 0))}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 투자 뉴스 섹션 */}
            <div className="mt-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">투자 뉴스</h2>
                <p className="text-blue-100 text-lg">최신 시장 동향을 확인하세요</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {news.slice(0, 6).map((item, index) => (
                  <div
                    key={item.id}
                    className="glass rounded-2xl p-6 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => handleNewsClick(item)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-blue-100 text-sm line-clamp-3 mb-3">
                          {item.summary}
                        </p>
                        <div className="flex items-center justify-between text-xs text-blue-200">
                          <span className="bg-white/20 px-2 py-1 rounded-full">
                            {item.category}
                          </span>
                          <span>{new Date(item.createdAt).toLocaleDateString('ko-KR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {news.length > 6 && (
                <div className="text-center mt-8">
                  <button 
                    onClick={() => navigate('/news')}
                    className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                  >
                    더 많은 뉴스 보기
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* 주식 시세 섹션 */}
        <div className="mb-12 fade-in">
          {/* 새로고침 상태 및 수동 새로고침 */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 sm:mb-6 space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">실시간 주식 시세</h2>
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>30초마다 자동 업데이트</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                <div>마지막 업데이트: {lastRefresh.toLocaleTimeString('ko-KR')}</div>
                <div>다음 업데이트: {nextRefresh.toLocaleTimeString('ko-KR')}</div>
              </div>
              <button
                onClick={handleManualRefresh}
                disabled={stocksLoading}
                className="flex items-center justify-center sm:justify-start space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{stocksLoading ? '업데이트 중...' : '수동 새로고침'}</span>
              </button>
            </div>
          </div>
          
          {stocksLoading ? (
            <div className="bg-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
              <p className="text-sm sm:text-base text-gray-600">주식 데이터를 불러오는 중...</p>
            </div>
          ) : stocksError ? (
            <div className="bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-center">
              <div className="text-red-600 mb-3 sm:mb-4">
                <TrendingDown className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2" />
                <p className="text-base sm:text-lg font-medium">데이터 로드 실패</p>
              </div>
              <p className="text-sm sm:text-base text-red-500 mb-3 sm:mb-4">{stocksError}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-red-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
              >
                다시 시도
              </button>
            </div>
          ) : (
            <StockPriceBoard 
              stocks={stocks} 
              onStockClick={handleStockClick}
            />
          )}
        </div>


      </div>

      {/* 뉴스 모달 */}
      <NewsModal
        news={selectedNews}
        isOpen={isNewsModalOpen}
        onClose={closeNewsModal}
      />
    </div>
  );
};

export default Home;
