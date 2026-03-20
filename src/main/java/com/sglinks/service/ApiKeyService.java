package com.sglinks.service;

import com.sglinks.dto.ApiKeyDto;
import com.sglinks.dto.CreateApiKeyResponse;
import com.sglinks.model.ApiKey;
import com.sglinks.repository.ApiKeyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ApiKeyService {

    private final ApiKeyRepository apiKeyRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public CreateApiKeyResponse generate(String name) {
        byte[] bytes = new byte[24];
        secureRandom.nextBytes(bytes);
        String raw = "sk_" + Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        ApiKey apiKey = new ApiKey();
        apiKey.setName(name != null && !name.isBlank() ? name : "Unnamed key");
        apiKey.setKeyPrefix(raw.substring(0, Math.min(10, raw.length())) + "…");
        apiKey.setKeyHash(sha256(raw));
        apiKeyRepository.save(apiKey);

        return new CreateApiKeyResponse(apiKey.getId(), apiKey.getName(), apiKey.getKeyPrefix(), raw, apiKey.getCreatedAt());
    }

    @Transactional
    public Optional<ApiKey> validate(String raw) {
        Optional<ApiKey> found = apiKeyRepository.findByKeyHashAndRevokedFalse(sha256(raw));
        found.ifPresent(k -> {
            k.setLastUsedAt(OffsetDateTime.now(ZoneOffset.UTC));
            apiKeyRepository.save(k);
        });
        return found;
    }

    @Transactional
    public boolean revoke(Long id, String raw) {
        Optional<ApiKey> found = apiKeyRepository.findById(id);
        if (found.isEmpty()) return false;
        ApiKey key = found.get();
        if (!key.getKeyHash().equals(sha256(raw)) || key.isRevoked()) return false;
        key.setRevoked(true);
        apiKeyRepository.save(key);
        return true;
    }

    public ApiKeyDto toDto(ApiKey key) {
        return new ApiKeyDto(key.getId(), key.getName(), key.getKeyPrefix(), key.getCreatedAt(), key.getLastUsedAt());
    }

    private static String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) hex.append(String.format("%02x", b));
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
