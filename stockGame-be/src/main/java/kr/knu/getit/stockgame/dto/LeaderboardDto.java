package kr.knu.getit.stockgame.dto;

import lombok.Data;

import java.math.BigDecimal;

public class LeaderboardDto {

    @Data
    public static class LeaderboardResponse {
        private String id;
        private String username;
        private BigDecimal totalAssets;
        private BigDecimal cashBalance;
        private BigDecimal stockValue;
        private Integer rank;
        private BigDecimal profitLoss;
        private BigDecimal profitLossPercent;
        private String lastUpdated;
    }

    @Data
    public static class AdminLeaderboardResponse extends LeaderboardResponse {
        private Boolean isVisible;
        private String userId;
    }

    @Data
    public static class UpdateVisibility {
        private Boolean isVisible;
    }

    @Data
    public static class LeaderboardStats {
        private Long totalParticipants;
        private Long visibleParticipants;
        private Double averageAssets;
        private Double topAssets;
        private String lastUpdated;
    }
}
