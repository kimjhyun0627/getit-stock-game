package kr.knu.getit.stockgame.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "stocks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String symbol;

    @Column(nullable = false)
    private Double currentPrice;

    @Column(nullable = false)
    private Double previousPrice;

    @Column(nullable = false)
    private Double change;

    @Column(nullable = false)
    private Double changePercent;

    @Column(nullable = false)
    private Long volume;

    @Column(updatable = false)
    private Instant createdAt;

    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public void updatePrice(double newPrice) {
        this.previousPrice = this.currentPrice;
        this.currentPrice = newPrice;
        this.change = this.currentPrice - this.previousPrice;
        this.changePercent = this.previousPrice != 0
                ? (this.change / this.previousPrice) * 100
                : 0;
        this.updatedAt = Instant.now();
    }

    public void updateVolume(long newVolume) {
        this.volume = newVolume;
        this.updatedAt = Instant.now();
    }

    public void increaseVolume(long quantity) {
        this.volume += quantity;
        this.updatedAt = Instant.now();
    }
}
