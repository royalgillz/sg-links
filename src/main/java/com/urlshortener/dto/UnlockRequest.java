package com.urlshortener.dto;

import jakarta.validation.constraints.NotBlank;

public record UnlockRequest(
        @NotBlank(message = "Password must not be blank")
        String password
) {}
