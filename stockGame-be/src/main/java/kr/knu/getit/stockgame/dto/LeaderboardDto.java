package kr.knu.getit.stockgame.dto;

import kr.knu.getit.stockgame.entity.LeaderboardEntry;
import lombok.Data;

import java.math.BigDecimal;

public class LeaderboardDto {

    public record LeaderboardResponse(
            String id,
            String username,
            BigDecimal totalAssets,
            BigDecimal cashBalance,
            BigDecimal stockValue,
            Integer rank,
            BigDecimal profitLoss,
            BigDecimal profitLossPercent,
            String lastUpdated
    ) {
        public static LeaderboardResponse from(LeaderboardEntry e) {
            return new LeaderboardResponse(
                    e.getId(),
                    e.getUsername(),
                    e.getTotalAssets(),
                    e.getCashBalance(),
                    e.getStockValue(),
                    e.getRank(),
                    e.getProfitLoss(),
                    e.getProfitLossPercent(),
                    e.getLastUpdated() != null ? e.getLastUpdated().toString() : null
            );
        }
    }

    public record AdminLeaderboardResponse(
            String id,
            String username,
            BigDecimal totalAssets,
            BigDecimal cashBalance,
            BigDecimal stockValue,
            Integer rank,
            BigDecimal profitLoss,
            BigDecimal profitLossPercent,
            String lastUpdated,
            Boolean isVisible,
            String userId
    ) {
        public static AdminLeaderboardResponse from(LeaderboardEntry e) {
            return new AdminLeaderboardResponse(
                    e.getId(),
                    e.getUsername(),
                    e.getTotalAssets(),
                    e.getCashBalance(),
                    e.getStockValue(),
                    e.getRank(),
                    e.getProfitLoss(),
                    e.getProfitLossPercent(),
                    e.getLastUpdated() != null ? e.getLastUpdated().toString() : null,
                    e.getIsVisible(),
                    e.getUserId()
            );
        }
    }

    @Data
    public static class UpdateVisibility {
        private Boolean isVisible;
    }

    public record LeaderboardStats(
            Long totalParticipants,
            Long visibleParticipants,
            Double averageAssets,
            Double topAssets,
            String lastUpdated
    ) {
        public static LeaderboardStats from(long totalParticipants, long visibleParticipants, Double averageAssets, Double topAssets, String lastUpdated) {
            return new LeaderboardStats(
                    totalParticipants,
                    visibleParticipants,
                    averageAssets != null ? averageAssets : 0,
                    topAssets != null ? topAssets : 0,
                    lastUpdated != null ? lastUpdated : java.time.Instant.now().toString()
            );
        }
    }
}
