import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Newspaper, 
  TrendingUp, 
  Clock, 
  Plus,
  Edit, 
  Trash2,
  Trophy,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { apiFetch } from '../utils/api';

interface User {
  id: string;
  nickname?: string;
  name?: string;
  email?: string;
  role: string;
  balance?: number;
}

interface Stock {
  id: string;
  name: string;
  symbol: string;
  currentPrice: number;
  volume: number;
}

interface News {
  id: string;
  content: string;
  category: string;
  isPublished: boolean;
  publishYear?: number | null;
  reliability?: string | null;
}

interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  totalAssets: number;
  cashBalance: number;
  stockValue: number;
  rank: number;
  profitLoss: number;
  profitLossPercent: number;
  isVisible: boolean;
  lastUpdated: string;
}

// 주식 추가를 위한 폼 데이터
interface StockFormData {
  name: string;
  symbol: string;
  currentPrice: number;
  volume: number;
}

// 뉴스 추가를 위한 폼 데이터
interface NewsFormData {
  content: string;
  category: string;
  isPublished: boolean;
  publishYear: number | null;
  reliability: string | null;
}

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 주식 관리
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [showStockForm, setShowStockForm] = useState(false);
  const [priceHistoryStock, setPriceHistoryStock] = useState<Stock | null>(null);
  const [priceHistoryRows, setPriceHistoryRows] = useState<{ year: number; price: number }[]>([]);
  const [savingPriceHistory, setSavingPriceHistory] = useState(false);
  const [stockFormData, setStockFormData] = useState<StockFormData>({
    name: '',
    symbol: '',
    currentPrice: 0,
    volume: 0
  });

  // 뉴스 관리
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [newsFormData, setNewsFormData] = useState<NewsFormData>({
    content: '',
    category: 'all',
    isPublished: false,
    publishYear: null,
    reliability: null
  });
  const [newsCurrentYear, setNewsCurrentYear] = useState<number | null>(null);
  const [newsCurrentYearInput, setNewsCurrentYearInput] = useState('');
  const [savingYear, setSavingYear] = useState(false);

  // 시간 관리
  const [currentTime, setCurrentTime] = useState(new Date());
  const [gameStartYear, setGameStartYear] = useState<number | null>(null);
  const [gameEndYear, setGameEndYear] = useState<number | null>(null);
  const [gameStartYearInput, setGameStartYearInput] = useState('');
  const [gameEndYearInput, setGameEndYearInput] = useState('');
  const [savingGamePeriod, setSavingGamePeriod] = useState(false);

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, stocksRes, newsRes, leaderboardRes, yearRes, gamePeriodRes] = await Promise.all([
        apiFetch('/users'),
        apiFetch('/stocks'),
        apiFetch('/news'),
        apiFetch('/leaderboard/admin'),
        apiFetch('/admin/settings/news-current-year').catch(() => null),
        apiFetch('/admin/settings/game-period').catch(() => null)
      ]);

      const usersData = await usersRes.json();
      const stocksData = await stocksRes.json();
      const newsData = await newsRes.json();
      const leaderboardData = await leaderboardRes.json();
      if (yearRes != null && yearRes.ok) {
        const yearData = await yearRes.json();
        setNewsCurrentYear(yearData.currentYear);
        setNewsCurrentYearInput(String(yearData.currentYear));
      }
      if (gamePeriodRes != null && gamePeriodRes.ok) {
        const periodData = await gamePeriodRes.json();
        setGameStartYear(periodData.startYear);
        setGameEndYear(periodData.endYear);
        setGameStartYearInput(String(periodData.startYear));
        setGameEndYearInput(String(periodData.endYear));
      }
      
      setUsers(usersData || []);
      setStocks(stocksData || []);

      const sortedNews = (newsData || []).slice().sort((a: News, b: News) => {
        const yearA = a.publishYear ?? 9999;
        const yearB = b.publishYear ?? 9999;
        if (yearA !== yearB) return yearA - yearB;
        const relOrder: Record<string, number> = { ALL: 0, LOW: 1, MEDIUM: 2, HIGH: 3, YEAR_END: 4 };
        const relA = relOrder[a.reliability ?? ''] ?? 99;
        const relB = relOrder[b.reliability ?? ''] ?? 99;
        if (relA !== relB) return relA - relB;
        return (a.category ?? '').localeCompare(b.category ?? '');
      });
      setNews(sortedNews);
      setLeaderboard(leaderboardData || []);
    } catch {
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 사용자 관리 함수들
  const handleUserRoleChange = async (userId: string, newRole: string) => {
    try {
      await apiFetch(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      fetchData();
    } catch {
      setError('사용자 권한 변경에 실패했습니다.');
    }
  };

  const handleUserDelete = async (userId: string) => {
    if (!confirm('정말로 이 사용자를 삭제하시겠습니까?')) return;
    
    try {
      await apiFetch(`/users/${userId}`, { method: 'DELETE' });
      fetchData();
    } catch {
      setError('사용자 삭제에 실패했습니다.');
    }
  };

  // 주식 관리 함수들
  const handleStockCreate = async () => {
    try {
      const payload = {
        name: stockFormData.name?.trim() ?? '',
        symbol: stockFormData.symbol?.trim() ?? '',
        currentPrice: Number(stockFormData.currentPrice) || 0,
        volume: Number(stockFormData.volume) || 0,
      };
      await apiFetch('/stocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      fetchData();
      setShowStockForm(false);
      setStockFormData({ name: '', symbol: '', currentPrice: 0, volume: 0 });

      window.dispatchEvent(new CustomEvent('stocksUpdated'));
    } catch (err) {
      setError(err instanceof Error ? err.message : '주식 추가에 실패했습니다.');
    }
  };

  const handleStockUpdate = async (stockId: string, updates: Partial<Stock>) => {
    const validUpdates = {
      name: updates.name,
      symbol: updates.symbol,
      currentPrice: updates.currentPrice,
      volume: updates.volume
    };
    
    const cleanUpdates = Object.fromEntries(
      Object.entries(validUpdates).filter(([, value]) => value !== undefined)
    );
    
    try {
      await apiFetch(`/stocks/${stockId}`, {
        method: 'PUT',
        body: JSON.stringify(cleanUpdates)
      });
      fetchData();
      setEditingStock(null);
      window.dispatchEvent(new CustomEvent('stocksUpdated'));
    } catch {
      setError('주식 정보 업데이트에 실패했습니다.');
    }
  };

  const handleStockDelete = async (stockId: string) => {
    if (!confirm('정말로 이 주식을 삭제하시겠습니까?')) return;
    
    try {
      await apiFetch(`/stocks/${stockId}`, { method: 'DELETE' });
      fetchData();
      
      // 주식 데이터 변경 알림 - 뉴스 페이지 새로고침 트리거
      window.dispatchEvent(new CustomEvent('stocksUpdated'));
    } catch {
      setError('주식 삭제에 실패했습니다.');
    }
  };

  // 뉴스 관리 함수들
  const handleNewsCreate = async () => {
    if (newsFormData.category && newsFormData.category !== 'all') {
      const isValidCategory = stocks.some(stock => stock.symbol === newsFormData.category);
      
      if (!isValidCategory) {
        setError(`유효하지 않은 카테고리입니다: ${newsFormData.category}`);
        return;
      }
    }
    
    try {
      await apiFetch('/news', {
        method: 'POST',
        body: JSON.stringify(newsFormData)
      });
      fetchData();
      setShowNewsForm(false);
      setNewsFormData({ content: '', category: 'all', isPublished: false, publishYear: null, reliability: null });
    } catch {
      setError('뉴스 추가에 실패했습니다.');
    }
  };

  // 리더보드 관리 함수들
  const handleLeaderboardRefresh = async () => {
    try {
      await apiFetch('/leaderboard/admin/refresh', { method: 'POST' });
      fetchData();
    } catch {
      setError('리더보드 새로고침에 실패했습니다.');
    }
  };

  const handleUserVisibilityToggle = async (userId: string, isVisible: boolean) => {
    try {
      await apiFetch(`/leaderboard/admin/${userId}/visibility`, {
        method: 'PUT',
        body: JSON.stringify({ isVisible })
      });
      fetchData();
    } catch {
      setError('사용자 노출 여부 변경에 실패했습니다.');
    }
  };

  const handleNewsUpdate = async (newsId: string, updates: Partial<News>) => {
    if (updates.category && updates.category !== 'all') {
      const isValidCategory = stocks.some(stock => stock.symbol === updates.category);
      
      if (!isValidCategory) {
        setError(`유효하지 않은 카테고리입니다: ${updates.category}`);
        return;
      }
    }
    
    const validUpdates = {
      content: updates.content,
      category: updates.category,
      isPublished: updates.isPublished,
      publishYear: updates.publishYear,
      reliability: updates.reliability
    };
    
    const cleanUpdates = Object.fromEntries(
      Object.entries(validUpdates).filter(([, value]) => value !== undefined)
    );
    
    try {
      await apiFetch(`/news/${newsId}`, {
        method: 'PUT',
        body: JSON.stringify(cleanUpdates)
      });
      fetchData();
      setEditingNews(null);
    } catch {
      setError('뉴스 업데이트에 실패했습니다.');
    }
  };

  const handleNewsDelete = async (newsId: string) => {
    if (!confirm('정말로 이 뉴스를 삭제하시겠습니까?')) return;
    
    try {
      await apiFetch(`/news/${newsId}`, { method: 'DELETE' });
      fetchData();
    } catch {
      setError('뉴스 삭제에 실패했습니다.');
    }
  };

  const handleNewsPublish = async (newsId: string, isPublished: boolean) => {
    try {
      await apiFetch(`/news/${newsId}/publish`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished }),
      });
      fetchData();
    } catch {
      setError('뉴스 게시 상태 변경에 실패했습니다.');
    }
  };

  const tabs = [
    { id: 'users', label: '사용자 관리', icon: Users },
    { id: 'stocks', label: '주식 관리', icon: TrendingUp },
    { id: 'news', label: '뉴스 관리', icon: Newspaper },
    { id: 'leaderboard', label: '리더보드 관리', icon: Trophy },
    { id: 'time', label: '시간 관리', icon: Clock }
  ];

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
            onClick={() => setError(null)} 
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">관리자 대시보드</h1>
          <p className="text-gray-600">시스템 전체를 관리하고 모니터링하세요</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex space-x-1 p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {activeTab === 'users' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">사용자 관리</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용자</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">권한</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">잔액</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.nickname || user.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                            className="text-sm border border-gray-300 rounded-md px-2 py-1"
                          >
                            <option value="USER">일반 사용자</option>
                            <option value="ADMIN">관리자</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₩{user.balance?.toLocaleString() || '0'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleUserDelete(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'stocks' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">주식 관리</h2>
                <button
                  onClick={() => setShowStockForm(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>주식 추가</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stocks.map((stock) => (
                  <div key={stock.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{stock.name}</h3>
                        <p className="text-sm text-gray-500">{stock.symbol}</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <button
                          onClick={async () => {
                            setPriceHistoryStock(stock);
                            try {
                              const res = await apiFetch(`/admin/stocks/${stock.id}/price-history`);
                              const data = await res.json();
                              const existing = (data.prices || []) as { year: number; price: number }[];
                              const start = gameStartYear ?? 2022;
                              const end = gameEndYear ?? 2026;
                              const rows = [];
                              for (let y = start; y <= end; y++) {
                                const found = existing.find((p: { year: number }) => p.year === y);
                                rows.push({ year: y, price: found ? found.price : 0 });
                              }
                              setPriceHistoryRows(rows);
                            } catch {
                              const start = gameStartYear ?? 2022;
                              const end = gameEndYear ?? 2026;
                              setPriceHistoryRows(
                                Array.from({ length: end - start + 1 }, (_, i) => ({ year: start + i, price: 0 }))
                              );
                            }
                          }}
                          className="text-amber-600 hover:text-amber-800 text-xs px-2 py-1 border border-amber-300 rounded"
                        >
                          연도별 가격
                        </button>
                        <button
                          onClick={() => setEditingStock(stock)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStockDelete(stock.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">현재 가격:</span>
                        <span className="text-sm font-medium">₩{stock.currentPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">거래량:</span>
                        <span className="text-sm font-medium">{stock.volume.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'news' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">뉴스 관리</h2>
                <button
                  onClick={() => {
                    setNewsFormData({ content: '', category: 'all', isPublished: false, publishYear: null, reliability: null });
                    setShowNewsForm(true);
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>뉴스 추가</span>
                </button>
              </div>

              <div className="space-y-4">
                {news.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 mb-2 line-clamp-2">{item.content}</p>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.category === 'all' ? 'bg-gray-100 text-gray-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {item.category === 'all' ? '전체' : stocks.find(s => s.symbol === item.category)?.name || item.category}
                          </span>
                          <span>공개 연도: {item.publishYear != null ? `${item.publishYear}년` : '미설정'}</span>
                          <span>{item.isPublished ? '게시됨' : '비공개'}</span>
                          {item.reliability && (
                            <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800">
                              신뢰도: {item.reliability === 'HIGH' ? '상' : item.reliability === 'MEDIUM' ? '중' : item.reliability === 'LOW' ? '하' : item.reliability === 'ALL' ? '전체 공개' : item.reliability === 'YEAR_END' ? '전년도 결산' : item.reliability}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleNewsPublish(item.id, !item.isPublished)}
                          className={`px-2 py-1 text-xs rounded ${
                            item.isPublished
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {item.isPublished ? '비공개로' : '게시하기'}
                        </button>
                        <button onClick={() => setEditingNews(item)} className="text-blue-600 hover:text-blue-800">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleNewsDelete(item.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'time' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">시간 관리</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">현재 시간</h3>
                  <div className="text-3xl font-mono text-blue-800">
                    {currentTime.toLocaleString('ko-KR')}
                  </div>
                  <p className="text-sm text-blue-600 mt-2">
                    서버 시간: {new Date().toLocaleString('ko-KR')}
                  </p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">시스템 상태</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700">사용자 수:</span>
                      <span className="text-sm font-medium text-green-800">{users.length}명</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700">주식 종목:</span>
                      <span className="text-sm font-medium text-green-800">{stocks.length}개</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700">뉴스:</span>
                      <span className="text-sm font-medium text-green-800">{news.length}개</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">현재 연도</h3>
                  <p className="text-sm text-blue-800 mb-4">
                    이 연도에 따라 주식 표시 가격(연도별 가격)과 뉴스 공개 여부가 결정됩니다. 총 진행 연도 범위 내로 설정하세요.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="number"
                      min="2000"
                      max="2100"
                      value={newsCurrentYearInput}
                      onChange={(e) => setNewsCurrentYearInput(e.target.value)}
                      className="w-24 px-3 py-2 border border-blue-300 rounded-lg text-sm"
                    />
                    <span className="text-blue-800">년</span>
                    <button
                      disabled={savingYear}
                      onClick={async () => {
                        const y = parseInt(newsCurrentYearInput, 10);
                        if (Number.isNaN(y) || y < 2000 || y > 2100) {
                          setError('2000~2100 사이 연도를 입력하세요.');
                          return;
                        }
                        setSavingYear(true);
                        try {
                          const res = await apiFetch('/admin/settings/news-current-year', {
                            method: 'PUT',
                            body: JSON.stringify({ currentYear: y }),
                          });
                          const data = await res.json();
                          setNewsCurrentYear(data.currentYear);
                          setNewsCurrentYearInput(String(data.currentYear));
                          setError(null);
                        } catch {
                          setError('현재 연도 저장에 실패했습니다.');
                        } finally {
                          setSavingYear(false);
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                    >
                      {savingYear ? '저장 중…' : '저장'}
                    </button>
                    {newsCurrentYear != null && (
                      <span className="text-sm text-blue-700">현재 적용: {newsCurrentYear}년</span>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 bg-amber-50 border border-amber-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">주식 게임 총 진행 연도</h3>
                  <p className="text-sm text-amber-800 mb-4">
                    게임에서 사용하는 연도 범위(예: 2022~2026). 뉴스 범위 및 이후 주가 이력 기능에 사용됩니다.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="number"
                      min="2000"
                      max="2100"
                      value={gameStartYearInput}
                      onChange={(e) => setGameStartYearInput(e.target.value)}
                      className="w-24 px-3 py-2 border border-amber-300 rounded-lg text-sm"
                    />
                    <span className="text-amber-800 font-medium">~</span>
                    <input
                      type="number"
                      min="2000"
                      max="2100"
                      value={gameEndYearInput}
                      onChange={(e) => setGameEndYearInput(e.target.value)}
                      className="w-24 px-3 py-2 border border-amber-300 rounded-lg text-sm"
                    />
                    <span className="text-amber-800">년</span>
                    <button
                      disabled={savingGamePeriod}
                      onClick={async () => {
                        const start = parseInt(gameStartYearInput, 10);
                        const end = parseInt(gameEndYearInput, 10);
                        if (Number.isNaN(start) || Number.isNaN(end) || start < 2000 || start > 2100 || end < 2000 || end > 2100) {
                          setError('시작·종료 연도를 2000~2100 사이로 입력하세요.');
                          return;
                        }
                        if (start > end) {
                          setError('시작 연도는 종료 연도보다 크지 않아야 합니다.');
                          return;
                        }
                        setSavingGamePeriod(true);
                        try {
                          const res = await apiFetch('/admin/settings/game-period', {
                            method: 'PUT',
                            body: JSON.stringify({ startYear: start, endYear: end }),
                          });
                          const data = await res.json();
                          setGameStartYear(data.startYear);
                          setGameEndYear(data.endYear);
                          setGameStartYearInput(String(data.startYear));
                          setGameEndYearInput(String(data.endYear));
                          setError(null);
                        } catch {
                          setError('총 진행 연도 저장에 실패했습니다.');
                        } finally {
                          setSavingGamePeriod(false);
                        }
                      }}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 text-sm"
                    >
                      {savingGamePeriod ? '저장 중…' : '저장'}
                    </button>
                    {gameStartYear != null && gameEndYear != null && (
                      <span className="text-sm text-amber-700">현재 적용: {gameStartYear}년 ~ {gameEndYear}년</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">리더보드 관리</h2>
                <button
                  onClick={handleLeaderboardRefresh}
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
                          <div className="text-sm text-gray-600">
                            ₩{entry.cashBalance.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            ₩{entry.stockValue.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${
                            entry.profitLoss > 0 ? 'text-green-600' : 
                            entry.profitLoss < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {entry.profitLoss > 0 ? '+' : ''}₩{entry.profitLoss.toLocaleString()}
                          </div>
                          <div className={`text-xs ${
                            entry.profitLoss > 0 ? 'text-green-600' : 
                            entry.profitLoss < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            ({entry.profitLossPercent > 0 ? '+' : ''}{entry.profitLossPercent.toFixed(2)}%)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {entry.isVisible ? (
                              <Eye className="w-4 h-4 text-green-600" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-red-600" />
                            )}
                            <span className={`text-sm ${
                              entry.isVisible ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {entry.isVisible ? '노출' : '숨김'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleUserVisibilityToggle(entry.userId, !entry.isVisible)}
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
          )}
        </div>
      </div>

      {/* 주식 추가 모달 */}
      {showStockForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">주식 추가</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">종목명</label>
                <input
                  type="text"
                  value={stockFormData.name}
                  onChange={(e) => setStockFormData({...stockFormData, name: e.target.value})}
                  placeholder="예: 삼성전자"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">심볼</label>
                <input
                  type="text"
                  value={stockFormData.symbol}
                  onChange={(e) => setStockFormData({...stockFormData, symbol: e.target.value})}
                  placeholder="예: 000000"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">초기 가격</label>
                <input
                  type="number"
                  value={stockFormData.currentPrice}
                  onChange={(e) => setStockFormData({...stockFormData, currentPrice: Number(e.target.value)})}
                  placeholder="예: 50000"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">초기 거래량</label>
                <input
                  type="number"
                  value={stockFormData.volume}
                  onChange={(e) => setStockFormData({...stockFormData, volume: Number(e.target.value)})}
                  placeholder="예: 1000000"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleStockCreate}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                추가
              </button>
              <button
                onClick={() => setShowStockForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 주식 수정 모달 */}
      {editingStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">주식 정보 수정</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">종목명</label>
                <input
                  type="text"
                  value={editingStock.name}
                  onChange={(e) => setEditingStock({...editingStock, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">현재 가격</label>
                <input
                  type="number"
                  value={editingStock.currentPrice}
                  onChange={(e) => setEditingStock({...editingStock, currentPrice: Number(e.target.value)})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">거래량</label>
                <input
                  type="number"
                  value={editingStock.volume}
                  onChange={(e) => setEditingStock({...editingStock, volume: Number(e.target.value)})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => handleStockUpdate(editingStock.id, editingStock)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                저장
              </button>
              <button
                onClick={() => setEditingStock(null)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 연도별 가격 모달 */}
      {priceHistoryStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-auto">
            <h3 className="text-lg font-semibold mb-2">연도별 가격 · {priceHistoryStock.name}</h3>
            <p className="text-sm text-gray-500 mb-4">총 진행 연도 범위 내 가격을 입력하세요.</p>
            <div className="space-y-2 mb-6">
              {priceHistoryRows.map((row, idx) => (
                <div key={row.year} className="flex items-center gap-3">
                  <span className="w-14 text-sm font-medium text-gray-700">{row.year}년</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={row.price || ''}
                    onChange={(e) => {
                      const next = [...priceHistoryRows];
                      next[idx] = { ...next[idx], price: Number(e.target.value) || 0 };
                      setPriceHistoryRows(next);
                    }}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <span className="text-sm text-gray-500">원</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                disabled={savingPriceHistory}
                onClick={async () => {
                  setSavingPriceHistory(true);
                  try {
                    await apiFetch(`/admin/stocks/${priceHistoryStock.id}/price-history`, {
                      method: 'PUT',
                      body: JSON.stringify({ prices: priceHistoryRows }),
                    });
                    setPriceHistoryStock(null);
                    setError(null);
                  } catch {
                    setError('연도별 가격 저장에 실패했습니다.');
                  } finally {
                    setSavingPriceHistory(false);
                  }
                }}
                className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50"
              >
                {savingPriceHistory ? '저장 중…' : '저장'}
              </button>
              <button
                onClick={() => { setPriceHistoryStock(null); setError(null); }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 뉴스 추가 모달 */}
      {showNewsForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">뉴스 추가</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                <textarea
                  value={newsFormData.content}
                  onChange={(e) => setNewsFormData({...newsFormData, content: e.target.value})}
                  placeholder="뉴스 내용을 입력하세요"
                  rows={8}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                <select 
                  value={newsFormData.category}
                  onChange={(e) => setNewsFormData({...newsFormData, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="all">전체</option>
                  {stocks.map((stock) => (
                    <option key={stock.symbol} value={stock.symbol}>
                      {stock.name} ({stock.symbol})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">공개 연도</label>
                <select
                  value={newsFormData.publishYear ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNewsFormData({ ...newsFormData, publishYear: v === '' ? null : parseInt(v, 10) });
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">미설정</option>
                  {Array.from(
                    { length: (gameEndYear ?? 2026) - (gameStartYear ?? 2022) + 1 },
                    (_, i) => (gameStartYear ?? 2022) + i
                  ).map((y) => (
                    <option key={y} value={y}>{y}년</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">신뢰도</label>
                <select
                  value={newsFormData.reliability ?? ''}
                  onChange={(e) => setNewsFormData({ ...newsFormData, reliability: e.target.value || null })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">선택</option>
                  <option value="HIGH">상</option>
                  <option value="MEDIUM">중</option>
                  <option value="LOW">하</option>
                  <option value="ALL">전체 공개</option>
                  <option value="YEAR_END">전년도 결산</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={newsFormData.isPublished}
                  onChange={(e) => setNewsFormData({...newsFormData, isPublished: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                  즉시 게시
                </label>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleNewsCreate}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                추가
              </button>
              <button
                onClick={() => setShowNewsForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 뉴스 수정 모달 */}
      {editingNews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">뉴스 수정</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                <textarea
                  value={editingNews.content}
                  onChange={(e) => setEditingNews({...editingNews, content: e.target.value})}
                  rows={8}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                <select 
                  value={editingNews.category}
                  onChange={(e) => setEditingNews({...editingNews, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="all">전체</option>
                  {stocks.map((stock) => (
                    <option key={stock.symbol} value={stock.symbol}>
                      {stock.name} ({stock.symbol})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">공개 연도</label>
                <select
                  value={editingNews.publishYear ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    setEditingNews({ ...editingNews, publishYear: v === '' ? null : parseInt(v, 10) });
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">미설정</option>
                  {Array.from(
                    { length: (gameEndYear ?? 2026) - (gameStartYear ?? 2022) + 1 },
                    (_, i) => (gameStartYear ?? 2022) + i
                  ).map((y) => (
                    <option key={y} value={y}>{y}년</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">신뢰도</label>
                <select
                  value={editingNews.reliability ?? ''}
                  onChange={(e) => setEditingNews({ ...editingNews, reliability: e.target.value || null })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">선택</option>
                  <option value="HIGH">상</option>
                  <option value="MEDIUM">중</option>
                  <option value="LOW">하</option>
                  <option value="ALL">전체 공개</option>
                  <option value="YEAR_END">전년도 결산</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => handleNewsUpdate(editingNews.id, editingNews)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                저장
              </button>
              <button
                onClick={() => setEditingNews(null)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;

