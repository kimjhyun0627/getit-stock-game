package kr.knu.getit.stockgame.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class KakaoOAuthService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.kakao.client-id}")
    private String clientId;

    @Value("${app.kakao.client-secret}")
    private String clientSecret;

    @Value("${app.kakao.redirect-uri}")
    private String redirectUri;

    public String getAuthUrl() {
        return "https://kauth.kakao.com/oauth/authorize?client_id=" + clientId
                + "&redirect_uri=" + redirectUri
                + "&response_type=code";
    }

    public String getAccessToken(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("code", code);
        params.add("redirect_uri", redirectUri);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(
                "https://kauth.kakao.com/oauth/token",
                request,
                String.class
        );

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new RuntimeException("카카오 액세스 토큰을 가져오는데 실패했습니다.");
        }

        try {
            JsonNode node = objectMapper.readTree(response.getBody());
            return node.path("access_token").asText();
        } catch (Exception e) {
            throw new RuntimeException("카카오 액세스 토큰 파싱 실패", e);
        }
    }

    public KakaoUserInfo getUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<Void> request = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(
                "https://kapi.kakao.com/v2/user/me",
                HttpMethod.GET,
                request,
                String.class
        );

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new RuntimeException("카카오 사용자 정보를 가져오는데 실패했습니다.");
        }

        try {
            JsonNode root = objectMapper.readTree(response.getBody());
            String id = root.path("id").asText();
            JsonNode kakaoAccount = root.path("kakao_account");
            String email = kakaoAccount.path("email").asText("");
            JsonNode profile = kakaoAccount.path("profile");
            String nickname = profile.path("nickname").asText("");
            String profileImageUrl = profile.path("profile_image_url").asText("");
            return new KakaoUserInfo(id, email, nickname, profileImageUrl);
        } catch (Exception e) {
            throw new RuntimeException("카카오 사용자 정보 파싱 실패", e);
        }
    }

    public record KakaoUserInfo(String id, String email, String nickname, String profileImageUrl) {}
}
