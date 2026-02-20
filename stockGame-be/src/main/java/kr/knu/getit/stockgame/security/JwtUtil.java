package kr.knu.getit.stockgame.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import kr.knu.getit.stockgame.config.JwtProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Component
@RequiredArgsConstructor
public class JwtUtil {

    private final JwtProperties jwtProperties;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(String userId, String email, String role) {
        return Jwts.builder()
                .subject(userId)
                .claim("email", email)
                .claim("role", role)
                .issuedAt(Date.from(Instant.now()))
                .expiration(parseExpiration(jwtProperties.getAccessExpiresIn()))
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(String userId) {
        return Jwts.builder()
                .subject(userId)
                .issuedAt(Date.from(Instant.now()))
                .expiration(parseExpiration(jwtProperties.getRefreshExpiresIn()))
                .signWith(getSigningKey())
                .compact();
    }

    public JwtClaims getClaims(String token) {
        Jws<Claims> jws = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token);
        Claims body = jws.getPayload();
        return new JwtClaims(
                body.getSubject(),
                body.get("email", String.class),
                body.get("role", String.class)
        );
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Date parseExpiration(String expiresIn) {
        long seconds = 7200; // default 2h
        if (expiresIn != null) {
            if (expiresIn.endsWith("h")) {
                seconds = Long.parseLong(expiresIn.replace("h", "")) * 3600;
            } else if (expiresIn.endsWith("d")) {
                seconds = Long.parseLong(expiresIn.replace("d", "")) * 86400;
            } else if (expiresIn.endsWith("m")) {
                seconds = Long.parseLong(expiresIn.replace("m", "")) * 60;
            }
        }
        return Date.from(Instant.now().plusSeconds(seconds));
    }

    public record JwtClaims(String sub, String email, String role) {}
}
