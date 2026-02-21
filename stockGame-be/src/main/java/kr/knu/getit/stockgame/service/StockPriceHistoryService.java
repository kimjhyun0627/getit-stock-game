package kr.knu.getit.stockgame.service;

import kr.knu.getit.stockgame.entity.StockPriceHistory;
import kr.knu.getit.stockgame.repository.StockPriceHistoryRepository;
import kr.knu.getit.stockgame.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockPriceHistoryService {

    private final StockPriceHistoryRepository priceHistoryRepository;
    private final StockRepository stockRepository;
    private final AppConfigService appConfigService;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getByStockId(String stockId) {
        ensureStockExists(stockId);
        return priceHistoryRepository.findByStockIdOrderByYearAsc(stockId).stream()
                .map(h -> Map.<String, Object>of("year", h.getYear(), "price", h.getPrice()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void setPrice(String stockId, int year, double price) {
        ensureStockExists(stockId);
        int start = appConfigService.getGameStartYear();
        int end = appConfigService.getGameEndYear();
        if (year < start || year > end) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "연도는 게임 진행 연도(" + start + "~" + end + ") 범위 내여야 합니다.");
        }
        if (price < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "가격은 0 이상이어야 합니다.");
        }
        StockPriceHistory entity = priceHistoryRepository.findByStockIdAndYear(stockId, year)
                .orElseGet(() -> StockPriceHistory.builder()
                        .stockId(stockId)
                        .year(year)
                        .price(price)
                        .build());
        entity.setPrice(price);
        priceHistoryRepository.save(entity);
    }

    @Transactional
    public void setPrices(String stockId, List<Map<String, Object>> prices) {
        if (prices == null) return;
        for (Map<String, Object> entry : prices) {
            Object y = entry.get("year");
            Object p = entry.get("price");
            if (y instanceof Number && p instanceof Number) {
                setPrice(stockId, ((Number) y).intValue(), ((Number) p).doubleValue());
            }
        }
    }

    private void ensureStockExists(String stockId) {
        if (!stockRepository.existsById(stockId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "주식을 찾을 수 없습니다.");
        }
    }
}
