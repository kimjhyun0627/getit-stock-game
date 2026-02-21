import { Plus, Edit, Trash2 } from 'lucide-react';
import type { AdminStock } from '../../hooks/useAdminData';

interface StocksTabProps {
  stocks: AdminStock[];
  onAddClick: () => void;
  onPriceHistory: (stock: AdminStock) => void;
  onEdit: (stock: AdminStock) => void;
  onDelete: (stockId: string) => void;
}

export function StocksTab({
  stocks,
  onAddClick,
  onPriceHistory,
  onEdit,
  onDelete,
}: StocksTabProps) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">주식 관리</h2>
        <button
          onClick={onAddClick}
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
                  onClick={() => onPriceHistory(stock)}
                  className="text-amber-600 hover:text-amber-800 text-xs px-2 py-1 border border-amber-300 rounded"
                >
                  연도별 가격
                </button>
                <button
                  onClick={() => onEdit(stock)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(stock.id)}
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
  );
}
