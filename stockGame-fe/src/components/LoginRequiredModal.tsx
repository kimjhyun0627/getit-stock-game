import React from 'react';
import { LogIn, X } from 'lucide-react';

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({
  isOpen,
  onClose,
  onLogin,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-96 max-w-full overflow-hidden transform transition-all duration-300 scale-100 animate-in zoom-in-95 duration-300">
        {/* 헤더 - 그라데이션 배경 */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white p-6">
          {/* 배경 장식 */}
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">🔐 로그인 필요</h2>
                <p className="text-blue-100 text-sm">계정 인증이 필요한 서비스입니다</p>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-all duration-200 hover:scale-110 bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
              <LogIn className="text-blue-600" size={36} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              로그인이 필요합니다
            </h3>
            <p className="text-gray-600 mb-2 text-sm leading-relaxed">
              이 페이지에 접근하려면 로그인이 필요합니다.
            </p>
            <p className="text-gray-500 text-xs leading-relaxed">
              로그인 후 매수/매도 및 포트폴리오 기능을 이용하실 수 있습니다.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onLogin}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:scale-105"
            >
              🚀 로그인하기
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl transition-all duration-200 font-medium border border-gray-200 hover:border-gray-300"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredModal;
