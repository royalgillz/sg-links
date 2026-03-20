package com.sglinks.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Fixed-window rate limiter backed by Redis.
 * Uses a Lua script for atomic INCR + EXPIRE so no race conditions.
 * Returns the remaining TTL (seconds) if the limit is exceeded, or 0 if allowed.
 */
@Service
public class RateLimiterService {

    private static final String SCRIPT = """
            local current = redis.call('INCR', KEYS[1])
            if current == 1 then
              redis.call('EXPIRE', KEYS[1], ARGV[2])
            end
            if current > tonumber(ARGV[1]) then
              return redis.call('TTL', KEYS[1])
            end
            return 0
            """;

    private final StringRedisTemplate redisTemplate;
    private final DefaultRedisScript<Long> redisScript;

    @Value("${app.rate-limit.requests}")
    private int maxRequests;

    @Value("${app.rate-limit.window-seconds}")
    private int windowSeconds;

    public RateLimiterService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.redisScript = new DefaultRedisScript<>(SCRIPT, Long.class);
    }

    /**
     * @param ip client IP address
     * @return 0 if the request is allowed; positive seconds-to-wait if rate limited
     */
    public long check(String ip) {
        String key = "rate_limit:" + ip;
        Long ttl = redisTemplate.execute(
                redisScript,
                List.of(key),
                String.valueOf(maxRequests),
                String.valueOf(windowSeconds)
        );
        return ttl == null ? 0 : ttl;
    }
}
