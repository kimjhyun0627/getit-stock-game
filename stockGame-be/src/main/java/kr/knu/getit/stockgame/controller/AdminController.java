package kr.knu.getit.stockgame.controller;

import kr.knu.getit.stockgame.service.AdminService;
import kr.knu.getit.stockgame.service.AppConfigService;
import kr.knu.getit.stockgame.service.StockPriceHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final AppConfigService appConfigService;
    private final StockPriceHistoryService stockPriceHistoryService;

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboard() {
        return adminService.getDashboardStats();
    }

    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        return adminService.getSystemStatus();
    }

    @PostMapping("/stocks/simulate")
    public Map<String, Object> runSimulation() {
        return adminService.runStockSimulation();
    }

    @PostMapping("/backup")
    public Map<String, Object> backup() {
        return adminService.backupData();
    }

    @GetMapping("/settings/news-current-year")
    public Map<String, Integer> getNewsCurrentYear() {
        return Map.of("currentYear", appConfigService.getNewsCurrentYear());
    }

    @PutMapping("/settings/news-current-year")
    public Map<String, Integer> setNewsCurrentYear(@RequestBody Map<String, Integer> body) {
        Integer year = body != null ? body.get("currentYear") : null;
        if (year == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "currentYear가 필요합니다.");
        }
        appConfigService.setNewsCurrentYear(year);
        return Map.of("currentYear", appConfigService.getNewsCurrentYear());
    }

    @GetMapping("/settings/game-period")
    public Map<String, Integer> getGamePeriod() {
        return Map.of(
                "startYear", appConfigService.getGameStartYear(),
                "endYear", appConfigService.getGameEndYear()
        );
    }

    @PutMapping("/settings/game-period")
    public Map<String, Integer> setGamePeriod(@RequestBody Map<String, Integer> body) {
        Integer startYear = body != null ? body.get("startYear") : null;
        Integer endYear = body != null ? body.get("endYear") : null;
        if (startYear == null || endYear == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "startYear와 endYear가 필요합니다.");
        }
        if (startYear < 2000 || startYear > 2100 || endYear < 2000 || endYear > 2100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "연도는 2000~2100 사이여야 합니다.");
        }
        try {
            appConfigService.setGamePeriod(startYear, endYear);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
        return Map.of(
                "startYear", appConfigService.getGameStartYear(),
                "endYear", appConfigService.getGameEndYear()
        );
    }

    @GetMapping("/stocks/{stockId}/price-history")
    public Map<String, Object> getStockPriceHistory(@PathVariable String stockId) {
        return Map.of(
                "stockId", stockId,
                "prices", stockPriceHistoryService.getByStockId(stockId)
        );
    }

    @PutMapping("/stocks/{stockId}/price-history")
    public Map<String, Object> setStockPriceHistory(
            @PathVariable String stockId,
            @RequestBody Map<String, List<Map<String, Object>>> body) {
        List<Map<String, Object>> prices = body != null ? body.get("prices") : null;
        stockPriceHistoryService.setPrices(stockId, prices);
        return Map.of(
                "stockId", stockId,
                "prices", stockPriceHistoryService.getByStockId(stockId)
        );
    }
}
