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
    private final AppConfigService appConfigService;

    @Transactional(readOnly = true)
    public List<NewsDto.Response> findAll() {
        return newsRepository.findAllByOrderByUpdatedAtDesc().stream()
                .map(NewsDto.Response::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NewsDto.Response> findPublished(Integer filterYear) {
        int currentYear = appConfigService.getNewsCurrentYear();
        int startYear = appConfigService.getGameStartYear();
        int endYear = appConfigService.getGameEndYear();
        Integer clampedYear = null;
        if (filterYear != null) {
            int y = Math.max(startYear, Math.min(endYear, filterYear));
            clampedYear = y;
        }
        List<News> list = newsRepository.findPublishedForPublic(currentYear, clampedYear);
        return list.stream().map(NewsDto.Response::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public int getCurrentYear() {
        return appConfigService.getNewsCurrentYear();
    }

    @Transactional(readOnly = true)
    public int getGameStartYear() {
        return appConfigService.getGameStartYear();
    }

    @Transactional(readOnly = true)
    public int getGameEndYear() {
        return appConfigService.getGameEndYear();
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
                .content(dto.content())
                .category(dto.category())
                .isPublished(Boolean.TRUE.equals(dto.isPublished()))
                .publishYear(dto.publishYear())
                .reliability(dto.reliability())
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
        if (dto.content() != null) news.setContent(dto.content());
        if (dto.category() != null) news.setCategory(dto.category());
        news.setPublishYear(dto.publishYear());
        if (dto.reliability() != null) news.setReliability(dto.reliability());
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
