package com.urlshortener.service;

import com.urlshortener.dto.BreakdownEntry;
import com.urlshortener.dto.BulkShortenItem;
import com.urlshortener.dto.BulkShortenRequest;
import com.urlshortener.dto.ClickRecord;
import com.urlshortener.dto.DailyClickCount;
import com.urlshortener.dto.ShortenRequest;
import com.urlshortener.dto.ShortenResponse;
import com.urlshortener.dto.StatsResponse;
import com.urlshortener.dto.UnlockRequest;
import com.urlshortener.dto.UnlockResponse;
import com.urlshortener.exception.AliasConflictException;
import com.urlshortener.exception.InvalidPasswordException;
import com.urlshortener.exception.UrlExpiredException;
import com.urlshortener.exception.UrlNotFoundException;
import com.urlshortener.exception.UrlPasswordRequiredException;
import com.urlshortener.model.Click;
import com.urlshortener.model.Url;
import com.urlshortener.repository.ClickRepository;
import com.urlshortener.repository.UrlRepository;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UrlService {

    private final UrlRepository urlRepository;
    private final ClickRepository clickRepository;
    private final Base62Encoder base62Encoder;
    private final BloomFilterService bloomFilterService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final UserAgentParser userAgentParser;
    private final UrlCacheService urlCacheService;
    private final MeterRegistry meterRegistry;

    @Value("${app.base-url}")
    private String baseUrl;

    @Transactional
    public ShortenResponse shorten(ShortenRequest request) {
        String code;

        if (request.alias() != null && !request.alias().isBlank()) {
            code = request.alias();
            if (bloomFilterService.mightExist(code) && urlRepository.existsByShortCode(code)) {
                throw new AliasConflictException(code);
            }
        } else {
            code = generateUniqueCode();
        }

        OffsetDateTime expiresAt = null;
        if (request.expiryDays() != null) {
            expiresAt = OffsetDateTime.now(ZoneOffset.UTC).plusDays(request.expiryDays());
        }

        Url url = new Url();
        url.setShortCode(code);
        url.setOriginalUrl(request.url());
        url.setExpiresAt(expiresAt);
        if (request.password() != null && !request.password().isBlank()) {
            url.setPasswordHash(passwordEncoder.encode(request.password()));
        }

        try {
            urlRepository.saveAndFlush(url);
        } catch (DataIntegrityViolationException e) {
            // Race condition: another request inserted the same alias between our check and save
            throw new AliasConflictException(code);
        }
        bloomFilterService.add(code);

        meterRegistry.counter("urls.created",
                "alias", request.alias() != null && !request.alias().isBlank() ? "true" : "false",
                "password", url.getPasswordHash() != null ? "true" : "false"
        ).increment();

        return new ShortenResponse(code, baseUrl + "/" + code, request.url(), expiresAt, url.getPasswordHash() != null);
    }

    @Transactional
    public String resolveAndTrack(String code, String referrer, String userAgent) {
        if (!bloomFilterService.mightExist(code)) {
            throw new UrlNotFoundException(code);
        }

        // Try cache first to avoid DB read on popular links
        UrlCacheService.CachedUrl cached = urlCacheService.get(code).orElse(null);

        final Long urlId;
        final String originalUrl;

        if (cached != null) {
            if (cached.expiresAt() != null && cached.expiresAt().isBefore(OffsetDateTime.now(ZoneOffset.UTC))) {
                urlCacheService.evict(code);
                throw new UrlExpiredException(code);
            }
            urlId = cached.id();
            originalUrl = cached.originalUrl();
        } else {
            Url url = urlRepository.findByShortCode(code)
                    .orElseThrow(() -> new UrlNotFoundException(code));

            if (url.getExpiresAt() != null && url.getExpiresAt().isBefore(OffsetDateTime.now(ZoneOffset.UTC))) {
                throw new UrlExpiredException(code);
            }
            if (url.getPasswordHash() != null) {
                throw new UrlPasswordRequiredException(code);
            }

            urlCacheService.put(code, url);
            urlId = url.getId();
            originalUrl = url.getOriginalUrl();
        }

        Click click = new Click();
        click.setUrl(urlRepository.getReferenceById(urlId));
        click.setReferrer(truncate(referrer, 2048));
        click.setUserAgent(truncate(userAgent, 512));
        clickRepository.save(click);

        urlRepository.incrementClickCount(urlId);

        meterRegistry.counter("urls.redirected",
                "cache_hit", cached != null ? "true" : "false"
        ).increment();

        return originalUrl;
    }

    @Transactional(readOnly = true)
    public StatsResponse getStats(String code) {
        Url url = urlRepository.findByShortCode(code)
                .orElseThrow(() -> new UrlNotFoundException(code));

        List<ClickRecord> recent = clickRepository
                .findByUrlIdOrderByClickedAtDesc(url.getId(), PageRequest.of(0, 10))
                .stream()
                .map(c -> new ClickRecord(c.getClickedAt(), c.getReferrer()))
                .toList();

        List<DailyClickCount> clicksByDay = clickRepository
                .clicksPerDayLast30(url.getId())
                .stream()
                .map(row -> new DailyClickCount((String) row[0], ((Number) row[1]).longValue()))
                .toList();

        List<String> userAgents = clickRepository.findUserAgentsByUrlId(url.getId());
        List<BreakdownEntry> browserBreakdown = toBreakdown(userAgents, userAgentParser::browser);
        List<BreakdownEntry> osBreakdown = toBreakdown(userAgents, userAgentParser::os);

        return new StatsResponse(
                code,
                baseUrl + "/" + code,
                url.getOriginalUrl(),
                url.getClickCount(),
                recent,
                clicksByDay,
                browserBreakdown,
                osBreakdown,
                url.getExpiresAt()
        );
    }

    @Transactional
    public List<BulkShortenItem> bulkShorten(BulkShortenRequest request) {
        List<BulkShortenItem> results = new ArrayList<>();
        for (String url : request.urls()) {
            try {
                ShortenRequest single = new ShortenRequest(url, null, null, null);
                ShortenResponse response = shorten(single);
                results.add(new BulkShortenItem(url, response.shortUrl(), null));
            } catch (Exception e) {
                results.add(new BulkShortenItem(url, null, e.getMessage()));
            }
        }
        return results;
    }

    @Transactional(readOnly = true)
    public UnlockResponse unlock(String code, UnlockRequest request) {
        Url url = urlRepository.findByShortCode(code)
                .orElseThrow(() -> new UrlNotFoundException(code));
        if (url.getPasswordHash() == null || !passwordEncoder.matches(request.password(), url.getPasswordHash())) {
            throw new InvalidPasswordException();
        }
        return new UnlockResponse(url.getOriginalUrl());
    }

    @Transactional
    public void delete(String code) {
        Url url = urlRepository.findByShortCode(code)
                .orElseThrow(() -> new UrlNotFoundException(code));
        urlRepository.delete(url);
        urlCacheService.evict(code);
        meterRegistry.counter("urls.deleted").increment();
    }

    private String generateUniqueCode() {
        for (int attempt = 0; attempt < 10; attempt++) {
            String code = base62Encoder.generate();
            if (!bloomFilterService.mightExist(code) || !urlRepository.existsByShortCode(code)) {
                return code;
            }
        }
        throw new IllegalStateException("Failed to generate a unique short code after 10 attempts");
    }

    private List<BreakdownEntry> toBreakdown(List<String> userAgents, java.util.function.Function<String, String> classifier) {
        return userAgents.stream()
                .collect(Collectors.groupingBy(classifier, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder()))
                .map(e -> new BreakdownEntry(e.getKey(), e.getValue()))
                .toList();
    }

    private static String truncate(String value, int max) {
        if (value == null) return null;
        return value.length() <= max ? value : value.substring(0, max);
    }
}
