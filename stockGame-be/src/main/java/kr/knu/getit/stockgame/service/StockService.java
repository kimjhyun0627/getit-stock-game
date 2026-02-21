package kr.knu.getit.stockgame.service;

import kr.knu.getit.stockgame.dto.StockDto;
import kr.knu.getit.stockgame.entity.Stock;
import kr.knu.getit.stockgame.entity.StockPriceHistory;
import kr.knu.getit.stockgame.repository.StockPriceHistoryRepository;
import kr.knu.getit.stockgame.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockService {

    private final StockRepository stockRepository;
    private final StockPriceHistoryRepository stockPriceHistoryRepository;
    private final AppConfigService appConfigService;

    @Transactional(readOnly = true)
    public List<Stock> findAll() {
        int currentYear = appConfigService.getNewsCurrentYear();
        List<Stock> stocks = stockRepository.findAll();
        for (Stock stock : stocks) {
            applyYearPrice(stock, currentYear);
        }
        return stocks;
    }

    @Transactional(readOnly = true)
    public Stock findOne(String id) {
        Stock stock = stockRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ID " + id + "인 주식을 찾을 수 없습니다."));
        applyYearPrice(stock, appConfigService.getNewsCurrentYear());
        return stock;
    }

    @Transactional(readOnly = true)
    public Optional<Double> getCurrentYearPrice(String stockId) {
        int year = appConfigService.getNewsCurrentYear();
        return stockPriceHistoryRepository.findByStockIdAndYear(stockId, year)
                .map(StockPriceHistory::getPrice);
    }

    private void applyYearPrice(Stock stock, int currentYear) {
        Optional<StockPriceHistory> currentOpt = stockPriceHistoryRepository.findByStockIdAndYear(stock.getId(), currentYear);
        Optional<StockPriceHistory> previousOpt = stockPriceHistoryRepository.findByStockIdAndYear(stock.getId(), currentYear - 1);
        if (currentOpt.isPresent()) {
            double price = currentOpt.get().getPrice();
            stock.setCurrentPrice(price);
            if (previousOpt.isPresent()) {
                double prevPrice = previousOpt.get().getPrice();
                double ch = price - prevPrice;
                stock.setChange(ch);
                stock.setChangePercent(prevPrice != 0 ? (ch / prevPrice) * 100 : 0);
            } else {
                stock.setChange(0.0);
                stock.setChangePercent(0.0);
            }
        } else {
            stock.setCurrentPrice(0.0);
            stock.setChange(0.0);
            stock.setChangePercent(0.0);
        }
    }

    private void upsertPriceHistory(String stockId, int year, double price) {
        Optional<StockPriceHistory> opt = stockPriceHistoryRepository.findByStockIdAndYear(stockId, year);
        if (opt.isPresent()) {
            opt.get().setPrice(price);
            stockPriceHistoryRepository.save(opt.get());
        } else {
            stockPriceHistoryRepository.save(StockPriceHistory.builder()
                    .stockId(stockId)
                    .year(year)
                    .price(price)
                    .build());
        }
    }

    @Transactional
    public Stock create(StockDto.Create dto) {
        if (stockRepository.existsBySymbol(dto.getSymbol())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "종목코드 " + dto.getSymbol() + "는 이미 사용 중입니다.");
        }
        if (!dto.getSymbol().matches("\\d{6}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "종목코드는 6자리 숫자여야 합니다.");
        }
        Stock stock = Stock.builder()
                .name(dto.getName())
                .symbol(dto.getSymbol())
                .change(0.0)
                .changePercent(0.0)
                .volume(dto.getVolume() != null ? dto.getVolume() : 0L)
                .build();
        stock = stockRepository.save(stock);
        int currentYear = appConfigService.getNewsCurrentYear();
        stockPriceHistoryRepository.save(StockPriceHistory.builder()
                .stockId(stock.getId())
                .year(currentYear)
                .price(dto.getCurrentPrice())
                .build());
        applyYearPrice(stock, currentYear);
        return stock;
    }

    @Transactional
    public Stock update(String id, StockDto.Update dto) {
        Stock stock = findOne(id);
        if (dto.getCurrentPrice() != null) {
            upsertPriceHistory(stock.getId(), appConfigService.getNewsCurrentYear(), dto.getCurrentPrice());
            applyYearPrice(stock, appConfigService.getNewsCurrentYear());
        }
        if (dto.getVolume() != null) stock.updateVolume(dto.getVolume());
        if (dto.getName() != null) stock.setName(dto.getName());
        if (dto.getSymbol() != null) stock.setSymbol(dto.getSymbol());
        return stockRepository.save(stock);
    }

    @Transactional
    public Stock updatePrice(String id, StockDto.UpdatePrice dto) {
        Stock stock = findOne(id);
        upsertPriceHistory(stock.getId(), appConfigService.getNewsCurrentYear(), dto.getCurrentPrice());
        applyYearPrice(stock, appConfigService.getNewsCurrentYear());
        return stock;
    }

    @Transactional
    public Stock updateVolume(String id, StockDto.UpdateVolume dto) {
        Stock stock = findOne(id);
        stock.updateVolume(dto.getVolume());
        return stockRepository.save(stock);
    }

    @Transactional
    public void remove(String id) {
        Stock stock = findOne(id);
        stockRepository.delete(stock);
    }

    @Transactional
    public void simulatePriceChanges() {
        int currentYear = appConfigService.getNewsCurrentYear();
        List<Stock> stocks = stockRepository.findAll();
        for (Stock stock : stocks) {
            Optional<StockPriceHistory> opt = stockPriceHistoryRepository.findByStockIdAndYear(stock.getId(), currentYear);
            if (opt.isEmpty()) continue;
            double currentPrice = opt.get().getPrice();
            double changePercent = (Math.random() - 0.5) * 0.1;
            double newPrice = Math.round(currentPrice * (1 + changePercent));
            opt.get().setPrice(newPrice);
            stockPriceHistoryRepository.save(opt.get());
        }
    }

    public Stock getBySymbol(String symbol) {
        return stockRepository.findBySymbol(symbol).orElse(null);
    }
}
