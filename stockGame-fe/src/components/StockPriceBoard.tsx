import React from 'react';
import type { Stock } from '../types';
import StockCard from './StockCard';

interface StockPriceBoardProps {
  stocks: Stock[];
  onStockClick?: (stock: Stock) => void;
}

const StockPriceBoard: React.FC<StockPriceBoardProps> = ({ stocks, onStockClick }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">주식 시세</h2>
        <div className="text-xs sm:text-sm text-gray-500">
          실시간 업데이트
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {stocks.map((stock) => (
          <StockCard
            key={stock.id}
            stock={stock}
            onClick={() => onStockClick?.(stock)}
          />
        ))}
      </div>
      
      {stocks.length === 0 && (
        <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500">
          주식 정보를 불러오는 중입니다...
        </div>
      )}
    </div>
  );
};

export default StockPriceBoard;
