package kr.knu.getit.stockgame.controller;

import kr.knu.getit.stockgame.dto.PortfolioDto;
import kr.knu.getit.stockgame.entity.Portfolio;
import kr.knu.getit.stockgame.security.JwtAuthenticationFilter;
import kr.knu.getit.stockgame.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/portfolios")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    @PostMapping("/buy")
    public Portfolio buy(
            @AuthenticationPrincipal JwtAuthenticationFilter.AuthPrincipal principal,
            @RequestBody PortfolioDto.BuyOrder order
    ) {
        if (principal == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "인증된 사용자 정보를 찾을 수 없습니다.");
        return portfolioService.buyStock(principal.id(), order);
    }

    @PostMapping("/sell")
    public Portfolio sell(
            @AuthenticationPrincipal JwtAuthenticationFilter.AuthPrincipal principal,
            @RequestBody PortfolioDto.SellOrder order
    ) {
        if (principal == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "인증된 사용자 정보를 찾을 수 없습니다.");
        return portfolioService.sellStock(principal.id(), order);
    }

    @GetMapping
    public List<PortfolioDto.PortfolioResponse> getUserPortfolio(
            @AuthenticationPrincipal JwtAuthenticationFilter.AuthPrincipal principal
    ) {
        if (principal == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "인증된 사용자 정보를 찾을 수 없습니다.");
        return portfolioService.getUserPortfolio(principal.id());
    }

    @GetMapping("/transactions")
    public List<PortfolioDto.TransactionResponse> getUserTransactions(
            @AuthenticationPrincipal JwtAuthenticationFilter.AuthPrincipal principal
    ) {
        if (principal == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "인증된 사용자 정보를 찾을 수 없습니다.");
        return portfolioService.getUserTransactions(principal.id());
    }

    @GetMapping("/balance")
    public PortfolioDto.BalanceResponse getBalance(
            @AuthenticationPrincipal JwtAuthenticationFilter.AuthPrincipal principal
    ) {
        if (principal == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "인증된 사용자 정보를 찾을 수 없습니다.");
        return portfolioService.getUserBalance(principal.id());
    }

    @GetMapping("/volume/stats")
    public List<PortfolioDto.VolumeStatsByStock> getAllVolumeStats() {
        return portfolioService.getAllStockVolumeStats();
    }

    @GetMapping("/volume/stats/{stockId}")
    public PortfolioDto.VolumeStats getVolumeStats(@PathVariable String stockId) {
        return portfolioService.getStockVolumeStats(stockId);
    }

    @GetMapping("/{stockId}")
    public Optional<Portfolio> getByStock(
            @AuthenticationPrincipal JwtAuthenticationFilter.AuthPrincipal principal,
            @PathVariable String stockId
    ) {
        if (principal == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "인증된 사용자 정보를 찾을 수 없습니다.");
        return portfolioService.getPortfolioByStock(principal.id(), stockId);
    }
}
