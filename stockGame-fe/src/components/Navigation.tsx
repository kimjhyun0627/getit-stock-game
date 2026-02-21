import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, TrendingUp, TrendingDown, PieChart, User, Settings, LogIn, LogOut, Newspaper, Trophy } from 'lucide-react';
import LoginRequiredModal from './LoginRequiredModal';
import { BottomNav, UserModal } from './Navigation/index';

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

      <BottomNav
        isLoggedIn={isLoggedIn}
        onLoginRequired={() => setShowLoginRequired(true)}
      />

      <LoginRequiredModal
        isOpen={showLoginRequired}
        onClose={() => setShowLoginRequired(false)}
        onLogin={() => {
          setShowLoginRequired(false);
          navigate('/login');
        }}
      />

      {showUserModal && user && (
        <UserModal
          user={user}
          onClose={closeUserModal}
          onLogout={handleLogout}
          onCopyId={copyUserId}
          copiedId={copiedId}
        />
      )}
    </>
  );
};

export default Navigation;
