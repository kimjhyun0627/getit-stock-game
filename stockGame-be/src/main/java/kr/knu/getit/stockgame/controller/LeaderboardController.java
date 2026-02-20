package kr.knu.getit.stockgame.controller;

import kr.knu.getit.stockgame.dto.LeaderboardDto;
import kr.knu.getit.stockgame.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    public List<LeaderboardDto.LeaderboardResponse> getPublic() {
        return leaderboardService.getPublicLeaderboard();
    }

    @GetMapping("/admin")
    public List<LeaderboardDto.AdminLeaderboardResponse> getAdmin() {
        return leaderboardService.getAdminLeaderboard();
    }

    @GetMapping("/stats")
    public LeaderboardDto.LeaderboardStats getStats() {
        return leaderboardService.getStats();
    }

    @PutMapping("/admin/{userId}/visibility")
    public void toggleVisibility(@PathVariable String userId, @RequestBody LeaderboardDto.UpdateVisibility dto) {
        leaderboardService.toggleUserVisibility(userId, dto.getIsVisible());
    }

    @PostMapping("/admin/refresh")
    public void forceRefresh() {
        leaderboardService.updateLeaderboard();
    }
}
