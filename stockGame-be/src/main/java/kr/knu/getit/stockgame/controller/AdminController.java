package kr.knu.getit.stockgame.controller;

import kr.knu.getit.stockgame.dto.AuthDto;
import kr.knu.getit.stockgame.entity.User;
import kr.knu.getit.stockgame.security.JwtAuthenticationFilter;
import kr.knu.getit.stockgame.service.AdminService;
import kr.knu.getit.stockgame.service.AuthService;
import kr.knu.getit.stockgame.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final UserService userService;
    private final AuthService authService;

    @Value("${app.admin-password:}")
    private String adminPassword;

    @PostMapping("/claim")
    public Map<String, Object> claimAdmin(
            @AuthenticationPrincipal JwtAuthenticationFilter.AuthPrincipal principal,
            @RequestBody Map<String, String> body) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        String password = body != null ? body.get("password") : null;
        if (adminPassword == null || adminPassword.isBlank()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "관리자 비밀번호가 설정되지 않았습니다.");
        }
        if (password == null || !adminPassword.equals(password)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "비밀번호가 일치하지 않습니다.");
        }
        userService.updateRole(principal.id(), "ADMIN");
        User updated = userService.findOne(principal.id());
        AuthDto.AuthTokensResponse tokens = authService.createTokensForUser(updated);
        return Map.of(
                "message", "관리자 권한이 부여되었습니다.",
                "role", "ADMIN",
                "accessToken", tokens.getAccessToken(),
                "refreshToken", tokens.getRefreshToken(),
                "user", tokens.getUser()
        );
    }

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
