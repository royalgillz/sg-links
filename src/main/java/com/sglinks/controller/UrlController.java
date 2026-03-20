package com.sglinks.controller;

import com.sglinks.dto.BulkShortenItem;
import com.sglinks.dto.BulkShortenRequest;
import com.sglinks.dto.EditRequest;
import com.sglinks.dto.ShortenRequest;
import com.sglinks.dto.ShortenResponse;
import com.sglinks.dto.SlugSuggestionRequest;
import com.sglinks.dto.SlugSuggestionResponse;
import com.sglinks.dto.StatsResponse;
import com.sglinks.dto.UnlockRequest;
import com.sglinks.dto.UnlockResponse;
import com.sglinks.exception.UrlPasswordRequiredException;
import com.sglinks.service.SlugSuggestionService;
import com.sglinks.service.UrlService;
import com.sglinks.util.IpUtils;
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
@Tag(name = "SG Links", description = "Shorten, redirect, and analyse URLs")
public class UrlController {

    private final UrlService urlService;
    private final SlugSuggestionService slugSuggestionService;

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

    @Operation(summary = "Suggest readable slugs for a URL using AI")
    @PostMapping("/api/urls/suggest-slug")
    public ResponseEntity<SlugSuggestionResponse> suggestSlug(@Valid @RequestBody SlugSuggestionRequest request) {
        List<String> suggestions = slugSuggestionService.suggest(request.url());
        return ResponseEntity.ok(new SlugSuggestionResponse(suggestions));
    }

    @Operation(summary = "Redirect to the original URL (302). Append + to see shareable analytics. Password-protected links redirect to the unlock page.")
    @GetMapping("/{pathVar:[a-zA-Z0-9_-]+[+]?}")
    public ResponseEntity<Void> redirect(@PathVariable String pathVar, HttpServletRequest request) {
        if (pathVar.endsWith("+")) {
            String code = pathVar.substring(0, pathVar.length() - 1);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create("/s/" + code))
                    .build();
        }

        String referrer = request.getHeader("Referer");
        String userAgent = request.getHeader("User-Agent");
        String ip = IpUtils.extractIp(request);
        try {
            String originalUrl = urlService.resolveAndTrack(pathVar, referrer, userAgent, ip);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(originalUrl))
                    .build();
        } catch (UrlPasswordRequiredException e) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create("/?unlock=" + pathVar))
                    .build();
        } catch (com.sglinks.exception.UrlNotFoundException e) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create("/?error=not-found"))
                    .build();
        } catch (com.sglinks.exception.UrlExpiredException e) {
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
}
