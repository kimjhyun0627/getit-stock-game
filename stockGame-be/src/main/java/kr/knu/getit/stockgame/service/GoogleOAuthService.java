package kr.knu.getit.stockgame.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleOAuthService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.google.client-id}")
    private String clientId;

    @Value("${app.google.client-secret}")
    private String clientSecret;

    @Value("${app.google.redirect-uri}")
    private String redirectUri;

    public String getAuthUrl() {
        return "https://accounts.google.com/o/oauth2/v2/auth"
                + "?client_id=" + clientId
                + "&redirect_uri=" + redirectUri
                + "&response_type=code"
                + "&scope=openid%20email%20profile"
                + "&access_type=offline"
                + "&prompt=consent";
    }

    public String getAccessToken(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of(
                "client_id", clientId,
                "client_secret", clientSecret,
                "code", code,
                "grant_type", "authorization_code",
                "redirect_uri", redirectUri
        );

        try {
            String bodyStr = objectMapper.writeValueAsString(body);
            HttpEntity<String> request = new HttpEntity<>(bodyStr, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://oauth2.googleapis.com/token",
                    request,
                    String.class
            );

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new RuntimeException("Google 액세스 토큰을 가져오는데 실패했습니다.");
            }

            JsonNode node = objectMapper.readTree(Objects.requireNonNull(response.getBody()));
            return node.path("access_token").asText();
        } catch (Exception e) {
            throw new RuntimeException("Google 액세스 토큰 실패", e);
        }
    }

    public GoogleUserInfo getUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(Objects.requireNonNull(accessToken));
        HttpEntity<Void> request = new HttpEntity<>(Objects.requireNonNull(headers));
        ResponseEntity<String> response = restTemplate.exchange(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                HttpMethod.GET,
                request,
                String.class
        );

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new RuntimeException("Google 사용자 정보를 가져오는데 실패했습니다.");
        }

        try {
            JsonNode root = objectMapper.readTree(Objects.requireNonNull(response.getBody()));
            return new GoogleUserInfo(
                    root.path("id").asText(),
                    root.path("email").asText(""),
                    root.path("name").asText(""),
                    root.path("picture").asText("")
            );
        } catch (Exception e) {
            throw new RuntimeException("Google 사용자 정보 파싱 실패", e);
        }
    }

    public record GoogleUserInfo(String id, String email, String name, String picture) {}
}
