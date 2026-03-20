package com.sglinks.service;

import com.google.common.hash.BloomFilter;
import com.sglinks.repository.UrlRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class BloomFilterService {

    private final BloomFilter<String> shortCodeBloomFilter;
    private final UrlRepository urlRepository;

    /** Seed the filter from the database on startup so existing links resolve correctly after a restart. */
    @PostConstruct
    @Transactional(readOnly = true)
    public void hydrate() {
        long count = 0;
        for (String code : urlRepository.findAllShortCodes()) {
            shortCodeBloomFilter.put(code);
            count++;
        }
        log.info("Bloom filter hydrated with {} short codes", count);
    }

    /** Returns true if the code MIGHT exist (check DB). False = definitely absent. */
    public boolean mightExist(String code) {
        return shortCodeBloomFilter.mightContain(code);
    }

    public void add(String code) {
        shortCodeBloomFilter.put(code);
    }
}
