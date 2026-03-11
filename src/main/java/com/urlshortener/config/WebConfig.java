package com.urlshortener.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final ApiKeyInterceptor apiKeyInterceptor;
    private final RateLimitInterceptor rateLimitInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // API key validation runs first on all API routes
        registry.addInterceptor(apiKeyInterceptor)
                .addPathPatterns("/api/**");

        // Rate limiting applies after API key check (valid keys bypass it)
        registry.addInterceptor(rateLimitInterceptor)
                .addPathPatterns(
                        "/api/urls",
                        "/api/urls/bulk",
                        "/api/urls/suggest-slug",
                        "/api/urls/*/stats",
                        "/api/urls/*/unlock",
                        "/{code}"   // redirect endpoint
                );
    }
}
