package com.sglinks;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@SpringBootApplication
public class SgLinksApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(SgLinksApplication.class, args);
    }

    /**
     * Reads .env and injects entries as system properties so Spring's @Value resolves them.
     * Skips keys already present as real environment variables (Hugging Face, CI, etc.).
     */
    private static void loadDotEnv() {
        Path env = Path.of(".env");
        if (!Files.exists(env)) return;
        try {
            int loaded = 0;
            for (String line : Files.readAllLines(env)) {
                line = line.trim();
                if (line.startsWith("#") || !line.contains("=")) continue;
                int idx = line.indexOf('=');
                String key = line.substring(0, idx).trim();
                String value = line.substring(idx + 1).trim();
                if (System.getenv(key) == null && System.getProperty(key) == null) {
                    System.setProperty(key, value);
                    loaded++;
                }
            }
            System.out.println("[dotenv] Loaded " + loaded + " properties from .env");
        } catch (IOException e) {
            System.err.println("[dotenv] Failed to read .env: " + e.getMessage());
        }
    }
}
