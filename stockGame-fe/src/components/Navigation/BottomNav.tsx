import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, TrendingDown, PieChart, Newspaper, Trophy } from 'lucide-react';

const bottomNavItems = [
  { path: '/', label: '홈', icon: Home },
  { path: '/buy', label: '매수', icon: TrendingUp },
  { path: '/sell', label: '매도', icon: TrendingDown },
  { path: '/portfolio', label: '포폴', icon: PieChart },
  { path: '/news', label: '뉴스', icon: Newspaper },
  { path: '/leaderboard', label: '리더보드', icon: Trophy },
];

interface BottomNavProps {
  isLoggedIn: boolean;
  onLoginRequired: () => void;
}

export function BottomNav({ isLoggedIn, onLoginRequired }: BottomNavProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
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
                onClick={onLoginRequired}
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
  );
}
