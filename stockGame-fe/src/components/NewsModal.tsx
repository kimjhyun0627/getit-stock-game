import React from 'react';
import { X } from 'lucide-react';

interface NewsModalProps {
  news: {
    id: string;
    title: string;
    summary: string;
    content: string;
    category: string;
    isPublished: boolean;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const NewsModal: React.FC<NewsModalProps> = ({ news, isOpen, onClose }) => {
  if (!isOpen || !news) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100 animate-in zoom-in-95 duration-300">
        {/* 헤더 - 그라데이션 배경 */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white p-4 sm:p-6 md:p-8">
          {/* 배경 장식 */}
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
              <div className="flex-1 sm:pr-4 md:pr-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 md:mb-4 leading-tight">{news.title}</h2>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <span className="bg-white/20 backdrop-blur-sm text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium border border-white/30">
                    {news.category === 'all' ? '전체' : news.category}
                  </span>
                  <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium border ${
                    news.isPublished 
                      ? 'bg-green-500/20 text-green-100 border-green-400/30' 
                      : 'bg-yellow-500/20 text-yellow-100 border-yellow-400/30'
                  }`}>
                    {news.isPublished ? '📢 게시됨' : '📝 임시저장'}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-all duration-200 hover:scale-110 bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm self-end sm:self-start"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* 요약 섹션 */}
        {news.summary && (
          <div className="p-4 sm:p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/30">
            <div className="flex items-center mb-3 md:mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                <span className="text-blue-600 text-base sm:text-lg">📋</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">요약</h3>
            </div>
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg pl-8 sm:pl-11">{news.summary}</p>
          </div>
        )}

        {/* 본문 내용 */}
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex items-center mb-4 md:mb-6">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
              <span className="text-purple-600 text-base sm:text-lg">📄</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">내용</h3>
          </div>
          <div className="prose max-w-none pl-8 sm:pl-11">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm sm:text-base bg-gray-50 p-3 sm:p-4 md:p-6 rounded-xl border border-gray-100">
              {news.content}
            </div>
          </div>
        </div>

        {/* 푸터 - 메타 정보 */}
        <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-6 text-xs sm:text-sm text-gray-600">
              {news.publishedAt && (
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="font-medium">게시일:</span> 
                  <span className="text-gray-800">{formatDate(news.publishedAt)}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 text-gray-500">
              <span className="text-xs">📰 뉴스 ID: {news.id.slice(0, 8)}...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsModal;
