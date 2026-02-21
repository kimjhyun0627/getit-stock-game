package kr.knu.getit.stockgame.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "stock_price_history", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "stock_id", "year" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockPriceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "stock_id", nullable = false)
    private String stockId;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private Double price;
}
