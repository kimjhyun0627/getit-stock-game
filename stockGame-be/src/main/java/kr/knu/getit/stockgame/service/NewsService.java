package kr.knu.getit.stockgame.service;

import kr.knu.getit.stockgame.dto.NewsDto;
import kr.knu.getit.stockgame.entity.News;
import kr.knu.getit.stockgame.repository.NewsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NewsService {

    private final NewsRepository newsRepository;

    @Transactional(readOnly = true)
    public List<NewsDto.Response> findAll() {
        return newsRepository.findAllByOrderByUpdatedAtDesc().stream()
                .map(NewsDto.Response::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NewsDto.Response> findPublished(Integer year) {
        List<News> list = year != null
                ? newsRepository.findPublishedByYear(year)
                : newsRepository.findByIsPublishedTrueOrderByUpdatedAtDesc();
        return list.stream().map(NewsDto.Response::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public News findOne(String id) {
        return Objects.requireNonNull(newsRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ID " + id + "인 뉴스를 찾을 수 없습니다.")));
    }

    @Transactional(readOnly = true)
    public List<NewsDto.Response> findByCategory(String category) {
        return newsRepository.findByCategoryOrderByUpdatedAtDesc(category).stream()
                .map(NewsDto.Response::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public News create(NewsDto.Create dto) {
        News news = News.builder()
                .title(dto.title())
                .summary(dto.summary())
                .content(dto.content())
                .category(dto.category())
                .isPublished(Boolean.TRUE.equals(dto.isPublished()))
                .publishYear(dto.publishYear())
                .build();
        return newsRepository.save(news);
    }

    @Transactional
    public News update(String id, NewsDto.Update dto) {
        News news = Objects.requireNonNull(findOne(id));
        if (dto.isPublished() != null) {
            if (dto.isPublished()) news.publish();
            else news.unpublish();
        }
        if (dto.title() != null) news.setTitle(dto.title());
        if (dto.summary() != null) news.setSummary(dto.summary());
        if (dto.content() != null) news.setContent(dto.content());
        if (dto.category() != null) news.setCategory(dto.category());
        if (dto.publishYear() != null) news.setPublishYear(dto.publishYear());
        return newsRepository.save(news);
    }

    @Transactional
    public News publish(String id, NewsDto.Publish dto) {
        News news = Objects.requireNonNull(findOne(id));
        if (dto.isPublished()) news.publish();
        else news.unpublish();
        return newsRepository.save(news);
    }

    @Transactional
    public void remove(String id) {
        News news = Objects.requireNonNull(findOne(id));
        newsRepository.delete(news);
    }

}
