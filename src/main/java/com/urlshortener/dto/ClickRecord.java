package com.urlshortener.dto;

import java.time.OffsetDateTime;

public record ClickRecord(OffsetDateTime clickedAt, String referrer) {}
