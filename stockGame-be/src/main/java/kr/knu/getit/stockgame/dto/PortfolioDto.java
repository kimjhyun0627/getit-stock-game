package kr.knu.getit.stockgame.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

public class PortfolioDto {

    @Data
    public static class BuyOrder {
        @NotBlank
        private String stockId;
        @NotNull
        @Positive
        private Long quantity;
        @NotNull
        @Positive
        private Double price;
    }

    @Data
    public static class SellOrder {
        @NotBlank
        private String stockId;
        @NotNull
        @Positive
        private Long quantity;
        @NotNull
        @Positive
        private Double price;
    }

    @Data
    public static class PortfolioResponse {
        private String stockId;
        private String stockName;
        private String symbol;
        private Long quantity;
        private Double averagePrice;
        private Double currentPrice;
        private Double totalValue;
        private Double profitLoss;
        private Double profitLossPercent;
    }

    @Data
    public static class TransactionResponse {
        private String id;
        private String stockId;
        private String stockName;
        private String symbol;
        private String type;
        private Long quantity;
        private Double price;
        private Double totalAmount;
        private String createdAt;
    }

    @Data
    public static class BalanceResponse {
        private java.math.BigDecimal balance;
    }

    @Data
    public static class VolumeStats {
        private Long totalVolume;
        private Long buyVolume;
        private Long sellVolume;
        private java.time.Instant lastUpdated;
    }

    @Data
    public static class VolumeStatsByStock {
        private String stockId;
        private String stockName;
        private String stockSymbol;
        private Long totalVolume;
        private Long buyVolume;
        private Long sellVolume;
        private java.time.Instant lastUpdated;
    }
}
