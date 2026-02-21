import { RefreshCw, Trophy, Eye, EyeOff } from 'lucide-react';
import type { LeaderboardEntry } from '../../hooks/useAdminData';

interface LeaderboardTabProps {
  leaderboard: LeaderboardEntry[];
  onRefresh: () => void;
  onVisibilityToggle: (userId: string, isVisible: boolean) => void;
}

export function LeaderboardTab({
  leaderboard,
  onRefresh,
  onVisibilityToggle,
}: LeaderboardTabProps) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">리더보드 관리</h2>
        <button
          onClick={onRefresh}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>강제 새로고침</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">순위</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용자</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총 자산</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">현금</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주식 가치</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수익/손실</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">노출 여부</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboard.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-lg font-bold text-gray-900">#{entry.rank}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{entry.username}</div>
                  <div className="text-sm text-gray-500">ID: {entry.userId.slice(0, 8)}...</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">
                    ₩{entry.totalAssets.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">₩{entry.cashBalance.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">₩{entry.stockValue.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className={`text-sm font-medium ${
                      entry.profitLoss > 0
                        ? 'text-green-600'
                        : entry.profitLoss < 0
                          ? 'text-red-600'
                          : 'text-gray-600'
                    }`}
                  >
                    {entry.profitLoss > 0 ? '+' : ''}₩{entry.profitLoss.toLocaleString()}
                  </div>
                  <div
                    className={`text-xs ${
                      entry.profitLoss > 0
                        ? 'text-green-600'
                        : entry.profitLoss < 0
                          ? 'text-red-600'
                          : 'text-gray-600'
                    }`}
                  >
                    ({entry.profitLossPercent > 0 ? '+' : ''}
                    {entry.profitLossPercent.toFixed(2)}%)
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {entry.isVisible ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-red-600" />
                    )}
                    <span
                      className={`text-sm ${
                        entry.isVisible ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {entry.isVisible ? '노출' : '숨김'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onVisibilityToggle(entry.userId, !entry.isVisible)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      entry.isVisible
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {entry.isVisible ? '숨기기' : '노출하기'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {leaderboard.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">아직 리더보드 데이터가 없습니다</p>
          <p className="text-sm">사용자들이 주식을 거래하면 순위가 표시됩니다.</p>
        </div>
      )}
    </div>
  );
}
