import React, { useState, useEffect } from 'react';
import type { News } from '../types';
import { ChevronLeft, ChevronRight, Clock, TrendingUp } from 'lucide-react';

interface NewsSliderProps {
  news: News[];
}

const NewsSlider: React.FC<NewsSliderProps> = ({ news }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 자동 슬라이드 (5초마다)
  useEffect(() => {
    if (news.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [news.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % news.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (news.length === 0) {
    return (
      <div className="bg-gray-100 rounded-2xl p-8 text-center text-gray-500">
        <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-lg font-medium">뉴스가 없습니다.</p>
      </div>
    );
  }

  const currentNews = news[currentIndex];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'economy':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'technology':
        return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
      case 'politics':
        return 'bg-gradient-to-r from-purple-500 to-violet-600 text-white';
      case 'sports':
        return 'bg-gradient-to-r from-orange-500 to-red-500 text-white';
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-600 text-white';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'economy':
        return '💰';
      case 'technology':
        return '🚀';
      case 'politics':
        return '🏛️';
      case 'sports':
        return '⚽';
      default:
        return '📰';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'economy':
        return '경제';
      case 'technology':
        return '기술';
      case 'politics':
        return '정치';
      case 'sports':
        return '스포츠';
      default:
        return category;
    }
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 group">
      {/* 뉴스 카드 */}
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getCategoryColor(currentNews.category)} shadow-lg`}>
              {getCategoryIcon(currentNews.category)} {getCategoryLabel(currentNews.category)}
            </span>
            <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-full">
              <Clock className="w-4 h-4" />
              <span>{currentNews.publishYear != null ? `${currentNews.publishYear}년` : '미설정'}</span>
            </div>
          </div>
        </div>
        
        <p className="text-gray-900 text-xl font-semibold leading-relaxed line-clamp-4 mb-6">
          {currentNews.content}
        </p>

        {/* 추가 정보 */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span>투자 관련 뉴스</span>
          </div>
          <div className="text-xs text-gray-400">
            {currentIndex + 1} / {news.length}
          </div>
        </div>
      </div>

      {/* 네비게이션 버튼 */}
      {news.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
            aria-label="이전 뉴스"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
            aria-label="다음 뉴스"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </>
      )}

      {/* 인디케이터 */}
      {news.length > 1 && (
        <div className="flex justify-center space-x-3 p-6 bg-gradient-to-r from-gray-50 to-gray-100">
          {news.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-blue-500 scale-125 shadow-lg' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`뉴스 ${index + 1}로 이동`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsSlider;
