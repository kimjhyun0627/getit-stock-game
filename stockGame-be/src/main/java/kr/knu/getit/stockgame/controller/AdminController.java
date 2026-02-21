package kr.knu.getit.stockgame.controller;

import kr.knu.getit.stockgame.service.AdminService;
import kr.knu.getit.stockgame.service.AppConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final AppConfigService appConfigService;

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
}
