package com.urlshortener.dto;

import java.time.OffsetDateTime;

public record CreateApiKeyResponse(Long id, String name, String keyPrefix, String key, OffsetDateTime createdAt) {}
