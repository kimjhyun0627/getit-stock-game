package kr.knu.getit.stockgame.service;

import kr.knu.getit.stockgame.dto.NewsDto;
import kr.knu.getit.stockgame.entity.News;
import kr.knu.getit.stockgame.repository.NewsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NewsService {

    private final NewsRepository newsRepository;

    @Transactional(readOnly = true)
    public List<NewsDto.Response> findAll() {
        return newsRepository.findAllByOrderByUpdatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NewsDto.Response> findPublished() {
        return newsRepository.findByIsPublishedTrueOrderByUpdatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public News findOne(String id) {
        return newsRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ID " + id + "인 뉴스를 찾을 수 없습니다."));
    }

    @Transactional(readOnly = true)
    public List<NewsDto.Response> findByCategory(String category) {
        return newsRepository.findByCategoryOrderByUpdatedAtDesc(category).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public News create(NewsDto.Create dto) {
        News news = News.builder()
                .title(dto.getTitle())
                .summary(dto.getSummary())
                .content(dto.getContent())
                .category(dto.getCategory())
                .isPublished(Boolean.TRUE.equals(dto.getIsPublished()))
                .build();
        return newsRepository.save(news);
    }

    @Transactional
    public News update(String id, NewsDto.Update dto) {
        News news = findOne(id);
        if (dto.getIsPublished() != null) {
            if (dto.getIsPublished()) news.publish();
            else news.unpublish();
        }
        if (dto.getTitle() != null) news.setTitle(dto.getTitle());
        if (dto.getSummary() != null) news.setSummary(dto.getSummary());
        if (dto.getContent() != null) news.setContent(dto.getContent());
        if (dto.getCategory() != null) news.setCategory(dto.getCategory());
        return newsRepository.save(news);
    }

    @Transactional
    public News publish(String id, NewsDto.Publish dto) {
        News news = findOne(id);
        if (dto.getIsPublished()) news.publish();
        else news.unpublish();
        return newsRepository.save(news);
    }

    @Transactional
    public void remove(String id) {
        News news = findOne(id);
        newsRepository.delete(news);
    }

    private NewsDto.Response toResponse(News n) {
        NewsDto.Response r = new NewsDto.Response();
        r.setId(n.getId());
        r.setTitle(n.getTitle());
        r.setSummary(n.getSummary());
        r.setContent(n.getContent());
        r.setCategory(n.getCategory());
        r.setIsPublished(n.getIsPublished());
        r.setPublishedAt(n.getPublishedAt() != null ? n.getPublishedAt().toString() : null);
        r.setCreatedAt(n.getCreatedAt() != null ? n.getCreatedAt().toString() : null);
        r.setUpdatedAt(n.getUpdatedAt() != null ? n.getUpdatedAt().toString() : null);
        return r;
    }
}
