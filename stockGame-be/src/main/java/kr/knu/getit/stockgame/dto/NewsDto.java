package kr.knu.getit.stockgame.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import kr.knu.getit.stockgame.entity.News;

public final class NewsDto {

    public record Create(
            @NotBlank String content,
            @NotBlank String category,
            Boolean isPublished,
            Integer publishYear,
            String reliability
    ) {}

    public record Update(
            String content,
            String category,
            Boolean isPublished,
            Integer publishYear,
            String reliability
    ) {}

    public record Publish(@NotNull Boolean isPublished) {}

    public record Response(
            String id,
            String content,
            String category,
            Boolean isPublished,
            Integer publishYear,
            String reliability,
            String createdAt,
            String updatedAt
    ) {
        public static Response from(News n) {
            return new Response(
                    n.getId(),
                    n.getContent(),
                    n.getCategory(),
                    n.getIsPublished(),
                    n.getPublishYear(),
                    n.getReliability(),
                    n.getCreatedAt() != null ? n.getCreatedAt().toString() : null,
                    n.getUpdatedAt() != null ? n.getUpdatedAt().toString() : null
            );
        }
    }
}
