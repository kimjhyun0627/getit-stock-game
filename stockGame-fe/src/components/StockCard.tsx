import React from 'react';
import type { Stock } from '../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StockCardProps {
  stock: Stock;
  onClick?: () => void;
}

const StockCard: React.FC<StockCardProps> = ({ stock, onClick }) => {
  const isPositive = stock.change > 0;
  const isNegative = stock.change < 0;
  const isNeutral = stock.change === 0;

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
      className="group bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl p-3 sm:p-4 md:p-6 cursor-pointer transition-all duration-300 hover-lift border border-gray-100 hover:border-blue-200 overflow-hidden relative card-hover-effect"
      onClick={onClick}
    >
      {/* 배경 그라데이션 효과 */}
      <div className={`absolute inset-0 opacity-5 transition-opacity duration-300 group-hover:opacity-10 ${
        isPositive ? 'bg-gradient-to-br from-green-400 to-emerald-500' :
        isNegative ? 'bg-gradient-to-br from-red-400 to-pink-500' :
        'bg-gradient-to-br from-gray-400 to-slate-500'
      }`}></div>
      
      <div className="relative z-10">
        {/* 헤더 섹션 */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-xl mb-1 group-hover:text-blue-600 transition-colors duration-200">
              {stock.name}
            </h3>
            <p className="text-gray-500 text-sm font-mono bg-gray-100 px-2 py-1 rounded-md inline-block">
              {formatSymbol(stock.symbol)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-2xl text-gray-900 group-hover:scale-110 transition-transform duration-200">
              {formatPrice(stock.currentPrice)}원
            </p>
          </div>
        </div>
        
        {/* 변화량 섹션 */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
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
          </div>
          
          <div className="text-right">
            <p className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
              거래량: {formatVolume(stock.volume)}
            </p>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span>전일가: {formatPrice(stock.previousPrice)}원</span>
            <span className={`font-medium ${
              isPositive ? 'text-green-600' : 
              isNegative ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {isPositive ? '상승' : isNegative ? '하락' : '보합'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockCard;
