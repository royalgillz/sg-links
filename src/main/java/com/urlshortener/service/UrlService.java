package com.urlshortener.service;

import com.urlshortener.dto.ShortenRequest;
import com.urlshortener.dto.ShortenResponse;
import com.urlshortener.exception.UrlNotFoundException;
import com.urlshortener.model.Url;
import com.urlshortener.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UrlService {

    private final UrlRepository urlRepository;
    private final Base62Encoder base62Encoder;
    private final BloomFilterService bloomFilterService;

    @Value("${app.base-url}")
    private String baseUrl;

    @Transactional
    public ShortenResponse shorten(ShortenRequest request) {
        String code = generateUniqueCode();

        Url url = new Url();
        url.setShortCode(code);
        url.setOriginalUrl(request.url());

        urlRepository.save(url);
        bloomFilterService.add(code);

        return new ShortenResponse(code, baseUrl + "/" + code, request.url());
    }

    @Transactional(readOnly = true)
    public String resolveOriginalUrl(String code) {
        // Bloom filter fast-path: definitely absent codes skip the DB entirely
        if (!bloomFilterService.mightExist(code)) {
            throw new UrlNotFoundException(code);
        }
        return urlRepository.findByShortCode(code)
                .map(Url::getOriginalUrl)
                .orElseThrow(() -> new UrlNotFoundException(code));
    }

    private String generateUniqueCode() {
        for (int attempt = 0; attempt < 10; attempt++) {
            String code = base62Encoder.generate();
            // mightExist=false → definitely new, use immediately (no DB round-trip)
            // mightExist=true  → possible collision, verify with DB before accepting
            if (!bloomFilterService.mightExist(code) || !urlRepository.existsByShortCode(code)) {
                return code;
            }
        }
        throw new IllegalStateException("Failed to generate a unique short code after 10 attempts");
    }
}
