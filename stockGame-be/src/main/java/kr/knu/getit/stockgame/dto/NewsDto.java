package kr.knu.getit.stockgame.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;

public class NewsDto {

    @Data
    public static class Create {
        @NotBlank
        private String title;
        @NotBlank
        private String summary;
        @NotBlank
        private String content;
        @NotBlank
        private String category;
        private Boolean isPublished;
    }

    @Data
    public static class Update {
        private String title;
        private String summary;
        private String content;
        private String category;
        private Boolean isPublished;
    }

    @Data
    public static class Publish {
        @NotNull
        private Boolean isPublished;
    }

    @Data
    public static class Response {
        private String id;
        private String title;
        private String summary;
        private String content;
        private String category;
        private Boolean isPublished;
        private String publishedAt;
        private String createdAt;
        private String updatedAt;
    }
}
