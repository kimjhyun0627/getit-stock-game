
interface TimeTabProps {
  currentTime: Date;
  usersCount: number;
  stocksCount: number;
  newsCount: number;
  newsCurrentYearInput: string;
  onNewsCurrentYearChange: (value: string) => void;
  onSaveNewsCurrentYear: () => void;
  savingYear: boolean;
  newsCurrentYear: number | null;
  gameStartYearInput: string;
  gameEndYearInput: string;
  onGameStartYearChange: (value: string) => void;
  onGameEndYearChange: (value: string) => void;
  onSaveGamePeriod: () => void;
  savingGamePeriod: boolean;
  gameStartYear: number | null;
  gameEndYear: number | null;
}

export function TimeTab({
  currentTime,
  usersCount,
  stocksCount,
  newsCount,
  newsCurrentYearInput,
  onNewsCurrentYearChange,
  onSaveNewsCurrentYear,
  savingYear,
  newsCurrentYear,
  gameStartYearInput,
  gameEndYearInput,
  onGameStartYearChange,
  onGameEndYearChange,
  onSaveGamePeriod,
  savingGamePeriod,
  gameStartYear,
  gameEndYear,
}: TimeTabProps) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">시간 관리</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">현재 시간</h3>
          <div className="text-3xl font-mono text-blue-800">
            {currentTime.toLocaleString('ko-KR')}
          </div>
          <p className="text-sm text-blue-600 mt-2">
            서버 시간: {new Date().toLocaleString('ko-KR')}
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">시스템 상태</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-green-700">사용자 수:</span>
              <span className="text-sm font-medium text-green-800">{usersCount}명</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-green-700">주식 종목:</span>
              <span className="text-sm font-medium text-green-800">{stocksCount}개</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-green-700">뉴스:</span>
              <span className="text-sm font-medium text-green-800">{newsCount}개</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">현재 연도</h3>
          <p className="text-sm text-blue-800 mb-4">
            이 연도에 따라 주식 표시 가격(연도별 가격)과 뉴스 공개 여부가 결정됩니다. 총 진행 연도 범위 내로 설정하세요.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="number"
              min="2000"
              max="2100"
              value={newsCurrentYearInput}
              onChange={(e) => onNewsCurrentYearChange(e.target.value)}
              className="w-24 px-3 py-2 border border-blue-300 rounded-lg text-sm"
            />
            <span className="text-blue-800">년</span>
            <button
              disabled={savingYear}
              onClick={onSaveNewsCurrentYear}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {savingYear ? '저장 중…' : '저장'}
            </button>
            {newsCurrentYear != null && (
              <span className="text-sm text-blue-700">현재 적용: {newsCurrentYear}년</span>
            )}
          </div>
        </div>

        <div className="md:col-span-2 bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-2">주식 게임 총 진행 연도</h3>
          <p className="text-sm text-amber-800 mb-4">
            게임에서 사용하는 연도 범위(예: 2022~2026). 뉴스 범위 및 이후 주가 이력 기능에 사용됩니다.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="number"
              min="2000"
              max="2100"
              value={gameStartYearInput}
              onChange={(e) => onGameStartYearChange(e.target.value)}
              className="w-24 px-3 py-2 border border-amber-300 rounded-lg text-sm"
            />
            <span className="text-amber-800 font-medium">~</span>
            <input
              type="number"
              min="2000"
              max="2100"
              value={gameEndYearInput}
              onChange={(e) => onGameEndYearChange(e.target.value)}
              className="w-24 px-3 py-2 border border-amber-300 rounded-lg text-sm"
            />
            <span className="text-amber-800">년</span>
            <button
              disabled={savingGamePeriod}
              onClick={onSaveGamePeriod}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 text-sm"
            >
              {savingGamePeriod ? '저장 중…' : '저장'}
            </button>
            {gameStartYear != null && gameEndYear != null && (
              <span className="text-sm text-amber-700">
                현재 적용: {gameStartYear}년 ~ {gameEndYear}년
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
