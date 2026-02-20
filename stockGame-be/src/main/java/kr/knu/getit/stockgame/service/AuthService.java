package kr.knu.getit.stockgame.service;

import kr.knu.getit.stockgame.dto.AuthDto;
import kr.knu.getit.stockgame.entity.User;
import kr.knu.getit.stockgame.entity.UserRole;
import kr.knu.getit.stockgame.entity.UserSession;
import kr.knu.getit.stockgame.repository.UserRepository;
import kr.knu.getit.stockgame.repository.UserSessionRepository;
import kr.knu.getit.stockgame.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserSessionRepository sessionRepository;
    private final JwtUtil jwtUtil;
    private final KakaoOAuthService kakaoOAuthService;
    private final GoogleOAuthService googleOAuthService;

    @Value("${app.jwt.refresh-expires-in:7d}")
    private String refreshExpiresIn;

    public String getKakaoAuthUrl() {
        return kakaoOAuthService.getAuthUrl();
    }

    public String getGoogleAuthUrl() {
        return googleOAuthService.getAuthUrl();
    }

    @Transactional
    public AuthDto.AuthTokensResponse kakaoLogin(String code) {
        String accessToken = kakaoOAuthService.getAccessToken(code);
        KakaoOAuthService.KakaoUserInfo info = kakaoOAuthService.getUserInfo(accessToken);

        User user = userRepository.findByKakaoId(info.id())
                .orElseGet(() -> createUserFromKakao(info));

        if (user.getLastLoginAt() == null || user.getLastLoginAt().isBefore(Instant.now().minus(1, ChronoUnit.MINUTES))) {
            user.setLastLoginAt(Instant.now());
            userRepository.save(user);
        }

        sessionRepository.deleteByUserId(user.getId());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());
        saveRefreshToken(user.getId(), refreshToken);

        String jwtAccess = jwtUtil.generateAccessToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
        );

        return toAuthResponse(user, jwtAccess, refreshToken);
    }

    @Transactional
    public AuthDto.AuthTokensResponse googleLogin(String code) {
        String accessToken = googleOAuthService.getAccessToken(code);
        GoogleOAuthService.GoogleUserInfo info = googleOAuthService.getUserInfo(accessToken);

        User user = userRepository.findByGoogleId(info.id())
                .orElseGet(() -> createUserFromGoogle(info));

        if (user.getLastLoginAt() == null || user.getLastLoginAt().isBefore(Instant.now().minus(1, ChronoUnit.MINUTES))) {
            user.setLastLoginAt(Instant.now());
            userRepository.save(user);
        }

        sessionRepository.deleteByUserId(user.getId());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());
        saveRefreshToken(user.getId(), refreshToken);

        String jwtAccess = jwtUtil.generateAccessToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
        );

        return toAuthResponse(user, jwtAccess, refreshToken);
    }

    private User createUserFromKakao(KakaoOAuthService.KakaoUserInfo info) {
        long count = userRepository.count();
        UserRole role = count == 0 ? UserRole.ADMIN : UserRole.USER;
        User user = User.builder()
                .email(info.email())
                .name(info.nickname())
                .nickname(info.nickname())
                .profileImage(info.profileImageUrl())
                .kakaoId(info.id())
                .role(role)
                .balance(new BigDecimal("10000000"))
                .lastLoginAt(Instant.now())
                .isLeaderboardVisible(true)
                .build();
        return Objects.requireNonNull(userRepository.save(user));
    }

    private User createUserFromGoogle(GoogleOAuthService.GoogleUserInfo info) {
        long count = userRepository.count();
        UserRole role = count == 0 ? UserRole.ADMIN : UserRole.USER;
        User user = User.builder()
                .email(info.email())
                .name(info.name())
                .nickname(info.name())
                .profileImage(info.picture())
                .googleId(info.id())
                .role(role)
                .balance(new BigDecimal("10000000"))
                .lastLoginAt(Instant.now())
                .isLeaderboardVisible(true)
                .build();
        return Objects.requireNonNull(userRepository.save(user));
    }

    private void saveRefreshToken(String userId, String refreshToken) {
        long days = 7;
        if (refreshExpiresIn != null && refreshExpiresIn.endsWith("d")) {
            days = Long.parseLong(refreshExpiresIn.replace("d", ""));
        }
        UserSession session = Objects.requireNonNull(UserSession.builder()
                .userId(Objects.requireNonNull(userId))
                .refreshToken(Objects.requireNonNull(refreshToken))
                .expiresAt(Instant.now().plus(days, ChronoUnit.DAYS))
                .build());
        sessionRepository.save(session);
    }

    @Transactional
    public AuthDto.AuthTokensResponse refreshToken(String refreshToken) {
        UserSession session = sessionRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "유효하지 않은 리프레시 토큰입니다."));

        if (session.getExpiresAt().isBefore(Instant.now())) {
            sessionRepository.delete(session);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "유효하지 않은 리프레시 토큰입니다.");
        }

        User user = Objects.requireNonNull(userRepository.findById(session.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다.")));

        sessionRepository.delete(session);
        String newRefresh = jwtUtil.generateRefreshToken(user.getId());
        saveRefreshToken(user.getId(), newRefresh);
        String newAccess = jwtUtil.generateAccessToken(user.getId(), Objects.requireNonNull(user.getEmail()), user.getRole().name());

        return toAuthResponse(user, newAccess, newRefresh);
    }

    public Optional<User> validateUser(String userId) {
        return userRepository.findById(userId);
    }

    @Transactional
    public AuthDto.AuthTokensResponse createTokensForUser(User user) {
        String userId = Objects.requireNonNull(user.getId());
        sessionRepository.deleteByUserId(userId);
        String refreshToken = jwtUtil.generateRefreshToken(userId);
        saveRefreshToken(userId, refreshToken);
        String accessToken = jwtUtil.generateAccessToken(
                userId,
                Objects.requireNonNull(user.getEmail()),
                user.getRole().name()
        );
        return toAuthResponse(user, accessToken, refreshToken);
    }

    private static AuthDto.AuthTokensResponse toAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthDto.AuthTokensResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(AuthDto.AuthTokensResponse.UserInfo.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .nickname(user.getNickname())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .balance(user.getBalance())
                        .build())
                .build();
    }
}
