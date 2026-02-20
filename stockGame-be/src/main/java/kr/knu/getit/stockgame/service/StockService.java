package kr.knu.getit.stockgame.service;

import kr.knu.getit.stockgame.dto.StockDto;
import kr.knu.getit.stockgame.entity.Stock;
import kr.knu.getit.stockgame.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockService {

    private final StockRepository stockRepository;

    @Transactional(readOnly = true)
    public List<Stock> findAll() {
        return stockRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Stock findOne(String id) {
        return stockRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ID " + id + "인 주식을 찾을 수 없습니다."));
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
                .currentPrice(dto.getCurrentPrice())
                .previousPrice(dto.getCurrentPrice())
                .change(0.0)
                .changePercent(0.0)
                .volume(dto.getVolume() != null ? dto.getVolume() : 0L)
                .build();
        return stockRepository.save(stock);
    }

    @Transactional
    public Stock update(String id, StockDto.Update dto) {
        Stock stock = findOne(id);
        if (dto.getCurrentPrice() != null) stock.updatePrice(dto.getCurrentPrice());
        if (dto.getVolume() != null) stock.updateVolume(dto.getVolume());
        if (dto.getName() != null) stock.setName(dto.getName());
        if (dto.getSymbol() != null) stock.setSymbol(dto.getSymbol());
        return stockRepository.save(stock);
    }

    @Transactional
    public Stock updatePrice(String id, StockDto.UpdatePrice dto) {
        Stock stock = findOne(id);
        stock.updatePrice(dto.getCurrentPrice());
        return stockRepository.save(stock);
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
        List<Stock> stocks = findAll();
        for (Stock stock : stocks) {
            double changePercent = (Math.random() - 0.5) * 0.1;
            long newPrice = Math.round(stock.getCurrentPrice() * (1 + changePercent));
            stock.updatePrice(newPrice);
            stockRepository.save(stock);
        }
    }

    public Stock getBySymbol(String symbol) {
        return stockRepository.findBySymbol(symbol).orElse(null);
    }
}
