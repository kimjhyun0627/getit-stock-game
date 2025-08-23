import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const KakaoCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const userParam = searchParams.get('user');
    
    if (accessToken && refreshToken && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        window.parent.postMessage({ type: 'USER_LOGIN', user }, '*');
        
        setStatus('success');
        setMessage('로그인 성공! 메인 페이지로 이동합니다.');
        
        setTimeout(() => {
          navigate('/');
        }, 1000);
        
      } catch (error) {
        console.error('사용자 정보 파싱 실패:', error);
        setStatus('error');
        setMessage('사용자 정보 처리에 실패했습니다. 다시 시도해주세요.');
      }
    } else {
      setStatus('error');
      setMessage('로그인 정보를 받지 못했습니다. 다시 시도해주세요.');
    }
  }, [searchParams, navigate]);

  const getStatusContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">카카오 로그인 처리 중...</p>
          </div>
        );
      case 'success':
        return (
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <p className="text-green-600 font-semibold">{message}</p>
          </div>
        );
      case 'error':
        return (
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">✗</div>
            <p className="text-red-600 font-semibold">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              다시 시도
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-96">
        {getStatusContent()}
      </div>
    </div>
  );
};

export default KakaoCallback;
