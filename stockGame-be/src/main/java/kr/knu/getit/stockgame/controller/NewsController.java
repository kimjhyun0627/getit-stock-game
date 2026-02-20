package kr.knu.getit.stockgame.controller;

import kr.knu.getit.stockgame.dto.NewsDto;
import kr.knu.getit.stockgame.entity.News;
import kr.knu.getit.stockgame.service.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    @GetMapping
    public List<NewsDto.Response> findAll() {
        return newsService.findAll();
    }

    @GetMapping("/current-year")
    public Map<String, Integer> getCurrentYear() {
        return Map.of("currentYear", newsService.getCurrentYear());
    }

    @GetMapping("/published")
    public List<NewsDto.Response> findPublished(@RequestParam(required = false) Integer year) {
        return newsService.findPublished(year);
    }

    @GetMapping("/category/{category}")
    public List<NewsDto.Response> findByCategory(@PathVariable String category) {
        return newsService.findByCategory(category);
    }

    @GetMapping("/{id}")
    public News findOne(@PathVariable String id) {
        return newsService.findOne(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public News create(@RequestBody NewsDto.Create dto) {
        return newsService.create(dto);
    }

    @PutMapping("/{id}")
    public News update(@PathVariable String id, @RequestBody NewsDto.Update dto) {
        return newsService.update(id, dto);
    }

    @PutMapping("/{id}/publish")
    public News publish(@PathVariable String id, @RequestBody NewsDto.Publish dto) {
        return newsService.publish(id, dto);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> remove(@PathVariable String id) {
        newsService.remove(id);
        return Map.of("message", "뉴스가 성공적으로 삭제되었습니다.");
    }
}
