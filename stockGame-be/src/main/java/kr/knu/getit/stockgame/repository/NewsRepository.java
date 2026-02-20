package kr.knu.getit.stockgame.repository;

import kr.knu.getit.stockgame.entity.News;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NewsRepository extends JpaRepository<News, String> {

    List<News> findAllByOrderByUpdatedAtDesc();

    List<News> findByIsPublishedTrueOrderByUpdatedAtDesc();

    @Query("SELECT n FROM News n WHERE n.isPublished = true AND (n.publishYear IS NULL OR n.publishYear <= :currentYear) AND (:filterYear IS NULL OR n.publishYear = :filterYear) ORDER BY n.updatedAt DESC")
    List<News> findPublishedForPublic(@Param("currentYear") int currentYear, @Param("filterYear") Integer filterYear);

    List<News> findByCategoryOrderByUpdatedAtDesc(String category);
}
