package kr.knu.getit.stockgame.repository;

import kr.knu.getit.stockgame.entity.AppConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppConfigRepository extends JpaRepository<AppConfig, String> {

    Optional<AppConfig> findByConfigKey(String configKey);
}
