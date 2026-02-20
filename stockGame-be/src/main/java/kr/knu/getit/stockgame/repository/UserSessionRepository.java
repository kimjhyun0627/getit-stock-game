package kr.knu.getit.stockgame.repository;

import kr.knu.getit.stockgame.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserSessionRepository extends JpaRepository<UserSession, String> {

    Optional<UserSession> findByRefreshToken(String refreshToken);

    void deleteByUserId(String userId);

    void deleteByRefreshToken(String refreshToken);
}
