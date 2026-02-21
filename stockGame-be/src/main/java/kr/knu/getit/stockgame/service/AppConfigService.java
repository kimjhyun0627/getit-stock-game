package kr.knu.getit.stockgame.service;

import kr.knu.getit.stockgame.entity.AppConfig;
import kr.knu.getit.stockgame.repository.AppConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;

@Service
@RequiredArgsConstructor
public class AppConfigService {

    private static final String KEY_NEWS_CURRENT_YEAR = "news.current_year";
    private static final String KEY_GAME_START_YEAR = "game.start_year";
    private static final String KEY_GAME_END_YEAR = "game.end_year";

    private static final int DEFAULT_GAME_START = 2022;
    private static final int DEFAULT_GAME_END = 2026;

    private final AppConfigRepository appConfigRepository;

    @Transactional(readOnly = true)
    public int getNewsCurrentYear() {
        return appConfigRepository.findByConfigKey(KEY_NEWS_CURRENT_YEAR)
                .map(c -> parseIntOrDefault(c.getConfigValue(), Year.now().getValue()))
                .orElse(Year.now().getValue());
    }

    @Transactional
    public void setNewsCurrentYear(int year) {
        saveConfig(KEY_NEWS_CURRENT_YEAR, String.valueOf(year));
    }

    @Transactional(readOnly = true)
    public int getGameStartYear() {
        return appConfigRepository.findByConfigKey(KEY_GAME_START_YEAR)
                .map(c -> parseIntOrDefault(c.getConfigValue(), DEFAULT_GAME_START))
                .orElse(DEFAULT_GAME_START);
    }

    @Transactional(readOnly = true)
    public int getGameEndYear() {
        return appConfigRepository.findByConfigKey(KEY_GAME_END_YEAR)
                .map(c -> parseIntOrDefault(c.getConfigValue(), DEFAULT_GAME_END))
                .orElse(DEFAULT_GAME_END);
    }

    @Transactional
    public void setGamePeriod(int startYear, int endYear) {
        if (startYear > endYear) {
            throw new IllegalArgumentException("시작 연도는 종료 연도보다 크지 않아야 합니다.");
        }
        saveConfig(KEY_GAME_START_YEAR, String.valueOf(startYear));
        saveConfig(KEY_GAME_END_YEAR, String.valueOf(endYear));
    }

    private int parseIntOrDefault(String value, int defaultValue) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    private void saveConfig(String key, String value) {
        AppConfig config = appConfigRepository.findByConfigKey(key)
                .orElseGet(() -> {
                    AppConfig newConfig = new AppConfig();
                    newConfig.setConfigKey(key);
                    return newConfig;
                });
        config.setConfigValue(value);
        appConfigRepository.save(config);
    }
}
