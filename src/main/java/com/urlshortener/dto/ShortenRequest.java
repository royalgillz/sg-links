package com.urlshortener.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

public record ShortenRequest(
        @NotBlank(message = "URL must not be blank")
        @URL(message = "Must be a valid URL")
        String url,

        @Pattern(regexp = "^[a-zA-Z0-9_-]*$", message = "Alias may only contain letters, numbers, hyphens and underscores")
        @Size(min = 3, max = 20, message = "Alias must be between 3 and 20 characters")
        String alias
) {}
