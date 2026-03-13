package com.urlshortener;

import com.urlshortener.dto.ShortenRequest;
import com.urlshortener.dto.ShortenResponse;
import com.urlshortener.dto.StatsResponse;
import com.urlshortener.service.UrlService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers
class UrlShortenerIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres =
            new PostgreSQLContainer<>(DockerImageName.parse("postgres:16-alpine"));

    @Container
    static GenericContainer<?> redis =
            new GenericContainer<>(DockerImageName.parse("redis:7-alpine")).withExposedPorts(6379);

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.data.redis.url",
                () -> "redis://" + redis.getHost() + ":" + redis.getMappedPort(6379));
    }

    @Autowired
    UrlService urlService;

    @Test
    void shortenAndResolve() {
        ShortenRequest req = new ShortenRequest("https://example.com", null, null, null, null, null, null);
        ShortenResponse resp = urlService.shorten(req);

        assertThat(resp.shortUrl()).contains(resp.shortCode());
        assertThat(resp.originalUrl()).isEqualTo("https://example.com");
        assertThat(resp.passwordProtected()).isFalse();

        String resolved = urlService.resolveAndTrack(resp.shortCode(), null, null, null);
        assertThat(resolved).isEqualTo("https://example.com");
    }

    @Test
    void clickCountIncrements() {
        ShortenRequest req = new ShortenRequest("https://github.com", null, null, null, null, null, null);
        ShortenResponse resp = urlService.shorten(req);

        urlService.resolveAndTrack(resp.shortCode(), null, null, null);
        urlService.resolveAndTrack(resp.shortCode(), "https://google.com", "Mozilla/5.0", null);

        StatsResponse stats = urlService.getStats(resp.shortCode());
        assertThat(stats.totalClicks()).isEqualTo(2);
        assertThat(stats.recentClicks()).hasSize(2);
    }
}
