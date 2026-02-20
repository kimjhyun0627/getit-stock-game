package kr.knu.getit.stockgame.controller;

import kr.knu.getit.stockgame.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

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
}
