package com.urlshortener;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
public class UrlShortenerApplication {

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(UrlShortenerApplication.class);
        app.setDefaultProperties(loadDotEnv());
        app.run(args);
    }

    /** Reads .env into a map. Real env vars on Railway override these (lower priority). */
    private static Map<String, Object> loadDotEnv() {
        Map<String, Object> props = new HashMap<>();
        Path env = Path.of(".env");
        if (!Files.exists(env)) return props;
        try {
            for (String line : Files.readAllLines(env)) {
                line = line.trim();
                if (line.startsWith("#") || !line.contains("=")) continue;
                int idx = line.indexOf('=');
                String key = line.substring(0, idx).trim();
                String value = line.substring(idx + 1).trim();
                props.put(key, value);
            }
        } catch (IOException ignored) {}
        return props;
    }
}
