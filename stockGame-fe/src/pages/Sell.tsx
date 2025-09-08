import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { TrendingDown, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';

interface PortfolioItem {
  stockId: string;
  stockName: string;
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

interface User {
  id: string;
  name: string;
  balance: number;
}

const Sell: React.FC = () => {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [sellQuantity, setSellQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchPortfolio();
    fetchUserInfo();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await apiFetch('/portfolios');
      if (response.ok) {
        const portfolioData = await response.json();

        setPortfolio(portfolioData);
      }
    } catch (error) {
      console.error('포트폴리오를 가져오는데 실패했습니다:', error);
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

  const handleItemSelect = (item: PortfolioItem) => {
    setSelectedItem(item);
    setSellQuantity(1);
  };

  const handleQuantityChange = (value: number) => {
    if (!selectedItem) return;
    const newQuantity = Math.max(1, Math.min(selectedItem.quantity, sellQuantity + value));
    setSellQuantity(newQuantity);
  };

  const handleSell = async () => {
    if (!selectedItem) {
      setError('매도할 주식을 선택해주세요.');
      return;
    }

    if (!selectedItem.currentPrice || selectedItem.currentPrice <= 0) {
      setError('주식 가격 정보를 불러올 수 없습니다. 페이지를 새로고침해주세요.');
      return;
    }
    
    // JWT 토큰 확인
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('로그인이 필요합니다. 다시 로그인해주세요.');
      navigate('/login');
      return;
    }
    
    try {
      setError('');
      setIsLoading(true);
      
      const response = await apiFetch('/portfolios/sell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stockId: selectedItem.stockId,
          quantity: sellQuantity,
          price: selectedItem.currentPrice,
        }),
      });

      if (response.ok) {
        await response.json();
        setShowSuccess(true);
        
        // 사용자 잔고 업데이트
        if (user) {
          const sellAmount = selectedItem.currentPrice * sellQuantity;
          const newBalance = user.balance + sellAmount;
          setUser({ ...user, balance: newBalance });
          localStorage.setItem('user', JSON.stringify({ ...user, balance: newBalance }));
        }
        
        // 포트폴리오 새로고침
        await fetchPortfolio();
        
        // 2초 후 포트폴리오로 이동
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
          setError(`매도 실패: ${errorData.message || '알 수 없는 오류가 발생했습니다.'}`);
        }
      }
    } catch (err) {
      console.error('매도 중 오류 발생:', err);
      if (err instanceof Error && err.message.includes('인증이 만료')) {
        navigate('/login');
      } else {
        setError(err instanceof Error ? err.message : '매도 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR');
  };

  const formatBalance = (balance: number) => {
    return balance.toLocaleString('ko-KR');
  };

  const getCurrentPrice = (stockId: string) => {
    const portfolioItem = portfolio.find(p => p.stockId === stockId);
    return portfolioItem?.currentPrice || 0;
  };

  const calculateSellAmount = () => {
    if (!selectedItem || !selectedItem.currentPrice) return 0;
    return selectedItem.currentPrice * sellQuantity;
  };

  const calculateProfitLoss = () => {
    if (!selectedItem || !selectedItem.currentPrice) return 0;
    return (selectedItem.currentPrice - selectedItem.averagePrice) * sellQuantity;
  };

  if (portfolio.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="mb-6">
              <TrendingDown className="w-16 h-16 text-gray-400 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">매도할 주식이 없습니다</h2>
            <p className="text-gray-600 mb-6">
              먼저 주식을 매수한 후 매도 페이지를 이용하세요.
            </p>
            <button
              onClick={() => navigate('/buy')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              매수하러 가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">주식 매도</h1>
              <p className="text-gray-600">보유한 주식을 판매하세요</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 보유 주식 목록 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">보유 주식</h2>
            <div className="space-y-3">
              {portfolio.map((item) => {
                const currentPrice = item.currentPrice || 0;
                const profitLoss = currentPrice > 0 ? (currentPrice - item.averagePrice) * item.quantity : 0;
                const profitLossPercent = currentPrice > 0 && item.averagePrice > 0 ? 
                  ((currentPrice - item.averagePrice) / item.averagePrice) * 100 : 0;
                
                return (
                  <div
                    key={item.stockId}
                    onClick={() => handleItemSelect(item)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedItem?.stockId === item.stockId
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{item.stockName}</h3>
                      <span className="text-sm text-gray-500">{item.quantity}주</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">평균 매수가:</span>
                        <span className="ml-2 font-medium">{formatPrice(item.averagePrice)}원</span>
                      </div>
                      <div>
                        <span className="text-gray-600">현재가:</span>
                        <span className="ml-2 font-medium">
                          {currentPrice > 0 ? `${formatPrice(currentPrice)}원` : '가격 정보 없음'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">수익/손실:</span>
                        <span className={`ml-2 font-medium ${
                          profitLoss > 0 ? 'text-green-600' : 
                          profitLoss < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {profitLoss > 0 ? '+' : ''}{formatPrice(profitLoss)}원
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">수익률:</span>
                        <span className={`ml-2 font-medium ${
                          profitLossPercent > 0 ? 'text-green-600' : 
                          profitLossPercent < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {profitLossPercent > 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 매도 폼 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">매도 정보</h2>
            
            {selectedItem ? (
              <>
                {/* 선택된 주식 정보 */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">{selectedItem.stockName}</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">보유 수량:</span>
                      <span className="ml-2 font-medium">{selectedItem.quantity}주</span>
                    </div>
                    <div>
                      <span className="text-gray-600">평균 매수가:</span>
                      <span className="ml-2 font-medium">{formatPrice(selectedItem.averagePrice)}원</span>
                    </div>
                    <div>
                      <span className="text-gray-600">현재가:</span>
                      <span className="ml-2 font-medium">
                        {selectedItem.currentPrice > 0 ? `${formatPrice(selectedItem.currentPrice)}원` : '가격 정보 없음'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">총 보유 가치:</span>
                      <span className="ml-2 font-medium">
                        {selectedItem.currentPrice > 0 ? `${formatPrice(selectedItem.quantity * selectedItem.currentPrice)}원` : '계산 불가'}
                      </span>pages 한
                    </div>
                  </div>
                </div>

                {/* 매도 수량 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    매도 수량
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
                      value={sellQuantity}
                      onChange={(e) => setSellQuantity(Math.max(1, Math.min(selectedItem.quantity, parseInt(e.target.value) || 1)))}
                      min="1"
                      max={selectedItem.quantity}
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
                  <p className="text-sm text-gray-500 mt-1">
                    최대 {selectedItem.quantity}주까지 매도 가능
                  </p>
                </div>

                {/* 매도 정보 요약 */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-800">매도 금액</span>
                      <span className="font-semibold text-blue-900">{formatPrice(calculateSellAmount())}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-800">예상 수익/손실</span>
                      <span className={`font-semibold ${
                        calculateProfitLoss() > 0 ? 'text-green-600' : 
                        calculateProfitLoss() < 0 ? 'text-red-600' : 'text-blue-900'
                      }`}>
                        {calculateProfitLoss() > 0 ? '+' : ''}{formatPrice(calculateProfitLoss())}원
                      </span>
                    </div>
                  </div>
                </div>

                {/* 매도 버튼 */}
                <button
                  onClick={handleSell}
                  disabled={isLoading || !selectedItem?.currentPrice || selectedItem.currentPrice <= 0}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                    isLoading || !selectedItem?.currentPrice || selectedItem.currentPrice <= 0
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 btn-hover-effect'
                  }`}
                >
                  {isLoading ? '매도 처리 중...' : 
                   !selectedItem?.currentPrice || selectedItem.currentPrice <= 0 ? '가격 정보 없음' : '매도하기'}
                </button>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p>매도할 주식을 선택하세요</p>
              </div>
            )}
          </div>
        </div>

        {/* 성공 메시지 */}
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center mt-6">
            <div className="flex items-center justify-center space-x-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">매도가 성공적으로 완료되었습니다!</span>
            </div>
            <p className="text-sm text-green-600 mt-1">포트폴리오로 이동합니다...</p>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center mt-6">
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

export default Sell;
