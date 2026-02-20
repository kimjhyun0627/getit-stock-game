package kr.knu.getit.stockgame.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import kr.knu.getit.stockgame.entity.News;

public final class NewsDto {

    public record Create(
            @NotBlank String title,
            @NotBlank String summary,
            @NotBlank String content,
            @NotBlank String category,
            Boolean isPublished,
            Integer publishYear
    ) {
        public static Create of(String title, String summary, String content, String category, Boolean isPublished, Integer publishYear) {
            return new Create(title, summary, content, category, isPublished, publishYear);
        }
    }

    public record Update(
            String title,
            String summary,
            String content,
            String category,
            Boolean isPublished,
            Integer publishYear
    ) {}

    public record Publish(@NotNull Boolean isPublished) {}

    public record Response(
            String id,
            String title,
            String summary,
            String content,
            String category,
            Boolean isPublished,
            Integer publishYear,
            String publishedAt,
            String createdAt,
            String updatedAt
    ) {
        public static Response from(News n) {
            return new Response(
                    n.getId(),
                    n.getTitle(),
                    n.getSummary(),
                    n.getContent(),
                    n.getCategory(),
                    n.getIsPublished(),
                    n.getPublishYear(),
                    n.getPublishedAt() != null ? n.getPublishedAt().toString() : null,
                    n.getCreatedAt() != null ? n.getCreatedAt().toString() : null,
                    n.getUpdatedAt() != null ? n.getUpdatedAt().toString() : null
            );
        }
    }
}
