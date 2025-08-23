import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye, EyeOff } from 'lucide-react';
import { apiFetch } from '../utils/api';
import type { News as NewsType, Stock } from '../types';
import NewsModal from '../components/NewsModal';



const News: React.FC = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPublishedOnly, setShowPublishedOnly] = useState(true); // 일반 사용자는 기본적으로 게시된 뉴스만 보기
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsType | null>(null);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);

  // 사용자 정보 로드
  const loadUserInfo = () => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    
    if (userData && token) {
      const userInfo = JSON.parse(userData);
      setIsAdmin(userInfo.role === 'ADMIN');
      
      // Admin이 아닌 경우 게시된 뉴스만 보기로 고정
      if (userInfo.role !== 'ADMIN') {
        setShowPublishedOnly(true);
      }
    }
  };

  // 주식 데이터를 가져와서 카테고리로 사용
  const fetchStocks = async () => {
    try {
      const response = await apiFetch('/stocks');
      if (response.ok) {
        const stocksData = await response.json();
        setStocks(stocksData);
        
        // 현재 선택된 카테고리가 유효한지 확인
        if (selectedCategory !== 'all') {
          const isValidCategory = stocksData.some((stock: Stock) => stock.symbol === selectedCategory);
          if (!isValidCategory) {
    
            setSelectedCategory('all');
          }
        }
        
        // 주식 데이터가 변경되면 뉴스도 다시 로드
        if (selectedCategory !== 'all') {
          fetchNews();
        }
      }
    } catch (error) {
      console.error('주식 데이터 로드 실패:', error);
    }
  };

  const handleNewsClick = (newsItem: NewsType) => {
    setSelectedNews(newsItem);
    setIsNewsModalOpen(true);
  };

  const closeNewsModal = () => {
    setIsNewsModalOpen(false);
    setSelectedNews(null);
  };

  // 동적 카테고리 생성 (주식 기반)
  const getCategories = () => {
    const baseCategories = [
      { id: 'all', label: '전체', color: 'bg-gray-500' }
    ];
    
    const stockCategories = stocks.map((stock, index) => {
      const colors = ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-orange-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500'];
      return {
        id: stock.symbol,
        label: stock.name,
        color: colors[index % colors.length]
      };
    });
    
    
    
    return [...baseCategories, ...stockCategories];
  };

  useEffect(() => {
    fetchStocks();
    loadUserInfo();
    
    // 주기적으로 주식 데이터 업데이트 (5분마다)
    const interval = setInterval(fetchStocks, 5 * 60 * 1000);
    
    // 주식 데이터 변경 이벤트 리스너
    const handleStocksUpdated = () => {
      
      fetchStocks();
    };
    
    window.addEventListener('stocksUpdated', handleStocksUpdated);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('stocksUpdated', handleStocksUpdated);
    };
  }, []);

  useEffect(() => {
    fetchNews();
  }, [selectedCategory, showPublishedOnly, stocks]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      // Admin이 아닌 경우 강제로 게시된 뉴스만 가져오기
      const shouldShowPublishedOnly = !isAdmin || showPublishedOnly;
      
      let endpoint = '/news';
      if (shouldShowPublishedOnly) {
        endpoint = '/news/published';
      }

      const response = await apiFetch(endpoint);
      if (response.ok) {
        let newsData = await response.json();
        
        // 주식 카테고리로 필터링 (전체가 아닌 경우)
        if (selectedCategory !== 'all') {
          const selectedStock = stocks.find(s => s.symbol === selectedCategory);
          if (selectedStock) {
            newsData = newsData.filter((item: News) => {
              // 뉴스 제목이나 요약에 주식 이름 또는 심볼이 포함되어 있는지 확인
              const stockName = selectedStock.name.toLowerCase();
              const stockSymbol = selectedStock.symbol.toLowerCase();
              const title = item.title.toLowerCase();
              const summary = item.summary.toLowerCase();
              
              return title.includes(stockName) || 
                     title.includes(stockSymbol) || 
                     summary.includes(stockName) || 
                     summary.includes(stockSymbol);
            });
          }
        }
        
        setNews(newsData);
      } else {
        throw new Error('뉴스를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
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

  const getCategoryColor = (category: string) => {
    const cat = getCategories().find(c => c.id === category);
    return cat ? cat.color : 'bg-gray-500';
  };

  const getCategoryLabel = (category: string) => {
    const cat = getCategories().find(c => c.id === category);
    return cat ? cat.label : category;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchNews} 
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">투자 뉴스</h1>
                <p className="text-gray-600">최신 시장 동향과 투자 정보를 확인하세요</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 및 컨트롤 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* 카테고리 필터 */}
            <div className="flex flex-wrap gap-2">
              {getCategories().map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? `${category.color} text-white`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* 게시 상태 필터 - Admin 권한이 있는 경우에만 표시 */}
            {isAdmin && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowPublishedOnly(!showPublishedOnly)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showPublishedOnly
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {showPublishedOnly ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span>{showPublishedOnly ? '게시된 뉴스만' : '전체 뉴스'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 뉴스 목록 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {news.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">뉴스가 없습니다</h3>
            <p className="text-gray-500">선택한 조건에 맞는 뉴스가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer"
                onClick={() => handleNewsClick(item)}
              >
                <div className="p-6">
                  {/* 카테고리 및 상태 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(item.category)}`}>
                        {getCategoryLabel(item.category)}
                      </span>
                      {/* 주식 관련 표시 */}
                      {item.category !== 'economy' && item.category !== 'technology' && item.category !== 'politics' && item.category !== 'sports' && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          주식 관련
                        </span>
                      )}
                    </div>
                    {/* Admin 권한이 있는 경우에만 게시 상태 표시 */}
                    {isAdmin && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.isPublished 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.isPublished ? '게시됨' : '임시저장'}
                      </span>
                    )}
                  </div>

                  {/* 제목 */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {item.title}
                  </h3>

                  {/* 요약 */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {item.summary}
                  </p>

                  {/* 메타 정보 */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    {item.publishedAt && (
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{formatDate(item.publishedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 뉴스 개수 및 정렬 기준 표시 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          총 {news.length}개의 뉴스가 있습니다 (최신순)
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

export default News;
