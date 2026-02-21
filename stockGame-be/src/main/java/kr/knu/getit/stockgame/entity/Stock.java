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

    @Transient
    private Double currentPrice;

    @Column(name = "price_change", nullable = false)
    private Double change;

    @Column(name = "change_percent", nullable = false)
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

    public void updateVolume(long newVolume) {
        this.volume = newVolume;
        this.updatedAt = Instant.now();
    }

    public void increaseVolume(long quantity) {
        this.volume += quantity;
        this.updatedAt = Instant.now();
    }
}
