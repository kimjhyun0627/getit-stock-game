package kr.knu.getit.stockgame.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String stockId;

    @Enumerated(EnumType.STRING)
    @Column(length = 10, nullable = false)
    private TransactionType type;

    @Column(nullable = false)
    private Long quantity;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Double totalAmount;

    @Column(updatable = false)
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stockId", insertable = false, updatable = false)
    private Stock stock;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
