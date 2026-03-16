package com.urlshortener.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
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

    private static final String OPENAI_URL   = "https://api.openai.com/v1/chat/completions";
    private static final String ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
    private static final Pattern VALID_SLUG   = Pattern.compile("^[a-z0-9][a-z0-9-]{1,18}[a-z0-9]$");

    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    @Value("${OPENAI_API_KEY:}")
    private String openAiKey;

    @Value("${ANTHROPIC_API_KEY:}")
    private String anthropicKey;

    private final ObjectMapper objectMapper;

    @PostConstruct
    void logConfig() {
        log.info("Slug suggestions — OpenAI: {}, Anthropic: {}",
                openAiKey.isBlank()    ? "NOT SET" : "loaded (len=" + openAiKey.length() + ")",
                anthropicKey.isBlank() ? "NOT SET" : "loaded (len=" + anthropicKey.length() + ")");
    }

    public List<String> suggest(String url) {
        if (!openAiKey.isBlank()) {
            List<String> result = suggestViaOpenAi(url);
            if (!result.isEmpty()) return result;
        }
        if (!anthropicKey.isBlank()) {
            return suggestViaAnthropic(url);
        }
        return List.of();
    }

    // ── OpenAI ────────────────────────────────────────────────────────────────

    private List<String> suggestViaOpenAi(String url) {
        String prompt = buildPrompt(url);
        String escaped = escapeJson(prompt);
        String body = """
                {
                  "model": "gpt-4o-mini",
                  "max_tokens": 80,
                  "messages": [{"role": "user", "content": "%s"}]
                }
                """.formatted(escaped);

        try {
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(OPENAI_URL))
                    .header("Authorization", "Bearer " + openAiKey)
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(10))
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> resp = HTTP_CLIENT.send(req, HttpResponse.BodyHandlers.ofString());

            if (resp.statusCode() != 200) {
                log.warn("OpenAI returned {} — {}", resp.statusCode(), resp.body());
                return List.of();
            }

            JsonNode root = objectMapper.readTree(resp.body());
            String text = root.path("choices").get(0).path("message").path("content").asText();
            return parseSlugs(text);

        } catch (Exception e) {
            log.warn("OpenAI slug suggestion failed: {}", e.getMessage());
            return List.of();
        }
    }

    // ── Anthropic ─────────────────────────────────────────────────────────────

    private List<String> suggestViaAnthropic(String url) {
        String prompt = buildPrompt(url);
        String escaped = escapeJson(prompt);
        String body = """
                {
                  "model": "claude-haiku-4-5-20251001",
                  "max_tokens": 80,
                  "messages": [{"role": "user", "content": "%s"}]
                }
                """.formatted(escaped);

        try {
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(ANTHROPIC_URL))
                    .header("x-api-key", anthropicKey)
                    .header("anthropic-version", "2023-06-01")
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(10))
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> resp = HTTP_CLIENT.send(req, HttpResponse.BodyHandlers.ofString());

            if (resp.statusCode() != 200) {
                log.warn("Anthropic returned {} — {}", resp.statusCode(), resp.body());
                return List.of();
            }

            JsonNode root = objectMapper.readTree(resp.body());
            String text = root.path("content").get(0).path("text").asText();
            return parseSlugs(text);

        } catch (Exception e) {
            log.warn("Anthropic slug suggestion failed: {}", e.getMessage());
            return List.of();
        }
    }

    // ── Shared helpers ────────────────────────────────────────────────────────

    private static String buildPrompt(String url) {
        return "Given this URL: " + url
                + " — suggest exactly 3 short, memorable, URL-safe slugs. "
                + "Rules: 3-20 chars, only lowercase letters, numbers, hyphens, no leading/trailing hyphens. "
                + "Reply with only the 3 slugs, one per line, nothing else.";
    }

    private static String escapeJson(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
    }

    private static List<String> parseSlugs(String text) {
        return Arrays.stream(text.strip().split("\\n"))
                .map(String::strip)
                .map(s -> s.replaceAll("^\\d+[.)\\s]+", "").replaceAll("^[-*•]\\s*", "").strip())
                .filter(s -> VALID_SLUG.matcher(s).matches())
                .limit(3)
                .collect(Collectors.toList());
    }
}
