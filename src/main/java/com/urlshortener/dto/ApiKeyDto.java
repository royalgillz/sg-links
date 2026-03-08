package com.urlshortener.dto;

import java.time.OffsetDateTime;

public record ApiKeyDto(Long id, String name, String keyPrefix, OffsetDateTime createdAt, OffsetDateTime lastUsedAt) {}
