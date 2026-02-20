package kr.knu.getit.stockgame.repository;

import kr.knu.getit.stockgame.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StockRepository extends JpaRepository<Stock, String> {

    Optional<Stock> findBySymbol(String symbol);

    boolean existsBySymbol(String symbol);
}
