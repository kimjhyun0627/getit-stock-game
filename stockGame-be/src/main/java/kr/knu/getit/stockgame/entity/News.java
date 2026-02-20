package kr.knu.getit.stockgame.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "news")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class News {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String summary;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(length = 50, nullable = false)
    private String category;

    private Instant publishedAt;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isPublished = false;

    @Column(name = "publish_year")
    private Integer publishYear;

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

    public void publish() {
        this.isPublished = true;
        this.publishedAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public void unpublish() {
        this.isPublished = false;
        this.publishedAt = null;
        this.updatedAt = Instant.now();
    }
}
