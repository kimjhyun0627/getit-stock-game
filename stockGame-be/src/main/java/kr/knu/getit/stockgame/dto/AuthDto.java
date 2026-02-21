package kr.knu.getit.stockgame.dto;

import kr.knu.getit.stockgame.entity.User;

import java.math.BigDecimal;

public class AuthDto {

    public record UserInfo(
            String id,
            String name,
            String nickname,
            String email,
            String role,
            BigDecimal balance
    ) {
        public static UserInfo from(User user) {
            return new UserInfo(
                    user.getId(),
                    user.getName(),
                    user.getNickname(),
                    user.getEmail(),
                    user.getRole().name(),
                    user.getBalance()
            );
        }
    }

    public record AuthTokensResponse(
            String accessToken,
            String refreshToken,
            UserInfo user
    ) {
        public static AuthTokensResponse from(User user, String accessToken, String refreshToken) {
            return new AuthTokensResponse(
                    accessToken,
                    refreshToken,
                    UserInfo.from(user)
            );
        }
    }

    public record RefreshRequest(String refreshToken) {}

    public record OAuthUrlResponse(String url) {
        public static OAuthUrlResponse of(String url) {
            return new OAuthUrlResponse(url);
        }
    }
}
