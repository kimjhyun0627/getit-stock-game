import React from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, LogOut, Copy, Check } from 'lucide-react';

export interface UserModalUser {
  id?: string;
  nickname?: string;
  name?: string;
  email?: string;
  role?: string;
  balance?: number;
}

interface UserModalProps {
  user: UserModalUser;
  onClose: () => void;
  onLogout: () => void;
  onCopyId: () => void;
  copiedId: boolean;
}

export function UserModal({ user, onClose, onLogout, onCopyId, copiedId }: UserModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[9999] p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-h-[90dvh] sm:max-h-none sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300">
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white p-4 sm:p-6 md:p-8">
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
                onClick={onClose}
                className="text-white/80 hover:text-white transition-all duration-200 hover:scale-110 bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm self-end sm:self-start"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

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
                      onClick={onCopyId}
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
                    {user.balance != null ? `₩${user.balance.toLocaleString()}` : '₩0'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100">
          {user.role === 'ADMIN' && (
            <Link
              to="/admin"
              onClick={onClose}
              className="flex items-center justify-center space-x-2 w-full mb-3 min-h-[44px] px-4 py-3 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>관리자 페이지</span>
            </Link>
          )}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={onClose}
              className="flex-1 min-h-[44px] px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-lg sm:rounded-xl transition-all duration-200 border border-gray-200 hover:border-gray-300 hover:shadow-sm active:scale-[0.98]"
            >
              닫기
            </button>
            <button
              onClick={onLogout}
              className="flex-1 min-h-[44px] px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg sm:rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center space-x-2 active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4" />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
