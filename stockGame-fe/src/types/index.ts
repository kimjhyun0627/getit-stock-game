// 주식 관련 타입
export interface Stock {
  id: string;
  name: string;
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
}

// 뉴스 관련 타입
export interface News {
  id: string;
  content: string;
  category: string;
  isPublished: boolean;
  publishYear?: number | null;
  reliability?: string | null;
  createdAt: string;
  updatedAt: string;
}

// 포트폴리오 아이템 타입
export interface PortfolioItem {
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

// 거래 내역 타입
export interface Transaction {
  id: string;
  stockId: string;
  stockName: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  totalAmount: number;
  createdAt: string;
}

// 사용자 타입
export interface User {
  id: string;
  name: string;
  balance: number;
  portfolio: PortfolioItem[];
  transactions: Transaction[];
}

// 백엔드 DTO 타입들
export interface CreateStockDto {
  name: string;
  symbol: string;
  currentPrice: number;
  volume: number;
}

export interface UpdateStockDto {
  name?: string;
  symbol?: string;
  currentPrice?: number;
  volume?: number;
}

export interface CreateNewsDto {
  content: string;
  category: string;
  isPublished?: boolean;
  publishYear?: number | null;
  reliability?: string | null;
}

export interface UpdateNewsDto {
  content?: string;
  category?: string;
  isPublished?: boolean;
  publishYear?: number | null;
  reliability?: string | null;
}

export interface PublishNewsDto {
  isPublished: boolean;
}
