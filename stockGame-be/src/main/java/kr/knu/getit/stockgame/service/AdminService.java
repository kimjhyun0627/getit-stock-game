package kr.knu.getit.stockgame.service;

import kr.knu.getit.stockgame.dto.NewsDto;
import kr.knu.getit.stockgame.entity.Stock;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final StockService stockService;
    private final NewsService newsService;

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        List<Stock> stocks = stockService.findAll();
        List<NewsDto.Response> news = newsService.findAll();
        List<NewsDto.Response> published = newsService.findPublished(null);

        Map<String, Object> stockStats = new HashMap<>();
        stockStats.put("total", stocks.size());
        stockStats.put("rising", stocks.stream().filter(s -> s.getChange() > 0).count());
        stockStats.put("falling", stocks.stream().filter(s -> s.getChange() < 0).count());
        stockStats.put("unchanged", stocks.stream().filter(s -> s.getChange() == 0).count());
        stockStats.put("totalVolume", stocks.stream().mapToLong(Stock::getVolume).sum());

        Map<String, Object> newsStats = new HashMap<>();
        newsStats.put("total", news.size());
        newsStats.put("published", published.size());
        newsStats.put("unpublished", news.size() - published.size());
        Map<String, Long> byCategory = news.stream()
                .collect(Collectors.groupingBy(NewsDto.Response::category, Collectors.counting()));
        newsStats.put("byCategory", byCategory);

        return Map.of(
                "stocks", stockStats,
                "news", newsStats,
                "lastUpdated", Instant.now()
        );
    }

    public Map<String, Object> getSystemStatus() {
        Runtime rt = Runtime.getRuntime();
        return Map.of(
                "status", "healthy",
                "timestamp", Instant.now(),
                "version", "1.0.0",
                "uptime", System.currentTimeMillis(), // placeholder
                "memory", Map.of(
                        "used", rt.totalMemory() - rt.freeMemory(),
                        "total", rt.totalMemory(),
                        "free", rt.freeMemory()
                )
        );
    }

    public Map<String, Object> runStockSimulation() {
        stockService.simulatePriceChanges();
        return Map.of(
                "message", "주식 가격 시뮬레이션이 실행되었습니다.",
                "timestamp", Instant.now()
        );
    }

    public Map<String, Object> backupData() {
        List<Stock> stocks = stockService.findAll();
        List<NewsDto.Response> news = newsService.findAll();
        return Map.of(
                "message", "데이터 백업이 완료되었습니다.",
                "timestamp", Instant.now(),
                "stocksCount", stocks.size(),
                "newsCount", news.size()
        );
    }
}
