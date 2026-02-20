package kr.knu.getit.stockgame.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

public class StockDto {

    @Data
    public static class Create {
        @NotBlank
        private String name;
        @NotBlank
        private String symbol;
        @NotNull
        @Min(0)
        private Double currentPrice;
        @NotNull
        @Min(0)
        private Long volume;
    }

    @Data
    public static class Update {
        private String name;
        private String symbol;
        private Double currentPrice;
        private Long volume;
    }

    @Data
    public static class UpdatePrice {
        @NotNull
        @Min(0)
        private Double currentPrice;
    }

    @Data
    public static class UpdateVolume {
        @NotNull
        @Min(0)
        private Long volume;
    }
}
