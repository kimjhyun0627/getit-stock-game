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

    private final AppConfigRepository appConfigRepository;

    @Transactional(readOnly = true)
    public int getNewsCurrentYear() {
        return appConfigRepository.findByConfigKey(KEY_NEWS_CURRENT_YEAR)
                .map(c -> {
                    try {
                        return Integer.parseInt(c.getConfigValue());
                    } catch (NumberFormatException e) {
                        return Year.now().getValue();
                    }
                })
                .orElse(Year.now().getValue());
    }

    @Transactional
    public void setNewsCurrentYear(int year) {
        AppConfig config = appConfigRepository.findByConfigKey(KEY_NEWS_CURRENT_YEAR)
                .orElseGet(() -> {
                    AppConfig newConfig = new AppConfig();
                    newConfig.setConfigKey(KEY_NEWS_CURRENT_YEAR);
                    return newConfig;
                });
        config.setConfigValue(String.valueOf(year));
        appConfigRepository.save(config);
    }
}
