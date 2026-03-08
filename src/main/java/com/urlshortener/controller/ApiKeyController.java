package com.urlshortener.controller;

import com.urlshortener.dto.ApiKeyDto;
import com.urlshortener.dto.CreateApiKeyResponse;
import com.urlshortener.service.ApiKeyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/keys")
@RequiredArgsConstructor
@Tag(name = "API Keys", description = "Generate and revoke API keys")
public class ApiKeyController {

    private final ApiKeyService apiKeyService;

    @Operation(summary = "Generate a new API key")
    @PostMapping
    public ResponseEntity<CreateApiKeyResponse> create(@RequestParam(required = false) String name) {
        return ResponseEntity.status(HttpStatus.CREATED).body(apiKeyService.generate(name));
    }

    @Operation(summary = "Revoke an API key (provide the key itself in X-API-Key header to prove ownership)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> revoke(
            @PathVariable Long id,
            @RequestHeader("X-API-Key") String raw) {
        boolean revoked = apiKeyService.revoke(id, raw);
        return revoked ? ResponseEntity.noContent().build() : ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}
