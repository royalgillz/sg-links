package com.urlshortener;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Requires running Postgres and Redis — run with docker compose up -d")
class UrlShortenerApplicationTests {

    @Test
    void contextLoads() {
    }
}
