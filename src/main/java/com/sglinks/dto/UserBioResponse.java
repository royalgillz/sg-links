package com.sglinks.dto;

import java.util.List;

public record UserBioResponse(
        String username,
        List<PublicLinkDto> links
) {}
