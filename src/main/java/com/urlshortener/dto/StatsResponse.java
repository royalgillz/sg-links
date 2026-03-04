package com.urlshortener.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record StatsResponse(
        String shortCode,
        String shortUrl,
        String originalUrl,
        long totalClicks,
        List<ClickRecord> recentClicks,
        List<DailyClickCount> clicksByDay,
        OffsetDateTime expiresAt
) {}
