package com.urlshortener.dto;

import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.URL;

public record SlugSuggestionRequest(
        @NotBlank(message = "URL must not be blank")
        @URL(message = "Must be a valid URL")
        String url
) {}
