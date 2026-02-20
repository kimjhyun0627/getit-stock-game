package kr.knu.getit.stockgame.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

public class AuthDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthTokensResponse {
        private String accessToken;
        private String refreshToken;
        private UserInfo user;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class UserInfo {
            private String id;
            private String name;
            private String nickname;
            private String email;
            private String role;
            private BigDecimal balance;
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RefreshRequest {
        private String refreshToken;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OAuthUrlResponse {
        private String url;
    }
}
