package kr.knu.getit.stockgame.repository;

import kr.knu.getit.stockgame.entity.StockPriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StockPriceHistoryRepository extends JpaRepository<StockPriceHistory, String> {

    List<StockPriceHistory> findByStockIdOrderByYearAsc(String stockId);

    Optional<StockPriceHistory> findByStockIdAndYear(String stockId, Integer year);

    void deleteByStockId(String stockId);
}
