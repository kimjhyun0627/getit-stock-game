package kr.knu.getit.stockgame.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = true)
    private String email;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String nickname;

    @Column(nullable = true)
    private String profileImage;

    @Column(unique = true, nullable = true)
    private String kakaoId;

    @Column(unique = true, nullable = true)
    private String googleId;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private UserRole role = UserRole.USER;

    @Column(precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal balance = new BigDecimal("10000000");

    @Column(updatable = false)
    private Instant createdAt;

    private Instant updatedAt;

    private Instant lastLoginAt;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isLeaderboardVisible = true;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @Builder.Default
    private List<UserSession> sessions = new ArrayList<>();

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
}
