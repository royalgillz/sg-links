package com.sglinks.controller;

import com.sglinks.dto.PublicLinkDto;
import com.sglinks.dto.ShortenResponse;
import com.sglinks.dto.UserBioResponse;
import com.sglinks.dto.UserProfileResponse;
import com.sglinks.model.Url;
import com.sglinks.model.User;
import com.sglinks.repository.UrlRepository;
import com.sglinks.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.net.URI;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile and link management")
public class UserController {

    private final UserRepository userRepository;
    private final UrlRepository urlRepository;

    @Value("${app.base-url}")
    private String baseUrl;

    @Operation(summary = "Get current user profile")
    @GetMapping("/api/users/me")
    public ResponseEntity<UserProfileResponse> me(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return ResponseEntity.ok(new UserProfileResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole(), user.getCreatedAt()));
    }

    @Operation(summary = "Get all links owned by the current user")
    @GetMapping("/api/users/me/links")
    public ResponseEntity<List<ShortenResponse>> myLinks(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        List<ShortenResponse> links = urlRepository.findByUserId(userId).stream()
                .map(url -> new ShortenResponse(
                        url.getShortCode(),
                        baseUrl + "/" + url.getShortCode(),
                        url.getOriginalUrl(),
                        url.getExpiresAt(),
                        url.getPasswordHash() != null,
                        url.getOgTitle(),
                        url.getOgDescription(),
                        url.getOgImage()))
                .toList();
        return ResponseEntity.ok(links);
    }

    @Operation(summary = "Get public link-in-bio data for a username")
    @GetMapping("/api/users/{username}/bio")
    public ResponseEntity<UserBioResponse> bio(@PathVariable String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        List<PublicLinkDto> links = urlRepository
                .findPublicByUserId(user.getId(), OffsetDateTime.now(ZoneOffset.UTC))
                .stream()
                .map(url -> new PublicLinkDto(
                        baseUrl + "/" + url.getShortCode(),
                        url.getOgTitle() != null ? url.getOgTitle() : extractDomain(url.getOriginalUrl()),
                        url.getOgDescription(),
                        extractDomain(url.getOriginalUrl()),
                        url.getClickCount()))
                .toList();

        return ResponseEntity.ok(new UserBioResponse(user.getUsername(), links));
    }

    private static String extractDomain(String url) {
        try {
            return URI.create(url).getHost();
        } catch (Exception e) {
            return url;
        }
    }
}
