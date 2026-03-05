package com.urlshortener.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record BulkShortenRequest(
        @NotEmpty(message = "URL list must not be empty")
        @Size(max = 20, message = "Cannot shorten more than 20 URLs at once")
        List<String> urls
) {}
