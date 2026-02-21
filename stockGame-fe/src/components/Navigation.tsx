import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, TrendingUp, TrendingDown, PieChart, User, Settings, LogIn, LogOut, Newspaper, Trophy, Copy, Check } from 'lucide-react';
import LoginRequiredModal from './LoginRequiredModal';

interface NavigationProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({ isLoggedIn, setIsLoggedIn }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<{ 
    id?: string; 
    nickname?: string; 
    name?: string; 
    email?: string; 
    role?: string; 
    balance?: number; 
  } | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showLoginRequired, setShowLoginRequired] = useState(false);
  const [copiedId, setCopiedId] = useState(false);


  useEffect(() => {
    const loadUser = () => {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('accessToken');
      
      if (userData && token) {
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
    };

    // 초기 로드
    loadUser();

    // localStorage 변경 감지 (다른 탭)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'accessToken') {
        loadUser();
      }
    };

    // 같은 탭에서 로그인 시 상태 반영 (OAuth 콜백 후 auth-change 이벤트)
    const handleAuthChange = () => loadUser();

    // postMessage로부터 사용자 로그인 알림 받기 (iframe)
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'USER_LOGIN') {
        setUser(event.data.user);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('message', handleMessage);
    };
  }, []);



  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setShowUserModal(false);
    setIsLoggedIn(false);
  };

  const openUserModal = () => {
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
  };

  const copyUserId = async () => {
    if (user?.id) {
      try {
        await navigator.clipboard.writeText(user.id);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000); // 2초 후 복사 상태 해제
      } catch {
        // 클립보드 API가 지원되지 않는 경우 fallback
        const textArea = document.createElement('textarea');
        textArea.value = user.id;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      }
    }
  };

  const navItems = [
    { path: '/', label: '홈', icon: Home },
    { path: '/buy', label: '매수', icon: TrendingUp },
    { path: '/sell', label: '매도', icon: TrendingDown },
    { path: '/portfolio', label: '포트폴리오', icon: PieChart },
    { path: '/news', label: '뉴스', icon: Newspaper },
    { path: '/leaderboard', label: '리더보드', icon: Trophy },
    // 관리자만 관리자 메뉴 표시
    ...(user?.role === 'ADMIN' ? [{ path: '/admin', label: '관리자', icon: Settings }] : []),
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const bottomNavItems = [
    { path: '/', label: '홈', icon: Home },
    { path: '/buy', label: '매수', icon: TrendingUp },
    { path: '/sell', label: '매도', icon: TrendingDown },
    { path: '/portfolio', label: '포폴', icon: PieChart },
    { path: '/news', label: '뉴스', icon: Newspaper },
    { path: '/leaderboard', label: '리더보드', icon: Trophy },
  ];

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* 로고 - 반응형으로 조정 */}
            <div className="flex items-center space-x-2 py-3 lg:py-4 flex-shrink-0">
              <img 
                src="/Logo.png" 
                alt="STOCK IT Logo" 
                className="h-8 w-8 md:h-10 md:w-10"
              />
              <div className="hidden sm:block">
                <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  STOCK IT
                </span>
                <p className="text-xs text-gray-500 -mt-1 hidden md:block">GETIT 모의 투자 게임</p>
              </div>
            </div>

            {/* 데스크톱 네비게이션 - 반응형 개선 */}
            <div className="hidden lg:flex space-x-1 xl:space-x-2 flex-1 justify-center">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isProtectedRoute = ['/buy', '/sell', '/portfolio', '/admin'].includes(item.path);
                const isDisabled = isProtectedRoute && !isLoggedIn;
                
                const baseClasses = "flex items-center space-x-1 xl:space-x-2 px-2 xl:px-4 py-2 xl:py-3 rounded-xl text-xs xl:text-sm font-medium transition-all duration-300 min-w-[80px] xl:min-w-[100px] justify-center btn-hover-effect";
                const activeClasses = "bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg transform scale-105";
                const inactiveClasses = "text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:shadow-md";
                
                if (isDisabled) {
                  return (
                    <button
                      key={item.path}
                      onClick={() => alert('로그인이 필요한 서비스입니다. 먼저 로그인해주세요.')}
                      className={`${baseClasses} ${inactiveClasses}`}
                      title="로그인이 필요합니다"
                    >
                      <Icon className="w-3 h-3 xl:w-4 xl:h-4" />
                      <span className="hidden xl:inline">{item.label}</span>
                    </button>
                  );
                }
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`${baseClasses} ${
                      isActive(item.path) ? activeClasses : inactiveClasses
                    }`}
                  >
                    <Icon className="w-3 h-3 xl:w-4 xl:h-4" />
                    <span className="hidden xl:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* 사용자 정보 - 반응형: 모바일에서도 터치 영역 확보 */}
            <div className="flex items-center justify-end flex-shrink-0 gap-1">
              {user ? (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={openUserModal}
                    className="flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 md:px-3 md:py-2 rounded-full md:rounded-full text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 md:transition-colors cursor-pointer p-2 active:scale-95"
                    aria-label="사용자 정보"
                  >
                    <User className="w-5 h-5 md:w-4 md:h-4" />
                    <span className="hidden lg:inline ml-1">{user.nickname || user.name || '사용자'}</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 px-2 md:px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors active:scale-95"
                  >
                    <LogOut className="w-5 h-5 md:w-4 md:h-4" />
                    <span className="hidden sm:inline ml-1">로그아웃</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors active:scale-95"
                >
                  <LogIn className="w-5 h-5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline ml-1">로그인</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 모바일 전용 하단 탭바 (lg 미만) */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="grid grid-cols-6 max-w-lg mx-auto">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isProtected = ['/buy', '/sell', '/portfolio'].includes(item.path);
            const disabled = isProtected && !isLoggedIn;
            const active = isActive(item.path);
            if (disabled) {
              return (
                <button
                  key={item.path}
                  onClick={() => setShowLoginRequired(true)}
                  className="flex flex-col items-center justify-center min-h-[48px] pt-2 pb-1 text-gray-400 active:scale-95 touch-manipulation"
                  aria-label={item.label}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-[10px] sm:text-xs mt-0.5">{item.label}</span>
                </button>
              );
            }
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center min-h-[48px] pt-2 pb-1 transition-colors active:scale-95 touch-manipulation ${
                  active ? 'text-blue-600 font-medium' : 'text-gray-600'
                }`}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-[10px] sm:text-xs mt-0.5">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <LoginRequiredModal
        isOpen={showLoginRequired}
        onClose={() => setShowLoginRequired(false)}
        onLogin={() => {
          setShowLoginRequired(false);
          navigate('/login');
        }}
      />

      {/* 사용자 정보 모달 */}
      {showUserModal && user && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[9999] p-0 sm:p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-h-[90dvh] sm:max-h-none sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300">
            {/* 헤더 - 그라데이션 배경 */}
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white p-4 sm:p-6 md:p-8">
              {/* 배경 장식 */}
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-white/5 rounded-full -translate-y-8 sm:-translate-y-12 translate-x-8 sm:translate-x-12"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-20 sm:h-20 bg-white/5 rounded-full translate-y-6 sm:translate-y-10 -translate-x-6 sm:-translate-x-10"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold mb-2">👤 사용자 정보</h2>
                    <p className="text-blue-100 text-sm">계정 상세 정보를 확인하세요</p>
                  </div>
                  <button
                    onClick={closeUserModal}
                    className="text-white/80 hover:text-white transition-all duration-200 hover:scale-110 bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm self-end sm:self-start"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* 프로필 섹션 */}
            <div className="p-4 sm:p-6 md:p-8 flex-1 overflow-auto min-h-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl border border-blue-100 mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg self-center sm:self-start">
                  <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                    {user.nickname || user.name || '사용자'}
                  </h3>
                  <div className="flex items-center justify-center sm:justify-start space-x-2">
                    {user.role === 'ADMIN' ? (
                      <span className="bg-yellow-100 text-yellow-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border border-yellow-200">
                        👑 관리자
                      </span>
                    ) : (
                      <span className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border border-blue-200">
                        👤 일반 사용자
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 상세 정보 */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-2 sm:mb-3 uppercase tracking-wide">계정 정보</h4>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <span className="text-xs sm:text-sm text-gray-600 flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        사용자 ID
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs sm:text-sm font-mono text-gray-900 bg-white px-2 py-1 rounded border">
                          {user.id ? user.id.slice(0, 8) + '...' : 'N/A'}
                        </span>
                        <button
                          onClick={copyUserId}
                          className={`p-1 sm:p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                            copiedId 
                              ? 'bg-green-100 text-green-600 border border-green-200' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                          }`}
                          title={copiedId ? '복사됨!' : '사용자 ID 복사'}
                        >
                          {copiedId ? (
                            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          ) : (
                            <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {user.email && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <span className="text-xs sm:text-sm text-gray-600 flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          이메일
                        </span>
                        <span className="text-xs sm:text-sm text-gray-900 bg-white px-2 py-1 rounded border break-all">
                          {user.email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-2 sm:mb-3 uppercase tracking-wide">재무 정보</h4>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <span className="text-xs sm:text-sm text-gray-600 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        보유 자금
                      </span>
                      <span className="text-base sm:text-lg font-bold text-green-600 bg-green-50 px-2 sm:px-3 py-1 rounded-lg border border-green-200">
                        {user.balance ? `₩${user.balance.toLocaleString()}` : '₩0'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100">
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  onClick={closeUserModal}
                  className="flex items-center justify-center space-x-2 w-full mb-3 min-h-[44px] px-4 py-3 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>관리자 페이지</span>
                </Link>
              )}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={closeUserModal}
                  className="flex-1 min-h-[44px] px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-lg sm:rounded-xl transition-all duration-200 border border-gray-200 hover:border-gray-300 hover:shadow-sm active:scale-[0.98]"
                >
                  닫기
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 min-h-[44px] px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg sm:rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center space-x-2 active:scale-[0.98]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>로그아웃</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
