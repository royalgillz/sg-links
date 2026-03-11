package com.urlshortener.dto;

import java.util.List;

public record UserBioResponse(
        String username,
        List<PublicLinkDto> links
) {}
