package kr.knu.getit.stockgame.seed;

import kr.knu.getit.stockgame.entity.News;
import kr.knu.getit.stockgame.entity.Stock;
import lombok.experimental.UtilityClass;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@UtilityClass
public class SeedData {

    public static List<Stock> stockSeeds() {
        return Arrays.asList(
                stock("A전자", "005930", 75000, 74500, 500, 0.67, 15000000L),
                stock("B하이닉스", "000660", 125000, 123000, 2000, 1.63, 8000000L),
                stock("NAVER", "035420", 185000, 182000, 3000, 1.65, 3000000L),
                stock("카카오", "035720", 52000, 51500, 500, 0.97, 5000000L),
                stock("LG에너지솔루션", "373220", 450000, 448000, 2000, 0.45, 2000000L),
                stock("현대차", "005380", 185000, 183000, 2000, 1.09, 4000000L)
        );
    }

    private static Stock stock(String name, String symbol, double current, double previous, double change, double changePercent, long volume) {
        return Stock.builder()
                .name(name)
                .symbol(symbol)
                .currentPrice(current)
                .previousPrice(previous)
                .change(change)
                .changePercent(changePercent)
                .volume(volume)
                .build();
    }

    public static List<News> newsSeeds() {
        return Arrays.asList(
                news("글로벌 금리 인하 기대감 확산, 주식시장 상승세",
                        "미국 연준의 금리 인하 기대감으로 글로벌 주식시장이 상승세를 보이고 있습니다.",
                        "글로벌 금리 인하 기대감이 확산되면서 주식시장이 상승세를 보이고 있습니다. 미국 연준의 정책 방향성에 대한 긍정적인 전망이 투자자들의 심리를 개선시키고 있으며, 이는 국내 주식시장에도 긍정적인 영향을 미칠 것으로 전망됩니다.",
                        "economy", true),
                news("AI 기술 발전으로 반도체 업계 호황 지속",
                        "인공지능 기술 발전에 따른 반도체 수요 증가로 업계 호황이 지속되고 있습니다.",
                        "인공지능 기술의 급속한 발전으로 반도체 수요가 크게 증가하고 있습니다. 특히 AI 칩과 고성능 반도체에 대한 수요가 급증하면서 관련 업계의 호황이 지속되고 있으며, 이는 주식시장에서도 반도체 관련 종목들의 상승으로 이어지고 있습니다.",
                        "technology", true),
                news("전기차 시장 성장세, 배터리 업계 주목",
                        "전기차 시장의 급속한 성장으로 배터리 관련 업계가 주목받고 있습니다.",
                        "전기차 시장의 급속한 성장으로 배터리 관련 업계가 주목받고 있습니다. 친환경 정책과 함께 전기차 보급이 확대되면서 배터리 수요가 급증하고 있으며, 이는 관련 기업들의 실적 개선과 주가 상승으로 이어질 것으로 전망됩니다.",
                        "technology", true),
                news("글로벌 경제 회복세, 수출업계 호조",
                        "글로벌 경제 회복세로 국내 수출업계가 호조를 보이고 있습니다.",
                        "글로벌 경제의 회복세가 지속되면서 국내 수출업계가 호조를 보이고 있습니다. 주요 수출국들의 경제 활성화와 함께 수출 물량이 증가하고 있으며, 이는 관련 기업들의 실적 개선과 주가 상승으로 이어질 것으로 예상됩니다.",
                        "economy", true)
        );
    }

    private static News news(String title, String summary, String content, String category, boolean published) {
        News n = News.builder()
                .title(title)
                .summary(summary)
                .content(content)
                .category(category)
                .isPublished(published)
                .build();
        if (published) n.publish();
        return n;
    }
}
