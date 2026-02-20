import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminClaimProps {
  user: { id?: string; nickname?: string; role?: string } | null;
}

const AdminClaim: React.FC<AdminClaimProps> = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password.trim()) {
      setError('비밀번호를 입력하세요.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '인증에 실패했습니다.');
      if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/admin';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '비밀번호가 일치하지 않습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">관리자 권한 인증</h1>
        <p className="text-gray-600 mb-6">
          관리자 비밀번호를 입력하면 관리자 권한을 부여받고 관리자 페이지로 이동합니다.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="관리자 비밀번호"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '확인 중...' : '인증하고 관리자 페이지로 이동'}
          </button>
        </form>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-4 w-full py-2 text-gray-600 hover:text-gray-900 text-sm"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default AdminClaim;
