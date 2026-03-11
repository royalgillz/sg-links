package com.urlshortener.dto;

import java.time.OffsetDateTime;

public record UserProfileResponse(
        Long id,
        String username,
        String email,
        String role,
        OffsetDateTime createdAt
) {}
