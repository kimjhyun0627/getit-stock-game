package kr.knu.getit.stockgame.repository;

import kr.knu.getit.stockgame.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PortfolioRepository extends JpaRepository<Portfolio, String> {

    List<Portfolio> findByUserIdOrderByUpdatedAtDesc(String userId);

    Optional<Portfolio> findByUserIdAndStockId(String userId, String stockId);
}
