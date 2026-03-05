package com.urlshortener.dto;

public record BulkShortenItem(String originalUrl, String shortUrl, String error) {}
