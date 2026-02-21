package kr.knu.getit.stockgame.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import kr.knu.getit.stockgame.dto.AuthDto;
import kr.knu.getit.stockgame.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Objects;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @GetMapping("/kakao/login")
    public AuthDto.OAuthUrlResponse kakaoLogin() {
        return AuthDto.OAuthUrlResponse.of(authService.getKakaoAuthUrl());
    }

    @GetMapping("/google/login")
    public AuthDto.OAuthUrlResponse googleLogin() {
        return AuthDto.OAuthUrlResponse.of(authService.getGoogleAuthUrl());
    }

    @GetMapping("/kakao/callback")
    public ResponseEntity<?> kakaoCallback(@RequestParam(required = false) String code) throws Exception {
        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest().body(
                    new ErrorBody(HttpStatus.BAD_REQUEST.value(), "인증 코드가 필요합니다."));
        }
        try {
            AuthDto.AuthTokensResponse result = authService.kakaoLogin(code);
            ObjectMapper om = new ObjectMapper();
            String userJson = om.writeValueAsString(result.user());
            String redirectUrl = frontendUrl + "/auth/kakao/callback?accessToken=" + result.accessToken()
                    + "&refreshToken=" + result.refreshToken()
                    + "&user=" + URLEncoder.encode(userJson, StandardCharsets.UTF_8);
            URI location = Objects.requireNonNull(URI.create(redirectUrl));
            return ResponseEntity.status(HttpStatus.FOUND).location(location).build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ErrorBody(HttpStatus.BAD_REQUEST.value(), e.getMessage() != null ? e.getMessage() : "카카오 로그인에 실패했습니다."));
        }
    }

    @GetMapping("/google/callback")
    public ResponseEntity<?> googleCallback(@RequestParam(required = false) String code) throws Exception {
        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest().body(
                    new ErrorBody(HttpStatus.BAD_REQUEST.value(), "인증 코드가 필요합니다."));
        }
        try {
            AuthDto.AuthTokensResponse result = authService.googleLogin(code);
            ObjectMapper om = new ObjectMapper();
            String userJson = om.writeValueAsString(result.user());
            String redirectUrl = frontendUrl + "/auth/google/callback?accessToken=" + result.accessToken()
                    + "&refreshToken=" + result.refreshToken()
                    + "&user=" + URLEncoder.encode(userJson, StandardCharsets.UTF_8);
            URI location = Objects.requireNonNull(URI.create(redirectUrl));
            return ResponseEntity.status(HttpStatus.FOUND).location(location).build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ErrorBody(HttpStatus.BAD_REQUEST.value(), e.getMessage() != null ? e.getMessage() : "구글 로그인에 실패했습니다."));
        }
    }

    @PostMapping("/refresh")
    public AuthDto.AuthTokensResponse refresh(@RequestBody AuthDto.RefreshRequest body) {
        return authService.refreshToken(body.refreshToken());
    }

    public record ErrorBody(int statusCode, String message) {}
}
