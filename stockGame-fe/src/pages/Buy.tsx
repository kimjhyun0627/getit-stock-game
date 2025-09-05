import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

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

  useEffect(() => {
    fetchStocks();
    fetchUserInfo();
  }, []);

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
                  <p className="text-sm text-gray-600">전일대비</p>
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

          {/* 수량 입력 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              매수 수량
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className="w-20 text-center border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleQuantityChange(1)}
                className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors"
              >
                +
              </button>
              <span className="text-sm text-gray-600">주</span>
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
            onClick={handleBuy}
            disabled={!selectedStock || !canAfford || isLoading}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
              !selectedStock || !canAfford || isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 btn-hover-effect'
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
