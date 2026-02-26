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

        urlRepository.save(url);
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
        click.setReferrer(referrer);
        click.setUserAgent(userAgent);
        clickRepository.save(click);

        url.setClickCount(url.getClickCount() + 1);
        urlRepository.save(url);

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
}
