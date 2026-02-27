package com.urlshortener.service;

import com.urlshortener.dto.ClickRecord;
import com.urlshortener.dto.ShortenRequest;
import com.urlshortener.dto.ShortenResponse;
import com.urlshortener.dto.StatsResponse;
import com.urlshortener.exception.AliasConflictException;
import com.urlshortener.exception.UrlNotFoundException;
import com.urlshortener.model.Click;
import com.urlshortener.model.Url;
import com.urlshortener.repository.ClickRepository;
import com.urlshortener.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UrlService {

    private final UrlRepository urlRepository;
    private final ClickRepository clickRepository;
    private final Base62Encoder base62Encoder;
    private final BloomFilterService bloomFilterService;

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

        Url url = new Url();
        url.setShortCode(code);
        url.setOriginalUrl(request.url());

        try {
            urlRepository.saveAndFlush(url);
        } catch (DataIntegrityViolationException e) {
            // Race condition: another request inserted the same alias between our check and save
            throw new AliasConflictException(code);
        }
        bloomFilterService.add(code);

        return new ShortenResponse(code, baseUrl + "/" + code, request.url());
    }

    @Transactional
    public String resolveAndTrack(String code, String referrer, String userAgent) {
        if (!bloomFilterService.mightExist(code)) {
            throw new UrlNotFoundException(code);
        }
        Url url = urlRepository.findByShortCode(code)
                .orElseThrow(() -> new UrlNotFoundException(code));

        Click click = new Click();
        click.setUrl(url);
        click.setReferrer(truncate(referrer, 2048));
        click.setUserAgent(truncate(userAgent, 512));
        clickRepository.save(click);

        // Atomic increment — avoids lost-update race condition under concurrent traffic
        urlRepository.incrementClickCount(url.getId());

        return url.getOriginalUrl();
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

        return new StatsResponse(
                code,
                baseUrl + "/" + code,
                url.getOriginalUrl(),
                url.getClickCount(),
                recent
        );
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

    private static String truncate(String value, int max) {
        if (value == null) return null;
        return value.length() <= max ? value : value.substring(0, max);
    }
}
