import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Buy from './pages/Buy';
import Sell from './pages/Sell';
import Portfolio from './pages/Portfolio';
import News from './pages/News';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import Login from './pages/Login';
import KakaoCallback from './pages/KakaoCallback';
import GoogleCallback from './pages/GoogleCallback';
import ProtectedRoute from './components/ProtectedRoute';
import PageTransition from './components/PageTransition';
import './App.css';

// 모바일 디바이스 감지 유틸리티
import { logMobileInfo, isMobile } from './utils/mobile-detection';

function App() {
  const [showUserModal, setShowUserModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ 
    id?: string; 
    nickname?: string; 
    name?: string; 
    email?: string; 
    role?: string; 
    balance?: number; 
  } | null>(null);

  // 사용자 정보 로드 및 변경 감지
  React.useEffect(() => {
    const loadUser = () => {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('accessToken');
      
      if (userData && token) {
        setUser(JSON.parse(userData));
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    };

    // 초기 로드
    loadUser();

    // postMessage로부터 사용자 로그인 알림 받기
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'USER_LOGIN') {
        setUser(event.data.user);
        setIsLoggedIn(true);
      }
    };

    // localStorage 변경 감지 (다른 탭에서 로그아웃 등)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'accessToken') {
        loadUser();
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('message', handleMessage);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 모바일 디바이스 감지 및 로깅
  useEffect(() => {
    // 개발 환경에서만 모바일 정보 로깅
    if (import.meta.env.DEV) {
      logMobileInfo();
    }
    
    // 모바일 디바이스인 경우 추가 설정
    if (isMobile()) {
      console.log('📱 모바일 디바이스가 감지되었습니다.');
      
      // 모바일 최적화 설정
      document.body.style.touchAction = 'manipulation';
      document.body.style.userSelect = 'none';
      
      // 모바일 브라우저 주소창 숨기기 (일부 브라우저에서 지원)
      setTimeout(() => {
        window.scrollTo(0, 1);
      }, 100);
    }
  }, []);

  const handleUserModalChange = (show: boolean) => {
    setShowUserModal(show);
  };



  return (
    <Router>
      <div className="App">
                <Navigation 
          isLoggedIn={isLoggedIn} 
          setIsLoggedIn={setIsLoggedIn}
        />
                <main>
          <PageTransition>
            <Routes>
              <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auth/kakao/callback" element={<KakaoCallback />} />
              <Route path="/auth/google/callback" element={<GoogleCallback />} />
              <Route path="/buy" element={<ProtectedRoute user={user}><Buy /></ProtectedRoute>} />
              <Route path="/sell" element={<ProtectedRoute user={user}><Sell /></ProtectedRoute>} />
              <Route path="/portfolio" element={<ProtectedRoute user={user}><Portfolio /></ProtectedRoute>} />
              <Route path="/news" element={<News />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/admin" element={<ProtectedRoute user={user}><Admin /></ProtectedRoute>} />
            </Routes>
          </PageTransition>
        </main>

        {/* 사용자 정보 모달 */}
        {showUserModal && user && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              {/* 모달 헤더 */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">사용자 정보</h2>
                <button
                  onClick={() => handleUserModalChange(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 사용자 정보 */}
              <div className="space-y-4">
                {/* 프로필 섹션 */}
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {user.nickname || user.name || '사용자'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {user.role === 'ADMIN' ? '관리자' : '일반 사용자'}
                    </p>
                  </div>
                </div>

                {/* 상세 정보 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">사용자 ID</span>
                    <span className="text-sm font-mono text-gray-900">{user.id || 'N/A'}</span>
                  </div>
                  
                  {user.email && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">이메일</span>
                      <span className="text-sm text-gray-900">{user.email}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">보유 자금</span>
                    <span className="text-sm font-semibold text-green-600">
                      {user.balance ? `₩${user.balance.toLocaleString()}` : '₩0'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">권한</span>
                    <div className="flex items-center space-x-2">
                      {user.role === 'ADMIN' ? (
                        <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                      <span className="text-sm font-medium text-gray-900">
                        {user.role === 'ADMIN' ? '관리자' : '일반 사용자'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 모달 푸터 */}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => handleUserModalChange(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  닫기
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    setUser(null);
                    handleUserModalChange(false);
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
