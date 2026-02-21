import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface PricePoint {
  year: number;
  price: number;
}

const PAD = 32;

function PriceLineChart({ data, height }: { data: PricePoint[]; height: number }) {
  const [selected, setSelected] = useState<PricePoint | null>(null);
  if (data.length === 0) return null;
  const minYear = Math.min(...data.map((d) => d.year));
  const maxYear = Math.max(...data.map((d) => d.year));
  const minPrice = Math.min(...data.map((d) => d.price));
  const maxPrice = Math.max(...data.map((d) => d.price));
  const rangeYear = maxYear - minYear || 1;
  const rangePrice = maxPrice - minPrice || 1;
  const w = 400;
  const h = height - PAD * 2;
  const points = data
    .map((d) => {
      const x = PAD + ((d.year - minYear) / rangeYear) * (w - PAD * 2);
      const y = PAD + h - ((d.price - minPrice) / rangePrice) * h;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w + PAD * 2} ${height}`} className="w-full" style={{ maxHeight: height }} preserveAspectRatio="xMidYMid meet">
      {data.length >= 2 && (
        <polyline
          fill="none"
          stroke="rgb(34, 197, 94)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      )}
      {selected && (() => {
        const x = PAD + ((selected.year - minYear) / rangeYear) * (w - PAD * 2);
        const y = PAD + h - ((selected.price - minPrice) / rangePrice) * h;
        const label = `${selected.year}년: ₩${selected.price.toLocaleString()}`;
        const tw = label.length * 6 + 16;
        const th = 22;
        const tx = Math.max(8, Math.min(w + PAD * 2 - tw - 8, x - tw / 2));
        const ty = Math.max(4, y - th - 10);
        return (
          <g>
            <rect x={tx} y={ty} width={tw} height={th} rx={4} fill="#1f2937" fillOpacity={0.95} />
            <text x={tx + tw / 2} y={ty + th / 2 + 4} textAnchor="middle" fontSize="11" fill="white">
              {label}
            </text>
          </g>
        );
      })()}
      {data.map((d) => {
        const x = PAD + ((d.year - minYear) / rangeYear) * (w - PAD * 2);
        const y = PAD + h - ((d.price - minPrice) / rangePrice) * h;
        const isSelected = selected?.year === d.year;
        return (
          <g
            key={d.year}
            onClick={(e) => {
              e.stopPropagation();
              setSelected((prev) => (prev?.year === d.year ? null : d));
            }}
            style={{ cursor: 'pointer' }}
          >
            <circle cx={x} cy={y} r="6" fill="transparent" />
            <circle cx={x} cy={y} r="4" fill="rgb(34, 197, 94)" stroke={isSelected ? '#166534' : 'none'} strokeWidth="2" />
            <text x={x} y={height - 4} textAnchor="middle" fontSize="10" fill="#6b7280">
              {d.year}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

interface Stock {
  id: string;
  name: string;
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
}

interface User {
  id: string;
  name: string;
  balance: number;
}

const Buy: React.FC = () => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [gameStartYear, setGameStartYear] = useState<number | null>(null);
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);

  useEffect(() => {
    fetchStocks();
    fetchUserInfo();
  }, []);

  useEffect(() => {
    const fetchYearAndPeriod = async () => {
      try {
        const [yearRes, periodRes] = await Promise.all([
          apiFetch('/news/current-year'),
          apiFetch('/news/game-period').catch(() => null),
        ]);
        if (yearRes.ok) {
          const data = await yearRes.json();
          setCurrentYear(data.currentYear ?? null);
        }
        if (periodRes?.ok) {
          const period = await periodRes.json();
          setGameStartYear(period.startYear ?? null);
        }
      } catch {
        setCurrentYear(null);
        setGameStartYear(null);
      }
    };
    fetchYearAndPeriod();
  }, []);

  useEffect(() => {
    if (!selectedStock) {
      setPriceHistory([]);
      return;
    }
    const fetchPriceHistory = async () => {
      try {
        const res = await apiFetch(`/stocks/${selectedStock}/price-history`);
        if (res.ok) {
          const data = await res.json();
          const list: PricePoint[] = Array.isArray(data.prices) ? data.prices : [];
          setPriceHistory(list);
        } else {
          setPriceHistory([]);
        }
      } catch {
        setPriceHistory([]);
      }
    };
    fetchPriceHistory();
  }, [selectedStock]);

  const fetchStocks = async () => {
    try {
      const response = await apiFetch('/stocks');
      if (response.ok) {
        const stocksData = await response.json();
        setStocks(stocksData);
        if (stocksData.length > 0) {
          setSelectedStock(stocksData[0].id);
        }
      }
    } catch (error) {
      console.error('주식 정보를 가져오는데 실패했습니다:', error);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
      }
    } catch (error) {
      console.error('사용자 정보를 가져오는데 실패했습니다:', error);
    }
  };

  const handleQuantityChange = (value: number) => {
    const newQuantity = Math.max(1, quantity + value);
    setQuantity(newQuantity);
  };

  const handleBuy = async () => {
    if (!selectedStock || quantity <= 0) {
      setError('주식과 수량을 선택해주세요.');
      return;
    }

    const stock = stocks.find(s => s.id === selectedStock);
    if (!stock) {
      setError('주식을 찾을 수 없습니다.');
      return;
    }

    const totalCost = stock.currentPrice * quantity;
    if (user && user.balance < totalCost) {
      setError('잔고가 부족합니다.');
      return;
    }

    // JWT 토큰 확인
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('로그인이 필요합니다. 다시 로그인해주세요.');
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiFetch('/portfolios/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stockId: selectedStock,
          quantity: quantity,
          price: stock.currentPrice,
        }),
      });

      if (response.ok) {
        await response.json();
        setShowSuccess(true);
        
        // 사용자 잔고 업데이트
        if (user) {
          const newBalance = user.balance - totalCost;
          setUser({ ...user, balance: newBalance });
          localStorage.setItem('user', JSON.stringify({ ...user, balance: newBalance }));
        }
        
        // 2초 후 홈으로 이동
        setTimeout(() => {
          navigate('/portfolio');
        }, 1500);
      } else {
        const errorData = await response.json();
        if (response.status === 401) {
          setError('로그인이 만료되었습니다. 다시 로그인해주세요.');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          setError(`매수 실패: ${errorData.message || '알 수 없는 오류가 발생했습니다.'}`);
        }
      }
    } catch (error) {
      console.error('매수 중 오류 발생:', error);
      if (error instanceof Error && error.message.includes('인증이 만료')) {
        navigate('/login');
      } else {
        setError('매수 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectedStockData = selectedStock ? stocks.find(s => s.id === selectedStock) : null;
  const totalAmount = selectedStockData ? selectedStockData.currentPrice * quantity : 0;
  const canAfford = user ? totalAmount <= user.balance : false;

  const chartData = useMemo(() => {
    if (currentYear == null) return [];
    const start = gameStartYear ?? currentYear;
    const years = Array.from(
      { length: Math.max(0, currentYear - start + 1) },
      (_, i) => start + i,
    );
    const byYear = new Map(priceHistory.filter((p) => p.year <= currentYear).map((p) => [p.year, p.price]));
    return years.map((year) => ({ year, price: byYear.get(year) ?? 0 }));
  }, [currentYear, gameStartYear, priceHistory]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR');
  };

  const formatBalance = (balance: number) => {
    return balance.toLocaleString('ko-KR');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">주식 매수</h1>
              <p className="text-gray-600">원하는 주식을 선택하고 매수하세요</p>
            </div>
          </div>
          
          {/* 잔액 정보 */}
          {user && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-800">보유 현금</span>
                <span className="text-lg font-bold text-blue-900">
                  {formatBalance(user.balance)}원
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 매수 폼 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">매수 정보 입력</h2>
          
          {/* 주식 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주식 선택
            </label>
            <select
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {stocks.map((stock) => (
                <option key={stock.id} value={stock.id}>
                  {stock.name} ({stock.symbol}) - {formatPrice(stock.currentPrice)}원
                </option>
              ))}
            </select>
          </div>

          {/* 선택된 주식 정보 */}
          {selectedStockData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">종목명</p>
                  <p className="font-semibold text-gray-900">{selectedStockData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">현재가</p>
                  <p className="font-semibold text-gray-900">{formatPrice(selectedStockData.currentPrice)}원</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">전년 대비</p>
                  <p className={`font-semibold ${
                    selectedStockData.change > 0 ? 'text-green-600' :
                    selectedStockData.change < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {selectedStockData.change > 0 ? '+' : ''}{formatPrice(selectedStockData.change)}원
                    ({selectedStockData.changePercent > 0 ? '+' : ''}{selectedStockData.changePercent.toFixed(2)}%)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">거래량</p>
                  <p className="font-semibold text-gray-900">{(selectedStockData.volume / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </div>
          )}

          {/* 연도별 가격 선형 그래프 (게임 시작~현재 연도, 없으면 0으로 표시) */}
          {selectedStockData && chartData.length >= 1 && currentYear != null && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                연도별 주가 ({chartData[0].year}년 ~ {currentYear}년)
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <PriceLineChart data={chartData} height={200} />
              </div>
            </div>
          )}

          {/* 수량 입력 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              매수 수량
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleQuantityChange(-1)}
                className="min-w-[44px] min-h-[44px] w-11 h-11 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 active:scale-95 transition-transform touch-manipulation text-lg font-medium"
                aria-label="수량 감소"
              >
                −
              </button>
              <input
                type="number"
                inputMode="numeric"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className="w-20 min-h-[44px] text-center border border-gray-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => handleQuantityChange(1)}
                className="min-w-[44px] min-h-[44px] w-11 h-11 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 active:scale-95 transition-transform touch-manipulation text-lg font-medium"
                aria-label="수량 증가"
              >
                +
              </button>
              <span className="text-sm sm:text-base text-gray-600">주</span>
            </div>
          </div>

          {/* 매수 금액 */}
          {selectedStockData && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-800">매수 금액</span>
                <span className="text-xl font-bold text-blue-900">
                  {formatPrice(totalAmount)}원
                </span>
              </div>
              <div className="mt-2 text-sm text-blue-700">
                {canAfford ? (
                  <span className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    매수 가능합니다
                  </span>
                ) : (
                  <span className="flex items-center text-red-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    잔액이 부족합니다
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 매수 버튼 */}
          <button
            type="button"
            onClick={handleBuy}
            disabled={!selectedStock || !canAfford || isLoading}
            className={`w-full min-h-[48px] py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 touch-manipulation active:scale-[0.98] ${
              !selectedStock || !canAfford || isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl sm:hover:scale-[1.02] sm:hover:-translate-y-0.5'
            }`}
          >
            {isLoading ? '매수 처리 중...' : '매수하기'}
          </button>
        </div>

        {/* 성공 메시지 */}
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center space-x-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">매수가 성공적으로 완료되었습니다!</span>
            </div>
            <p className="text-sm text-green-600 mt-1">포트폴리오로 이동합니다...</p>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center space-x-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Buy;
