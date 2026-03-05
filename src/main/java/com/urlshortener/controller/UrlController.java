package com.urlshortener.controller;

import com.urlshortener.dto.BulkShortenItem;
import com.urlshortener.dto.BulkShortenRequest;
import com.urlshortener.dto.ShortenRequest;
import com.urlshortener.dto.ShortenResponse;
import com.urlshortener.dto.StatsResponse;
import com.urlshortener.dto.UnlockRequest;
import com.urlshortener.dto.UnlockResponse;
import com.urlshortener.exception.UrlPasswordRequiredException;
import com.urlshortener.service.UrlService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class UrlController {

    private final UrlService urlService;

    @PostMapping("/api/urls")
    public ResponseEntity<ShortenResponse> shorten(@Valid @RequestBody ShortenRequest request) {
        ShortenResponse response = urlService.shorten(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{code:[a-zA-Z0-9_-]+}")
    public ResponseEntity<Void> redirect(@PathVariable String code, HttpServletRequest request) {
        String referrer = request.getHeader("Referer");
        String userAgent = request.getHeader("User-Agent");
        try {
            String originalUrl = urlService.resolveAndTrack(code, referrer, userAgent);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(originalUrl))
                    .build();
        } catch (UrlPasswordRequiredException e) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create("/?unlock=" + code))
                    .build();
        }
    }

    @PostMapping("/api/urls/bulk")
    public ResponseEntity<List<BulkShortenItem>> bulk(@Valid @RequestBody BulkShortenRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(urlService.bulkShorten(request));
    }

    @PostMapping("/api/urls/{code}/unlock")
    public ResponseEntity<UnlockResponse> unlock(
            @PathVariable String code,
            @Valid @RequestBody UnlockRequest request) {
        return ResponseEntity.ok(urlService.unlock(code, request));
    }

    @GetMapping("/api/urls/{code}/stats")
    public ResponseEntity<StatsResponse> stats(@PathVariable String code) {
        return ResponseEntity.ok(urlService.getStats(code));
    }

    @DeleteMapping("/api/urls/{code}")
    public ResponseEntity<Void> delete(@PathVariable String code) {
        urlService.delete(code);
        return ResponseEntity.noContent().build();
    }
}
