package kr.knu.getit.stockgame.dto;

import kr.knu.getit.stockgame.entity.UserRole;
import lombok.Data;

import java.math.BigDecimal;

public class UserDto {

    @Data
    public static class Create {
        private String nickname;
        private String name;
        private String email;
        private UserRole role;
        private BigDecimal balance;
        private String kakaoId;
        private String profileImage;
    }

    @Data
    public static class Update {
        private String nickname;
        private String name;
        private String email;
        private UserRole role;
        private BigDecimal balance;
        private String kakaoId;
        private String profileImage;
        private Boolean isLeaderboardVisible;
    }

    @Data
    public static class MakeAdminRequest {
        private String email;
        private String nickname;
    }
}
