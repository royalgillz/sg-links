package com.urlshortener.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final RateLimitInterceptor rateLimitInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Rate limit only the shorten endpoint — not redirects or stats
        // Rate limit shorten (POST /api/urls) and stats (GET /api/urls/{code}/stats)
        // but not delete — that's user-initiated cleanup
        registry.addInterceptor(rateLimitInterceptor)
                .addPathPatterns("/api/urls", "/api/urls/bulk", "/api/urls/*/stats", "/api/urls/*/unlock");
    }
}
