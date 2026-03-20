package com.sglinks.dto;

public record PublicLinkDto(
        String shortUrl,
        String title,
        String description,
        String domain,
        long clickCount
) {}
