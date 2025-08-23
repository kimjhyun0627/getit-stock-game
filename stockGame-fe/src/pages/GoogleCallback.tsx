import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const GoogleCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const userStr = searchParams.get('user');

        if (!accessToken || !refreshToken || !userStr) {
          setStatus('error');
          setErrorMessage('로그인 정보가 누락되었습니다.');
          return;
        }

        // 사용자 정보 파싱
        const user = JSON.parse(decodeURIComponent(userStr));

        // 로컬 스토리지에 토큰과 사용자 정보 저장
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        // 부모 창에 로그인 성공 메시지 전송
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'USER_LOGIN',
            user: user,
          }, '*');
        }

        // 로그인 성공 상태로 변경
        setStatus('success');

        // 2초 후 홈페이지로 리다이렉트
        setTimeout(() => {
          navigate('/');
        }, 2000);

      } catch (error) {
        console.error('Google 로그인 콜백 처리 실패:', error);
        setStatus('error');
        setErrorMessage('로그인 처리 중 오류가 발생했습니다.');
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full mx-4">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">로그인 처리 중</h2>
          <p className="text-gray-600">Google 계정 정보를 확인하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full mx-4">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">로그인 실패</h2>
          <p className="text-red-600 mb-6">{errorMessage}</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full mx-4">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">로그인 성공!</h2>
        <p className="text-gray-600 mb-6">Google 계정으로 성공적으로 로그인되었습니다.</p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-800">
            잠시 후 홈페이지로 이동합니다...
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors font-medium"
        >
          바로 이동하기
        </button>
      </div>
    </div>
  );
};

export default GoogleCallback;
