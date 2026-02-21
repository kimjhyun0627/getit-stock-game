import React from 'react';
import { Users, Newspaper, TrendingUp, Clock, Trophy } from 'lucide-react';
import { useAdminData } from '../hooks/useAdminData';
import {
  UsersTab,
  StocksTab,
  NewsTab,
  LeaderboardTab,
  TimeTab,
} from '../components/Admin';

const tabs = [
  { id: 'users', label: '사용자 관리', icon: Users },
  { id: 'stocks', label: '주식 관리', icon: TrendingUp },
  { id: 'news', label: '뉴스 관리', icon: Newspaper },
  { id: 'leaderboard', label: '리더보드 관리', icon: Trophy },
  { id: 'time', label: '시간 관리', icon: Clock },
];

const Admin: React.FC = () => {
  const admin = useAdminData();
  const {
    activeTab,
    setActiveTab,
    users,
    stocks,
    news,
    leaderboard,
    loading,
    error,
    setError,
    currentTime,
    gameStartYear,
    gameEndYear,
    newsCurrentYear,
    editingStock,
    setEditingStock,
    showStockForm,
    setShowStockForm,
    stockFormData,
    setStockFormData,
    priceHistoryStock,
    setPriceHistoryStock,
    priceHistoryRows,
    setPriceHistoryRows,
    savingPriceHistory,
    editingNews,
    setEditingNews,
    showNewsForm,
    setShowNewsForm,
    newsFormData,
    setNewsFormData,
    newsCurrentYearInput,
    setNewsCurrentYearInput,
    savingYear,
    gameStartYearInput,
    setGameStartYearInput,
    gameEndYearInput,
    setGameEndYearInput,
    savingGamePeriod,
    handleUserRoleChange,
    handleUserDelete,
    handleStockCreate,
    handleStockUpdate,
    handleStockDelete,
    openPriceHistory,
    savePriceHistory,
    handleNewsCreate,
    handleLeaderboardRefresh,
    handleUserVisibilityToggle,
    handleNewsUpdate,
    handleNewsDelete,
    handleNewsPublish,
    saveNewsCurrentYear,
    saveGamePeriod,
  } = admin;

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">관리자 대시보드</h1>
          <p className="text-gray-600">시스템 전체를 관리하고 모니터링하세요</p>
        </div>

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

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {activeTab === 'users' && (
            <UsersTab
              users={users}
              onRoleChange={handleUserRoleChange}
              onDelete={handleUserDelete}
            />
          )}
          {activeTab === 'stocks' && (
            <StocksTab
              stocks={stocks}
              onAddClick={() => setShowStockForm(true)}
              onPriceHistory={openPriceHistory}
              onEdit={setEditingStock}
              onDelete={handleStockDelete}
            />
          )}
          {activeTab === 'news' && (
            <NewsTab
              news={news}
              stocks={stocks}
              onAddClick={() => {
                setNewsFormData({
                  content: '',
                  category: 'all',
                  isPublished: false,
                  publishYear: null,
                  reliability: null,
                });
                setShowNewsForm(true);
              }}
              onPublish={handleNewsPublish}
              onEdit={setEditingNews}
              onDelete={handleNewsDelete}
            />
          )}
          {activeTab === 'leaderboard' && (
            <LeaderboardTab
              leaderboard={leaderboard}
              onRefresh={handleLeaderboardRefresh}
              onVisibilityToggle={handleUserVisibilityToggle}
            />
          )}
          {activeTab === 'time' && (
            <TimeTab
              currentTime={currentTime}
              usersCount={users.length}
              stocksCount={stocks.length}
              newsCount={news.length}
              newsCurrentYearInput={newsCurrentYearInput}
              onNewsCurrentYearChange={setNewsCurrentYearInput}
              onSaveNewsCurrentYear={saveNewsCurrentYear}
              savingYear={savingYear}
              newsCurrentYear={newsCurrentYear}
              gameStartYearInput={gameStartYearInput}
              gameEndYearInput={gameEndYearInput}
              onGameStartYearChange={setGameStartYearInput}
              onGameEndYearChange={setGameEndYearInput}
              onSaveGamePeriod={saveGamePeriod}
              savingGamePeriod={savingGamePeriod}
              gameStartYear={gameStartYear}
              gameEndYear={gameEndYear}
            />
          )}
        </div>
      </div>

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
                  onChange={(e) => setStockFormData({ ...stockFormData, name: e.target.value })}
                  placeholder="예: 삼성전자"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">심볼</label>
                <input
                  type="text"
                  value={stockFormData.symbol}
                  onChange={(e) => setStockFormData({ ...stockFormData, symbol: e.target.value })}
                  placeholder="예: 000000"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">초기 가격</label>
                <input
                  type="number"
                  value={stockFormData.currentPrice}
                  onChange={(e) =>
                    setStockFormData({ ...stockFormData, currentPrice: Number(e.target.value) })
                  }
                  placeholder="예: 50000"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">초기 거래량</label>
                <input
                  type="number"
                  value={stockFormData.volume}
                  onChange={(e) =>
                    setStockFormData({ ...stockFormData, volume: Number(e.target.value) })
                  }
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
                  onChange={(e) => setEditingStock({ ...editingStock, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">현재 가격</label>
                <input
                  type="number"
                  value={editingStock.currentPrice}
                  onChange={(e) =>
                    setEditingStock({
                      ...editingStock,
                      currentPrice: Number(e.target.value),
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">거래량</label>
                <input
                  type="number"
                  value={editingStock.volume}
                  onChange={(e) =>
                    setEditingStock({ ...editingStock, volume: Number(e.target.value) })
                  }
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

      {priceHistoryStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-auto">
            <h3 className="text-lg font-semibold mb-2">
              연도별 가격 · {priceHistoryStock.name}
            </h3>
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
                onClick={savePriceHistory}
                className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50"
              >
                {savingPriceHistory ? '저장 중…' : '저장'}
              </button>
              <button
                onClick={() => {
                  setPriceHistoryStock(null);
                  setError(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewsForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">뉴스 추가</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                <textarea
                  value={newsFormData.content}
                  onChange={(e) =>
                    setNewsFormData({ ...newsFormData, content: e.target.value })
                  }
                  placeholder="뉴스 내용을 입력하세요"
                  rows={8}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                <select
                  value={newsFormData.category}
                  onChange={(e) =>
                    setNewsFormData({ ...newsFormData, category: e.target.value })
                  }
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
                    setNewsFormData({
                      ...newsFormData,
                      publishYear: v === '' ? null : parseInt(v, 10),
                    });
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">미설정</option>
                  {Array.from(
                    {
                      length:
                        (gameEndYear ?? 2026) - (gameStartYear ?? 2022) + 1,
                    },
                    (_, i) => (gameStartYear ?? 2022) + i,
                  ).map((y) => (
                    <option key={y} value={y}>
                      {y}년
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">신뢰도</label>
                <select
                  value={newsFormData.reliability ?? ''}
                  onChange={(e) =>
                    setNewsFormData({
                      ...newsFormData,
                      reliability: e.target.value || null,
                    })
                  }
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
                  onChange={(e) =>
                    setNewsFormData({ ...newsFormData, isPublished: e.target.checked })
                  }
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

      {editingNews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">뉴스 수정</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                <textarea
                  value={editingNews.content}
                  onChange={(e) =>
                    setEditingNews({ ...editingNews, content: e.target.value })
                  }
                  rows={8}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                <select
                  value={editingNews.category}
                  onChange={(e) =>
                    setEditingNews({ ...editingNews, category: e.target.value })
                  }
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
                    setEditingNews({
                      ...editingNews,
                      publishYear: v === '' ? null : parseInt(v, 10),
                    });
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">미설정</option>
                  {Array.from(
                    {
                      length:
                        (gameEndYear ?? 2026) - (gameStartYear ?? 2022) + 1,
                    },
                    (_, i) => (gameStartYear ?? 2022) + i,
                  ).map((y) => (
                    <option key={y} value={y}>
                      {y}년
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">신뢰도</label>
                <select
                  value={editingNews.reliability ?? ''}
                  onChange={(e) =>
                    setEditingNews({
                      ...editingNews,
                      reliability: e.target.value || null,
                    })
                  }
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
