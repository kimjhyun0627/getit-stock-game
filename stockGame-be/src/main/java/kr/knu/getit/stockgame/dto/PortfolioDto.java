package kr.knu.getit.stockgame.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import kr.knu.getit.stockgame.entity.Portfolio;
import kr.knu.getit.stockgame.entity.Stock;
import kr.knu.getit.stockgame.entity.Transaction;
import kr.knu.getit.stockgame.entity.TransactionType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

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

    public record PortfolioResponse(
            String stockId,
            String stockName,
            String symbol,
            Long quantity,
            Double averagePrice,
            Double currentPrice,
            Double totalValue,
            Double profitLoss,
            Double profitLossPercent
    ) {
        public static PortfolioResponse from(Portfolio p, Stock s, double currentPrice, double totalValue, double profitLoss, double profitLossPercent) {
            return new PortfolioResponse(
                    p.getStockId(),
                    s.getName(),
                    s.getSymbol(),
                    p.getQuantity(),
                    p.getAveragePrice(),
                    currentPrice,
                    totalValue,
                    profitLoss,
                    profitLossPercent
            );
        }
    }

    public record TransactionResponse(
            String id,
            String stockId,
            String stockName,
            String symbol,
            String type,
            Long quantity,
            Double price,
            Double totalAmount,
            String createdAt
    ) {
        public static TransactionResponse from(Transaction tx, Stock s) {
            return new TransactionResponse(
                    tx.getId(),
                    tx.getStockId(),
                    s != null ? s.getName() : "",
                    s != null ? s.getSymbol() : "",
                    tx.getType() == TransactionType.BUY ? "buy" : "sell",
                    tx.getQuantity(),
                    tx.getPrice(),
                    tx.getTotalAmount(),
                    tx.getCreatedAt() != null ? tx.getCreatedAt().toString() : null
            );
        }
    }

    public record BalanceResponse(BigDecimal balance) {
        public static BalanceResponse from(BigDecimal balance) {
            return new BalanceResponse(balance);
        }
    }

    public record VolumeStats(
            Long totalVolume,
            Long buyVolume,
            Long sellVolume,
            Instant lastUpdated
    ) {
        public static VolumeStats from(Long totalVolume, Long buyVolume, Long sellVolume, Instant lastUpdated) {
            return new VolumeStats(
                    totalVolume,
                    buyVolume != null ? buyVolume : 0L,
                    sellVolume != null ? sellVolume : 0L,
                    lastUpdated
            );
        }
    }

    public record VolumeStatsByStock(
            String stockId,
            String stockName,
            String stockSymbol,
            Long totalVolume,
            Long buyVolume,
            Long sellVolume,
            Instant lastUpdated
    ) {
        public static VolumeStatsByStock from(Stock s, VolumeStats stats) {
            return new VolumeStatsByStock(
                    s.getId(),
                    s.getName(),
                    s.getSymbol(),
                    stats.totalVolume(),
                    stats.buyVolume(),
                    stats.sellVolume(),
                    stats.lastUpdated()
            );
        }
    }
}
