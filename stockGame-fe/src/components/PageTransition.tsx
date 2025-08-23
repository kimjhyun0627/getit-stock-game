import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setIsLoading(true);
      
      // 페이지 전환 시 스크롤을 맨 위로
      window.scrollTo(0, 0);
      
      // 로딩 상태를 잠시 보여준 후 새 페이지 표시
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [location, displayLocation.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <LoadingSpinner size="lg" text="페이지를 불러오는 중..." />
          <div className="mt-4 text-gray-500 text-sm">
            {location.pathname === '/' && '홈으로 이동 중...'}
            {location.pathname === '/news' && '뉴스 페이지로 이동 중...'}
            {location.pathname === '/leaderboard' && '리더보드로 이동 중...'}
            {location.pathname === '/buy' && '매수 페이지로 이동 중...'}
            {location.pathname === '/sell' && '매도 페이지로 이동 중...'}
            {location.pathname === '/portfolio' && '포트폴리오로 이동 중...'}
            {location.pathname === '/admin' && '관리자 페이지로 이동 중...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition">
      {children}
    </div>
  );
};

export default PageTransition;
