import React, { useEffect, useState } from 'react';
import { Trophy, TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react';
import { apiFetch } from '../utils/api';

interface LeaderboardEntry {
  id: string;
  username: string;
  totalAssets: number;
  cashBalance: number;
  stockValue: number;
  rank: number;
  profitLoss: number;
  profitLossPercent: number;
  lastUpdated: string;
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/leaderboard');
      const data = response.json ? await response.json() : response;
      
      // 데이터가 배열인지 확인
      if (Array.isArray(data)) {
        setLeaderboard(data);
        if (data.length > 0) {
          setLastUpdated(data[0].lastUpdated);
        }
      } else {
        console.error('리더보드 데이터가 배열이 아닙니다:', data);
        setLeaderboard([]);
        setError('리더보드 데이터 형식이 올바르지 않습니다.');
      }
    } catch (err) {
      console.error('리더보드 조회 실패:', err);
      setError('리더보드를 불러오는데 실패했습니다.');
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    
    // 5분마다 자동 새로고침
    const interval = setInterval(fetchLeaderboard, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Trophy className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-6 h-6 text-amber-600" />;
    return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
  };

  const getProfitLossColor = (profitLoss: number) => {
    if (profitLoss > 0) return 'text-green-600';
    if (profitLoss < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getProfitLossIcon = (profitLoss: number) => {
    if (profitLoss > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (profitLoss < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchLeaderboard} 
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏆 주식 게임 리더보드
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            실시간 자산 순위를 확인하세요
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>마지막 업데이트: {lastUpdated ? formatDate(lastUpdated) : '업데이트 중...'}</span>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Trophy className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 참가자</p>
                <p className="text-2xl font-bold text-gray-900">{leaderboard.length}명</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">1위 자산</p>
                <p className="text-2xl font-bold text-gray-900">
                  {leaderboard.length > 0 ? formatPrice(leaderboard[0].totalAssets) : '0'}원
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">평균 자산</p>
                <p className="text-2xl font-bold text-gray-900">
                  {leaderboard.length > 0 
                    ? formatPrice(Math.round(leaderboard.reduce((sum, entry) => sum + entry.totalAssets, 0) / leaderboard.length))
                    : '0'}원
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">자동 업데이트</p>
                <p className="text-2xl font-bold text-gray-900">5분</p>
              </div>
            </div>
          </div>
        </div>

        {/* 리더보드 테이블 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">순위표</h2>
          </div>
          
          {leaderboard.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">아직 리더보드 데이터가 없습니다</p>
              <p className="text-sm">사용자들이 주식을 거래하면 순위가 표시됩니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      순위
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      사용자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      총 자산
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      현금
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      주식 가치
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      수익/손실
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboard.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getRankIcon(entry.rank)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {entry.username}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {formatPrice(entry.totalAssets)}원
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {formatPrice(entry.cashBalance)}원
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {formatPrice(entry.stockValue)}원
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getProfitLossIcon(entry.profitLoss)}
                          <div className={`text-sm font-medium ${getProfitLossColor(entry.profitLoss)}`}>
                            {entry.profitLoss > 0 ? '+' : ''}{formatPrice(entry.profitLoss)}원
                          </div>
                          <div className={`text-xs ${getProfitLossColor(entry.profitLoss)}`}>
                            ({entry.profitLossPercent > 0 ? '+' : ''}{entry.profitLossPercent.toFixed(2)}%)
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 새로고침 버튼 */}
        <div className="text-center mt-8">
          <button
            onClick={fetchLeaderboard}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 btn-hover-effect"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>새로고침</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
