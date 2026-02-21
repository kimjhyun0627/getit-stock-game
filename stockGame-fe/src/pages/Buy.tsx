import React from 'react';
import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { PriceLineChart } from '../components/PriceLineChart';
import { useBuy } from '../hooks/useBuy';

const formatPrice = (price: number) => price.toLocaleString('ko-KR');
const formatBalance = (balance: number) => balance.toLocaleString('ko-KR');

const formatPriceOrDelisted = (price: number | null | undefined) =>
  price != null && price > 0 ? `${formatPrice(price)}원` : '상장폐지';

const Buy: React.FC = () => {
  const {
    stocks,
    user,
    selectedStock,
    setSelectedStock,
    quantity,
    setQuantity,
    currentYear,
    chartData,
    selectedStockData,
    totalAmount,
    canAfford,
    isPriceValid,
    isLoading,
    showSuccess,
    error,
    handleQuantityChange,
    handleBuy,
  } = useBuy();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
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

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">매수 정보 입력</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">주식 선택</label>
            <select
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {stocks.map((stock) => (
                <option key={stock.id} value={stock.id}>
                  {stock.name} ({stock.symbol}) - {formatPriceOrDelisted(stock.currentPrice)}
                </option>
              ))}
            </select>
          </div>

          {selectedStockData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">종목명</p>
                  <p className="font-semibold text-gray-900">{selectedStockData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">현재가</p>
                  <p className="font-semibold text-gray-900">
                    {formatPriceOrDelisted(selectedStockData.currentPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">전년 대비</p>
                  <p
                    className={`font-semibold ${
                      selectedStockData.change > 0
                        ? 'text-green-600'
                        : selectedStockData.change < 0
                          ? 'text-red-600'
                          : 'text-gray-600'
                    }`}
                  >
                    {selectedStockData.change > 0 ? '+' : ''}
                    {formatPrice(selectedStockData.change)}원 (
                    {selectedStockData.changePercent > 0 ? '+' : ''}
                    {selectedStockData.changePercent.toFixed(2)}%)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">거래량</p>
                  <p className="font-semibold text-gray-900">
                    {(selectedStockData.volume / 1000000).toFixed(1)}M
                  </p>
                </div>
              </div>
            </div>
          )}

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

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">매수 수량</label>
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

          {selectedStockData && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-800">매수 금액</span>
                <span className="text-xl font-bold text-blue-900">
                  {formatPriceOrDelisted(isPriceValid ? totalAmount : null)}
                </span>
              </div>
              <div className="mt-2 text-sm text-blue-700">
                {isPriceValid && canAfford ? (
                  <span className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    매수 가능합니다
                  </span>
                ) : isPriceValid && !canAfford ? (
                  <span className="flex items-center text-red-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    잔액이 부족합니다
                  </span>
                ) : null}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleBuy}
            disabled={!selectedStock || !canAfford || !isPriceValid || isLoading}
            className={`w-full min-h-[48px] py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 touch-manipulation active:scale-[0.98] ${
              !selectedStock || !canAfford || !isPriceValid || isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl sm:hover:scale-[1.02] sm:hover:-translate-y-0.5'
            }`}
          >
            {isLoading ? '매수 처리 중...' : '매수하기'}
          </button>
        </div>

        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center space-x-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">매수가 성공적으로 완료되었습니다!</span>
            </div>
            <p className="text-sm text-green-600 mt-1">포트폴리오로 이동합니다...</p>
          </div>
        )}

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
