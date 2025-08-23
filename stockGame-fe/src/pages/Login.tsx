import React from 'react';
import { Link } from 'react-router-dom';
import GoogleLogin from '../components/GoogleLogin';

const Login: React.FC = () => {
  const handleKakaoLogin = async () => {
    try {
      // 백엔드에서 카카오 OAuth URL을 받아옴
              const response = await fetch('https://getit-stock-game.vercel.app/api/auth/kakao/login', {
          credentials: 'include'
        });
      const { url } = await response.json();
      
      // 받은 URL로 리다이렉트
      window.location.href = url;
    } catch (error) {
      console.error('카카오 로그인 URL을 가져오는데 실패했습니다:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 flex items-center justify-center p-4">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200/20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-indigo-200/20 rounded-full translate-y-1/2"></div>
      </div>
      
      <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl w-96 max-w-full overflow-hidden border border-white/20">
        {/* 헤더 - 그라데이션 배경 */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white p-8 text-center">
          {/* 배경 장식 */}
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎮</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">GETIT 주식게임</h1>
            <p className="text-blue-100 text-sm">실시간 주식 시세와 함께하는 투자 경험</p>
          </div>
        </div>
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">🔐 로그인</h2>
            <p className="text-gray-600 text-sm">소셜 계정으로 간편하게 로그인하세요</p>
          </div>
          
          <button
            onClick={handleKakaoLogin}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-black font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 mb-6 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.118l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
            </svg>
            카카오로 로그인
          </button>
          
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>
          
          <GoogleLogin onLogin={() => {}} />
          
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200 hover:scale-105">
              <span>←</span>
              메인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
