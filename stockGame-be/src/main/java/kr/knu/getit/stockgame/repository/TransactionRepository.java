package kr.knu.getit.stockgame.repository;

import kr.knu.getit.stockgame.entity.Transaction;
import kr.knu.getit.stockgame.entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, String> {

    List<Transaction> findByUserIdOrderByCreatedAtDescIdDesc(String userId);

    @Query("SELECT COALESCE(SUM(t.quantity), 0) FROM Transaction t WHERE t.stockId = :stockId AND t.type = :type")
    Long sumQuantityByStockIdAndType(@Param("stockId") String stockId, @Param("type") TransactionType type);
}
