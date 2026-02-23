package com.urlshortener.service;

import com.google.common.hash.BloomFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BloomFilterService {

    private final BloomFilter<String> shortCodeBloomFilter;

    /** Returns true if the code MIGHT exist (check DB). False = definitely absent. */
    public boolean mightExist(String code) {
        return shortCodeBloomFilter.mightContain(code);
    }

    public void add(String code) {
        shortCodeBloomFilter.put(code);
    }
}
