package kr.knu.getit.stockgame.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "leaderboard_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String username;

    @Column(precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalAssets = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal cashBalance = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal stockValue = BigDecimal.ZERO;

    @Column(name = "ranking", nullable = false)
    @Builder.Default
    private Integer rank = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isVisible = true;

    @Column(precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal profitLoss = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal profitLossPercent = BigDecimal.ZERO;

    @Column(updatable = false)
    private Instant createdAt;

    private Instant lastUpdated;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", insertable = false, updatable = false)
    private User user;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        lastUpdated = now;
    }

    @PreUpdate
    void preUpdate() {
        lastUpdated = Instant.now();
    }
}
