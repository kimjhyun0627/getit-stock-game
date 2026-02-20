package kr.knu.getit.stockgame.service;

import kr.knu.getit.stockgame.dto.LeaderboardDto;
import kr.knu.getit.stockgame.entity.LeaderboardEntry;
import kr.knu.getit.stockgame.entity.Portfolio;
import kr.knu.getit.stockgame.entity.Stock;
import kr.knu.getit.stockgame.entity.User;
import kr.knu.getit.stockgame.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private static final BigDecimal INITIAL_BALANCE = new BigDecimal("10000000");

    private final LeaderboardEntryRepository leaderboardRepository;
    private final UserRepository userRepository;
    private final PortfolioRepository portfolioRepository;
    private final StockRepository stockRepository;

    @Transactional
    public void updateLeaderboard() {
        List<User> users = userRepository.findAll();
        Map<String, Double> prices = stockRepository.findAll().stream()
                .collect(Collectors.toMap(Stock::getId, Stock::getCurrentPrice));

        List<LeaderboardEntry> entries = new ArrayList<>();
        for (User user : users) {
            List<Portfolio> portfolios = portfolioRepository.findByUserIdOrderByUpdatedAtDesc(user.getId());
            double stockValue = 0;
            for (Portfolio p : portfolios) {
                Double price = prices.get(p.getStockId());
                if (price != null) stockValue += p.getQuantity() * price;
            }
            double totalAssets = user.getBalance().doubleValue() + stockValue;
            double profitLoss = totalAssets - INITIAL_BALANCE.doubleValue();
            double profitLossPercent = INITIAL_BALANCE.doubleValue() != 0
                    ? (profitLoss / INITIAL_BALANCE.doubleValue()) * 100
                    : 0;

            LeaderboardEntry entry = LeaderboardEntry.builder()
                    .userId(user.getId())
                    .username(user.getNickname())
                    .totalAssets(BigDecimal.valueOf(totalAssets))
                    .cashBalance(user.getBalance())
                    .stockValue(BigDecimal.valueOf(stockValue))
                    .profitLoss(BigDecimal.valueOf(profitLoss))
                    .profitLossPercent(BigDecimal.valueOf(profitLossPercent))
                    .isVisible(user.getIsLeaderboardVisible() != null ? user.getIsLeaderboardVisible() : true)
                    .rank(0)
                    .build();
            entries.add(entry);
        }

        List<LeaderboardEntry> visible = entries.stream().filter(e -> e.getIsVisible()).collect(Collectors.toList());
        visible.sort(Comparator.comparing(LeaderboardEntry::getTotalAssets).reversed());
        for (int i = 0; i < visible.size(); i++) {
            visible.get(i).setRank(i + 1);
        }

        leaderboardRepository.deleteAll();
        for (LeaderboardEntry e : entries) {
            leaderboardRepository.save(Objects.requireNonNull(e));
        }
    }

    @Transactional(readOnly = true)
    public List<LeaderboardDto.LeaderboardResponse> getPublicLeaderboard() {
        List<LeaderboardEntry> list = leaderboardRepository.findTop100ByIsVisibleTrueAndRankGreaterThanOrderByRankAsc(0);
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LeaderboardDto.AdminLeaderboardResponse> getAdminLeaderboard() {
        List<LeaderboardEntry> list = leaderboardRepository.findAllByOrderByRankAsc();
        return list.stream().map(e -> {
            LeaderboardEntry entry = Objects.requireNonNull(e);
            LeaderboardDto.AdminLeaderboardResponse r = new LeaderboardDto.AdminLeaderboardResponse();
            r.setId(entry.getId());
            r.setUsername(entry.getUsername());
            r.setTotalAssets(entry.getTotalAssets());
            r.setCashBalance(entry.getCashBalance());
            r.setStockValue(entry.getStockValue());
            r.setRank(entry.getRank());
            r.setProfitLoss(entry.getProfitLoss());
            r.setProfitLossPercent(entry.getProfitLossPercent());
            r.setLastUpdated(entry.getLastUpdated() != null ? entry.getLastUpdated().toString() : null);
            r.setIsVisible(entry.getIsVisible());
            r.setUserId(Objects.requireNonNull(entry.getUserId()));
            return r;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void toggleUserVisibility(String userId, boolean isVisible) {
        userRepository.findById(userId).ifPresent(u -> {
            u.setIsLeaderboardVisible(isVisible);
            userRepository.save(u);
        });
        leaderboardRepository.findAll().stream()
                .filter(e -> userId.equals(e.getUserId()))
                .forEach(e -> {
                    e.setIsVisible(isVisible);
                    leaderboardRepository.save(e);
                });
    }

    @Transactional(readOnly = true)
    public LeaderboardDto.LeaderboardStats getStats() {
        long total = leaderboardRepository.count();
        long visible = leaderboardRepository.countByIsVisibleTrue();
        Double avg = leaderboardRepository.getAverageAssets();
        Double top = leaderboardRepository.getTopAssets();
        Instant lastUpdated = leaderboardRepository.findMaxLastUpdated();
        LeaderboardDto.LeaderboardStats s = new LeaderboardDto.LeaderboardStats();
        s.setTotalParticipants(total);
        s.setVisibleParticipants(visible);
        s.setAverageAssets(avg != null ? avg : 0);
        s.setTopAssets(top != null ? top : 0);
        s.setLastUpdated(lastUpdated != null ? lastUpdated.toString() : Instant.now().toString());
        return s;
    }

    private LeaderboardDto.LeaderboardResponse toResponse(LeaderboardEntry e) {
        LeaderboardDto.LeaderboardResponse r = new LeaderboardDto.LeaderboardResponse();
        r.setId(e.getId());
        r.setUsername(e.getUsername());
        r.setTotalAssets(e.getTotalAssets());
        r.setCashBalance(e.getCashBalance());
        r.setStockValue(e.getStockValue());
        r.setRank(e.getRank());
        r.setProfitLoss(e.getProfitLoss());
        r.setProfitLossPercent(e.getProfitLossPercent());
        r.setLastUpdated(e.getLastUpdated() != null ? e.getLastUpdated().toString() : null);
        return r;
    }
}
