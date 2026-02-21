import React from 'react';
import type { Stock } from '../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StockCardProps {
  stock: Stock;
  onClick?: () => void;
}

const StockCard: React.FC<StockCardProps> = ({ stock, onClick }) => {
  const isDelisted = stock.currentPrice == null || stock.currentPrice === 0;
  const isPositive = !isDelisted && stock.change > 0;
  const isNegative = !isDelisted && stock.change < 0;
  const isNeutral = !isDelisted && stock.change === 0;

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR');
  };

  const formatChange = (change: number) => {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toLocaleString('ko-KR')}`;
  };

  const formatChangePercent = (percent: number) => {
    const sign = percent > 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      const millions = volume / 1000000;
      if (millions >= 10) {
        return `${Math.round(millions)}M`;
      } else {
        return `${millions.toFixed(1)}M`;
      }
    } else if (volume >= 1000) {
      const thousands = volume / 1000;
      if (thousands >= 10) {
        return `${Math.round(thousands)}K`;
      } else {
        return `${thousands.toFixed(1)}K`;
      }
    } else if (volume >= 100) {
      return `${Math.round(volume / 100) * 100}`;
    } else if (volume >= 10) {
      return `${Math.round(volume / 10) * 10}`;
    } else {
      return volume.toString();
    }
  };

  // 종목코드 포맷팅 함수 (예: 005930 → 005930, 000660 → 000660)
  const formatSymbol = (symbol: string) => {
    // 6자리 숫자인 경우 그대로 반환 (한국 주식 시장 표준)
    if (/^\d{6}$/.test(symbol)) {
      return symbol;
    }
    // 다른 형태의 심볼인 경우 그대로 반환
    return symbol;
  };

  return (
    <div 
      className={`group rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl p-3 sm:p-4 md:p-6 cursor-pointer transition-all duration-300 hover-lift overflow-hidden relative card-hover-effect ${
        isDelisted
          ? 'bg-gray-100 border border-gray-200 hover:border-gray-300'
          : 'bg-white border border-gray-100 hover:border-blue-200'
      }`}
      onClick={onClick}
    >
      {/* 배경 그라데이션 효과 */}
      <div className={`absolute inset-0 opacity-5 transition-opacity duration-300 group-hover:opacity-10 ${
        isDelisted ? 'bg-gray-500' :
        isPositive ? 'bg-gradient-to-br from-green-400 to-emerald-500' :
        isNegative ? 'bg-gradient-to-br from-red-400 to-pink-500' :
        'bg-gradient-to-br from-gray-400 to-slate-500'
      }`}></div>
      
      <div className="relative z-10">
        {/* 헤더 섹션 */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className={`font-bold text-xl mb-1 transition-colors duration-200 ${
              isDelisted ? 'text-gray-600 group-hover:text-gray-700' : 'text-gray-900 group-hover:text-blue-600'
            }`}>
              {stock.name}
            </h3>
            <p className={`text-sm font-mono px-2 py-1 rounded-md inline-block ${
              isDelisted ? 'text-gray-500 bg-gray-200' : 'text-gray-500 bg-gray-100'
            }`}>
              {formatSymbol(stock.symbol)}
            </p>
          </div>
          <div className="text-right">
            <p className={`font-bold text-2xl transition-transform duration-200 ${
              isDelisted ? 'text-gray-500 group-hover:scale-105' : 'text-gray-900 group-hover:scale-110'
            }`}>
              {isDelisted ? '상장 폐지' : `${formatPrice(stock.currentPrice)}원`}
            </p>
          </div>
        </div>
        
        {/* 변화량 섹션 */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            {isDelisted ? (
              <span className="text-sm font-medium text-gray-500">—</span>
            ) : (
              <>
                <div className={`p-2 rounded-full transition-all duration-200 ${
                  isPositive ? 'bg-green-100 text-green-600 group-hover:bg-green-200' : 
                  isNegative ? 'bg-red-100 text-red-600 group-hover:bg-red-200' : 
                  'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                }`}>
                  {isPositive && <TrendingUp className="w-4 h-4" />}
                  {isNegative && <TrendingDown className="w-4 h-4" />}
                  {isNeutral && <Minus className="w-4 h-4" />}
                </div>
                <span className={`text-sm font-semibold ${
                  isPositive ? 'text-green-600' : 
                  isNegative ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {formatChange(stock.change)} ({formatChangePercent(stock.changePercent)})
                </span>
              </>
            )}
          </div>
          
          <div className="text-right">
            <p className={`text-xs px-2 py-1 rounded-full ${
              isDelisted ? 'text-gray-500 bg-gray-200' : 'text-gray-500 bg-gray-50'
            }`}>
              거래량: {isDelisted ? '—' : formatVolume(stock.volume)}
            </p>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span>
              전년가: {isDelisted ? '—' : `${formatPrice(stock.currentPrice - stock.change)}원`}
            </span>
            <span className={`font-medium ${
              isDelisted ? 'text-gray-500' :
              isPositive ? 'text-green-600' : 
              isNegative ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {isDelisted ? '—' : isPositive ? '상승' : isNegative ? '하락' : '보합'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockCard;
