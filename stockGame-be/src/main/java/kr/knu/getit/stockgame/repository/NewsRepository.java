package kr.knu.getit.stockgame.repository;

import kr.knu.getit.stockgame.entity.News;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NewsRepository extends JpaRepository<News, String> {

    List<News> findAllByOrderByUpdatedAtDesc();

    List<News> findByIsPublishedTrueOrderByUpdatedAtDesc();

    @Query("SELECT n FROM News n WHERE n.isPublished = true AND (n.publishYear IS NULL OR n.publishYear = :year) ORDER BY n.updatedAt DESC")
    List<News> findPublishedByYear(@Param("year") Integer year);

    List<News> findByCategoryOrderByUpdatedAtDesc(String category);
}
