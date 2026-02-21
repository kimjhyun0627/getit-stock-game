import { Plus, Edit, Trash2 } from 'lucide-react';
import type { AdminNews, AdminStock } from '../../hooks/useAdminData';

interface NewsTabProps {
  news: AdminNews[];
  stocks: AdminStock[];
  onAddClick: () => void;
  onPublish: (newsId: string, isPublished: boolean) => void;
  onEdit: (item: AdminNews) => void;
  onDelete: (newsId: string) => void;
}

function reliabilityLabel(r: string | null | undefined) {
  if (!r) return r;
  if (r === 'HIGH') return '상';
  if (r === 'MEDIUM') return '중';
  if (r === 'LOW') return '하';
  if (r === 'ALL') return '전체 공개';
  if (r === 'YEAR_END') return '전년도 결산';
  return r;
}

export function NewsTab({
  news,
  stocks,
  onAddClick,
  onPublish,
  onEdit,
  onDelete,
}: NewsTabProps) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">뉴스 관리</h2>
        <button
          onClick={onAddClick}
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
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.category === 'all'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {item.category === 'all'
                      ? '전체'
                      : stocks.find((s) => s.symbol === item.category)?.name || item.category}
                  </span>
                  <span>
                    공개 연도: {item.publishYear != null ? `${item.publishYear}년` : '미설정'}
                  </span>
                  <span>{item.isPublished ? '게시됨' : '비공개'}</span>
                  {item.reliability && (
                    <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800">
                      신뢰도: {reliabilityLabel(item.reliability)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => onPublish(item.id, !item.isPublished)}
                  className={`px-2 py-1 text-xs rounded ${
                    item.isPublished
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {item.isPublished ? '비공개로' : '게시하기'}
                </button>
                <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-800">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-800">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
