package com.urlshortener.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SlugSuggestionService {

    private static final String API_URL = "https://api.anthropic.com/v1/messages";
    private static final Pattern VALID_SLUG = Pattern.compile("^[a-z0-9][a-z0-9-]{1,18}[a-z0-9]$");

    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    @Value("${anthropic.api-key:}")
    private String apiKey;

    private final ObjectMapper objectMapper;

    public List<String> suggest(String url) {
        if (apiKey == null || apiKey.isBlank()) {
            return List.of();
        }

        String prompt = "Given this URL: " + url +
                " — suggest exactly 3 short, memorable, URL-safe slugs. " +
                "Rules: 3-20 chars, only lowercase letters, numbers, hyphens, no leading/trailing hyphens. " +
                "Reply with only the 3 slugs, one per line, nothing else.";

        // Build request body manually to avoid extra dependencies
        String escapedPrompt = prompt
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n");

        String body = """
                {
                  "model": "claude-haiku-4-5-20251001",
                  "max_tokens": 80,
                  "messages": [{"role": "user", "content": "%s"}]
                }
                """.formatted(escapedPrompt);

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(API_URL))
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .header("content-type", "application/json")
                    .timeout(Duration.ofSeconds(10))
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.warn("Anthropic API returned {}", response.statusCode());
                return List.of();
            }

            JsonNode root = objectMapper.readTree(response.body());
            String text = root.path("content").get(0).path("text").asText();

            return Arrays.stream(text.strip().split("\\n"))
                    .map(String::strip)
                    .filter(s -> VALID_SLUG.matcher(s).matches())
                    .limit(3)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.warn("Slug suggestion failed: {}", e.getMessage());
            return List.of();
        }
    }
}
