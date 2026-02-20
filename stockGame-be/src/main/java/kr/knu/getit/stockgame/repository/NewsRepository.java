package kr.knu.getit.stockgame.repository;

import kr.knu.getit.stockgame.entity.News;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NewsRepository extends JpaRepository<News, String> {

    List<News> findAllByOrderByUpdatedAtDesc();

    List<News> findByIsPublishedTrueOrderByUpdatedAtDesc();

    List<News> findByCategoryOrderByUpdatedAtDesc(String category);
}
