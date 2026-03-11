package com.urlshortener.controller;

import com.urlshortener.dto.BulkShortenItem;
import com.urlshortener.dto.BulkShortenRequest;
import com.urlshortener.dto.EditRequest;
import com.urlshortener.dto.ShortenRequest;
import com.urlshortener.dto.ShortenResponse;
import com.urlshortener.dto.StatsResponse;
import com.urlshortener.dto.UnlockRequest;
import com.urlshortener.dto.UnlockResponse;
import com.urlshortener.exception.UrlPasswordRequiredException;
import com.urlshortener.service.UrlService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "URL Shortener", description = "Shorten, redirect, and analyse URLs")
public class UrlController {

    private final UrlService urlService;

    @Operation(summary = "Shorten a URL")
    @PostMapping("/api/urls")
    public ResponseEntity<ShortenResponse> shorten(@Valid @RequestBody ShortenRequest request) {
        ShortenResponse response = urlService.shorten(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Shorten multiple URLs at once (max 20)")
    @PostMapping("/api/urls/bulk")
    public ResponseEntity<List<BulkShortenItem>> bulk(@Valid @RequestBody BulkShortenRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(urlService.bulkShorten(request));
    }

    @Operation(summary = "Redirect to the original URL (302). Append + to see a preview instead. Password-protected links redirect to the unlock page.")
    @GetMapping("/{pathVar:[a-zA-Z0-9_-]+[+]?}")
    public ResponseEntity<Void> redirect(@PathVariable String pathVar, HttpServletRequest request) {
        if (pathVar.endsWith("+")) {
            String code = pathVar.substring(0, pathVar.length() - 1);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create("/?preview=" + code))
                    .build();
        }

        String referrer = request.getHeader("Referer");
        String userAgent = request.getHeader("User-Agent");
        String ip = extractIp(request);
        try {
            String originalUrl = urlService.resolveAndTrack(pathVar, referrer, userAgent, ip);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(originalUrl))
                    .build();
        } catch (UrlPasswordRequiredException e) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create("/?unlock=" + pathVar))
                    .build();
        } catch (com.urlshortener.exception.UrlNotFoundException e) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create("/?error=not-found"))
                    .build();
        } catch (com.urlshortener.exception.UrlExpiredException e) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create("/?error=expired"))
                    .build();
        }
    }

    @Operation(summary = "Unlock a password-protected link and retrieve the original URL")
    @PostMapping("/api/urls/{code}/unlock")
    public ResponseEntity<UnlockResponse> unlock(
            @PathVariable String code,
            @Valid @RequestBody UnlockRequest request) {
        return ResponseEntity.ok(urlService.unlock(code, request));
    }

    @Operation(summary = "Get click analytics for a short code")
    @GetMapping("/api/urls/{code}/stats")
    public ResponseEntity<StatsResponse> stats(@PathVariable String code) {
        return ResponseEntity.ok(urlService.getStats(code));
    }

    @Operation(summary = "Update the destination URL of a short link")
    @PatchMapping("/api/urls/{code}")
    public ResponseEntity<Void> edit(
            @PathVariable String code,
            @Valid @RequestBody EditRequest request) {
        urlService.edit(code, request.url());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Delete a short URL")
    @DeleteMapping("/api/urls/{code}")
    public ResponseEntity<Void> delete(@PathVariable String code) {
        urlService.delete(code);
        return ResponseEntity.noContent().build();
    }

    private String extractIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
