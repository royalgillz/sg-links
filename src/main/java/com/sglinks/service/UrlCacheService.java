package com.sglinks.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.sglinks.model.Url;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UrlCacheService {

    private static final String PREFIX = "redirect:";
    private static final long DEFAULT_TTL_SECONDS = 86_400; // 24 h

    private final StringRedisTemplate redis;

    // Lazy ObjectMapper with JSR-310 for OffsetDateTime
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    public record CachedUrl(Long id, String originalUrl, OffsetDateTime expiresAt) {}

    public Optional<CachedUrl> get(String code) {
        try {
            String json = redis.opsForValue().get(PREFIX + code);
            if (json == null) return Optional.empty();
            return Optional.of(objectMapper.readValue(json, CachedUrl.class));
        } catch (Exception e) {
            log.warn("Cache read error for {}: {}", code, e.getMessage());
            return Optional.empty();
        }
    }

    public void put(String code, Url url) {
        if (url.getPasswordHash() != null) return; // never cache password-protected URLs

        long ttl = DEFAULT_TTL_SECONDS;
        if (url.getExpiresAt() != null) {
            long secondsLeft = Duration.between(OffsetDateTime.now(ZoneOffset.UTC), url.getExpiresAt()).toSeconds();
            if (secondsLeft <= 0) return; // already expired
            ttl = Math.min(ttl, secondsLeft);
        }

        try {
            String json = objectMapper.writeValueAsString(
                    new CachedUrl(url.getId(), url.getOriginalUrl(), url.getExpiresAt()));
            redis.opsForValue().set(PREFIX + code, json, Duration.ofSeconds(ttl));
        } catch (JsonProcessingException e) {
            log.warn("Cache write error for {}: {}", code, e.getMessage());
        }
    }

    public void evict(String code) {
        redis.delete(PREFIX + code);
    }
}
