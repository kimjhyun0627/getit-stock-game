package kr.knu.getit.stockgame.seed;

import kr.knu.getit.stockgame.entity.News;
import kr.knu.getit.stockgame.entity.Stock;
import kr.knu.getit.stockgame.repository.NewsRepository;
import kr.knu.getit.stockgame.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class SeedRunner implements ApplicationRunner {

    private final StockRepository stockRepository;
    private final NewsRepository newsRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (stockRepository.count() == 0) {
            List<Stock> stocks = SeedData.stockSeeds();
            stockRepository.saveAll(stocks);
            log.info("시드 주식 데이터 {} 건 삽입 완료", stocks.size());
        }
        if (newsRepository.count() == 0) {
            List<News> news = SeedData.newsSeeds();
            newsRepository.saveAll(news);
            log.info("시드 뉴스 데이터 {} 건 삽입 완료", news.size());
        }
    }
}
