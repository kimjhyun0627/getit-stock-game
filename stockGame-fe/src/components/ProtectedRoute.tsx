import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import LoginRequiredModal from './LoginRequiredModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
  user: any;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, user }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 사용자가 로그인되어 있지 않으면 모달 표시
  useEffect(() => {
    if (!user) {
      setShowLoginModal(true);
    }
  }, [user]);

  if (!user) {
    return (
      <>
        <LoginRequiredModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={() => {
            setShowLoginModal(false);
            window.location.href = '/login';
          }}
        />
        <Navigate to="/" replace />
      </>
    );
  }

  // 로그인된 사용자는 페이지 접근 허용
  return <>{children}</>;
};

export default ProtectedRoute;
