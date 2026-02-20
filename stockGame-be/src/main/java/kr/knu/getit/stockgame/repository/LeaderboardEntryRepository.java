package kr.knu.getit.stockgame.repository;

import kr.knu.getit.stockgame.entity.LeaderboardEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface LeaderboardEntryRepository extends JpaRepository<LeaderboardEntry, String> {

    List<LeaderboardEntry> findTop100ByIsVisibleTrueAndRankGreaterThanOrderByRankAsc(int rank);

    List<LeaderboardEntry> findAllByOrderByRankAsc();

    long countByIsVisibleTrue();

    @Query("SELECT MAX(e.lastUpdated) FROM LeaderboardEntry e")
    java.time.Instant findMaxLastUpdated();

    @Query("SELECT COALESCE(AVG(e.totalAssets), 0) FROM LeaderboardEntry e WHERE e.isVisible = true")
    Double getAverageAssets();

    @Query("SELECT COALESCE(MAX(e.totalAssets), 0) FROM LeaderboardEntry e WHERE e.isVisible = true")
    Double getTopAssets();
}
