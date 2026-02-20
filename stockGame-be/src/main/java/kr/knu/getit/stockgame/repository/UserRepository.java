package kr.knu.getit.stockgame.repository;

import kr.knu.getit.stockgame.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByKakaoId(String kakaoId);

    Optional<User> findByGoogleId(String googleId);

    Optional<User> findByEmail(String email);

    Optional<User> findByNickname(String nickname);
}
