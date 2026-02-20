package kr.knu.getit.stockgame.service;

import kr.knu.getit.stockgame.dto.PortfolioDto;
import kr.knu.getit.stockgame.entity.*;
import kr.knu.getit.stockgame.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final TransactionRepository transactionRepository;
    private final StockRepository stockRepository;
    private final UserRepository userRepository;

    @Transactional
    public Portfolio buyStock(String userId, PortfolioDto.BuyOrder order) {
        User user = Objects.requireNonNull(userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다.")));
        Stock stock = Objects.requireNonNull(stockRepository.findById(order.getStockId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "주식을 찾을 수 없습니다.")));

        double totalCost = order.getPrice() * order.getQuantity();
        if (user.getBalance().doubleValue() < totalCost) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "잔고가 부족합니다.");
        }

        Optional<Portfolio> existing = portfolioRepository.findByUserIdAndStockId(userId, order.getStockId());
        Portfolio portfolio;
        if (existing.isPresent()) {
            portfolio = existing.get();
            long newQty = portfolio.getQuantity() + order.getQuantity();
            double newAvg = (portfolio.getAveragePrice() * portfolio.getQuantity() + totalCost) / newQty;
            portfolio.setQuantity(newQty);
            portfolio.setAveragePrice(newAvg);
        } else {
            portfolio = Portfolio.builder()
                    .userId(userId)
                    .stockId(order.getStockId())
                    .quantity(order.getQuantity())
                    .averagePrice(order.getPrice())
                    .build();
        }
        portfolio = Objects.requireNonNull(portfolioRepository.save(portfolio));

        user.setBalance(user.getBalance().subtract(BigDecimal.valueOf(totalCost)));
        userRepository.save(user);

        Transaction tx = Transaction.builder()
                .userId(userId)
                .stockId(order.getStockId())
                .type(TransactionType.BUY)
                .quantity(order.getQuantity())
                .price(order.getPrice())
                .totalAmount(totalCost)
                .build();
        transactionRepository.save(tx);

        stock.increaseVolume(order.getQuantity());
        stockRepository.save(stock);

        return portfolio;
    }

    @Transactional
    public Portfolio sellStock(String userId, PortfolioDto.SellOrder order) {
        User user = Objects.requireNonNull(userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다.")));
        Stock stock = Objects.requireNonNull(stockRepository.findById(order.getStockId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "주식을 찾을 수 없습니다.")));

        Portfolio portfolio = Objects.requireNonNull(portfolioRepository.findByUserIdAndStockId(userId, order.getStockId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "보유하고 있지 않은 주식입니다.")));

        if (portfolio.getQuantity() < order.getQuantity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "보유 수량보다 많은 수량을 매도할 수 없습니다.");
        }

        double sellAmount = order.getPrice() * order.getQuantity();
        long remaining = portfolio.getQuantity() - order.getQuantity();

        if (remaining == 0) {
            portfolioRepository.delete(portfolio);
        } else {
            portfolio.setQuantity(remaining);
            portfolioRepository.save(portfolio);
        }

        user.setBalance(user.getBalance().add(BigDecimal.valueOf(sellAmount)));
        userRepository.save(user);

        Transaction tx = Transaction.builder()
                .userId(userId)
                .stockId(order.getStockId())
                .type(TransactionType.SELL)
                .quantity(order.getQuantity())
                .price(order.getPrice())
                .totalAmount(sellAmount)
                .build();
        transactionRepository.save(tx);

        stock.increaseVolume(order.getQuantity());
        stockRepository.save(stock);

        return portfolio;
    }

    @Transactional(readOnly = true)
    public List<PortfolioDto.PortfolioResponse> getUserPortfolio(String userId) {
        List<Portfolio> list = portfolioRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        return list.stream().map(p -> {
            Stock s = stockRepository.findById(Objects.requireNonNull(p).getStockId()).orElse(null);
            if (s == null) return null;
            double currentPrice = s.getCurrentPrice();
            double totalValue = p.getQuantity() * currentPrice;
            double profitLoss = (currentPrice - p.getAveragePrice()) * p.getQuantity();
            double profitLossPercent = p.getAveragePrice() != 0
                    ? (profitLoss / (p.getAveragePrice() * p.getQuantity())) * 100
                    : 0;
            PortfolioDto.PortfolioResponse r = new PortfolioDto.PortfolioResponse();
            r.setStockId(p.getStockId());
            r.setStockName(s.getName());
            r.setSymbol(s.getSymbol());
            r.setQuantity(p.getQuantity());
            r.setAveragePrice(p.getAveragePrice());
            r.setCurrentPrice(currentPrice);
            r.setTotalValue(totalValue);
            r.setProfitLoss(profitLoss);
            r.setProfitLossPercent(profitLossPercent);
            return r;
        }).filter(r -> r != null).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PortfolioDto.TransactionResponse> getUserTransactions(String userId) {
        List<Transaction> list = transactionRepository.findByUserIdOrderByCreatedAtDescIdDesc(userId);
        return list.stream().map(t -> {
            Transaction tx = Objects.requireNonNull(t);
            Stock s = stockRepository.findById(tx.getStockId()).orElse(null);
            PortfolioDto.TransactionResponse r = new PortfolioDto.TransactionResponse();
            r.setId(tx.getId());
            r.setStockId(tx.getStockId());
            r.setStockName(s != null ? s.getName() : "");
            r.setSymbol(s != null ? s.getSymbol() : "");
            r.setType(tx.getType() == TransactionType.BUY ? "buy" : "sell");
            r.setQuantity(tx.getQuantity());
            r.setPrice(tx.getPrice());
            r.setTotalAmount(tx.getTotalAmount());
            r.setCreatedAt(tx.getCreatedAt() != null ? tx.getCreatedAt().toString() : null);
            return r;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<Portfolio> getPortfolioByStock(String userId, String stockId) {
        return portfolioRepository.findByUserIdAndStockId(userId, stockId);
    }

    @Transactional(readOnly = true)
    public PortfolioDto.BalanceResponse getUserBalance(String userId) {
        User user = Objects.requireNonNull(userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다.")));
        PortfolioDto.BalanceResponse r = new PortfolioDto.BalanceResponse();
        r.setBalance(user.getBalance());
        return r;
    }

    @Transactional(readOnly = true)
    public PortfolioDto.VolumeStats getStockVolumeStats(String stockId) {
        Stock stock = Objects.requireNonNull(stockRepository.findById(stockId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "주식을 찾을 수 없습니다.")));
        Long buyVol = transactionRepository.sumQuantityByStockIdAndType(stockId, TransactionType.BUY);
        Long sellVol = transactionRepository.sumQuantityByStockIdAndType(stockId, TransactionType.SELL);
        PortfolioDto.VolumeStats s = new PortfolioDto.VolumeStats();
        s.setTotalVolume(stock.getVolume());
        s.setBuyVolume(buyVol != null ? buyVol : 0L);
        s.setSellVolume(sellVol != null ? sellVol : 0L);
        s.setLastUpdated(stock.getUpdatedAt());
        return s;
    }

    @Transactional(readOnly = true)
    public List<PortfolioDto.VolumeStatsByStock> getAllStockVolumeStats() {
        return stockRepository.findAll().stream().map(stock -> {
            Stock s = Objects.requireNonNull(stock);
            PortfolioDto.VolumeStatsByStock v = new PortfolioDto.VolumeStatsByStock();
            PortfolioDto.VolumeStats stats = getStockVolumeStats(s.getId());
            v.setStockId(s.getId());
            v.setStockName(s.getName());
            v.setStockSymbol(s.getSymbol());
            v.setTotalVolume(stats.getTotalVolume());
            v.setBuyVolume(stats.getBuyVolume());
            v.setSellVolume(stats.getSellVolume());
            v.setLastUpdated(stats.getLastUpdated());
            return v;
        }).sorted((a, b) -> Long.compare(b.getTotalVolume(), a.getTotalVolume())).collect(Collectors.toList());
    }
}
