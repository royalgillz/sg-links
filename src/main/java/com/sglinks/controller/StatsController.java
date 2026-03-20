package com.sglinks.controller;

import com.sglinks.repository.ClickRepository;
import com.sglinks.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class StatsController {

    private final UrlRepository urlRepository;
    private final ClickRepository clickRepository;

    @GetMapping("/api/stats")
    public ResponseEntity<Map<String, Long>> publicStats() {
        long totalUrls = urlRepository.count();
        long totalClicks = clickRepository.count();
        return ResponseEntity.ok(Map.of("totalUrls", totalUrls, "totalClicks", totalClicks));
    }
}
