package com.urlshortener.dto;

import java.util.List;

public record StatsResponse(
        String shortCode,
        String shortUrl,
        String originalUrl,
        long totalClicks,
        List<ClickRecord> recentClicks
) {}
