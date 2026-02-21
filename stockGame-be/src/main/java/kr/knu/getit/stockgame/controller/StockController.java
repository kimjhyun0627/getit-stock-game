package kr.knu.getit.stockgame.controller;

import kr.knu.getit.stockgame.dto.StockDto;
import kr.knu.getit.stockgame.entity.Stock;
import kr.knu.getit.stockgame.service.StockPriceHistoryService;
import kr.knu.getit.stockgame.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;
    private final StockPriceHistoryService stockPriceHistoryService;

    @GetMapping
    public List<Stock> findAll() {
        return stockService.findAll();
    }

    @GetMapping("/{id}")
    public Stock findOne(@PathVariable String id) {
        return stockService.findOne(id);
    }

    @GetMapping("/{id}/price-history")
    public Map<String, Object> getPriceHistory(@PathVariable String id) {
        return Map.of(
                "stockId", id,
                "prices", stockPriceHistoryService.getByStockId(id)
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Stock create(@RequestBody StockDto.Create dto) {
        return stockService.create(dto);
    }

    @PutMapping("/{id}")
    public Stock update(@PathVariable String id, @RequestBody StockDto.Update dto) {
        return stockService.update(id, dto);
    }

    @PutMapping("/{id}/price")
    public Stock updatePrice(@PathVariable String id, @RequestBody StockDto.UpdatePrice dto) {
        return stockService.updatePrice(id, dto);
    }

    @PutMapping("/{id}/volume")
    public Stock updateVolume(@PathVariable String id, @RequestBody StockDto.UpdateVolume dto) {
        return stockService.updateVolume(id, dto);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> remove(@PathVariable String id) {
        stockService.remove(id);
        return Map.of("message", "주식이 성공적으로 삭제되었습니다.");
    }

    @PostMapping("/simulate")
    public Map<String, String> simulate() {
        stockService.simulatePriceChanges();
        return Map.of("message", "주식 가격 시뮬레이션이 실행되었습니다.");
    }
}
