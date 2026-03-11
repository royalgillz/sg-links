package com.urlshortener.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

public record ShortenRequest(
        @NotBlank(message = "URL must not be blank")
        @URL(message = "Must be a valid URL")
        @Pattern(regexp = "^https?://.*", message = "Only http and https URLs are allowed")
        @Size(max = 2048, message = "URL must not exceed 2048 characters")
        String url,

        @Pattern(regexp = "^[a-zA-Z0-9_-]*$", message = "Alias may only contain letters, numbers, hyphens and underscores")
        @Size(min = 3, max = 20, message = "Alias must be between 3 and 20 characters")
        String alias,

        // null = never expires; otherwise days until expiry (1–365)
        @Min(value = 1, message = "Expiry must be at least 1 day")
        @Max(value = 365, message = "Expiry cannot exceed 365 days")
        Integer expiryDays,

        @Size(min = 4, max = 72, message = "Password must be between 4 and 72 characters")
        String password,

        @Size(max = 200, message = "OG title must not exceed 200 characters")
        String ogTitle,

        @Size(max = 500, message = "OG description must not exceed 500 characters")
        String ogDescription,

        @URL(message = "OG image must be a valid URL")
        String ogImage
) {}
