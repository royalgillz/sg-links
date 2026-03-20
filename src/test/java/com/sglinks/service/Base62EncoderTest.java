package com.sglinks.service;

import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class Base62EncoderTest {

    private final Base62Encoder encoder = new Base62Encoder();

    @Test
    void generatedCodeHasCorrectLength() {
        assertThat(encoder.generate()).hasSize(6);
    }

    @Test
    void generatedCodeIsAlphanumeric() {
        assertThat(encoder.generate()).matches("[a-zA-Z0-9]{6}");
    }

    @Test
    void generatesUniqueCodesUnderLoad() {
        Set<String> codes = new HashSet<>();
        for (int i = 0; i < 10_000; i++) {
            codes.add(encoder.generate());
        }
        // 62^6 ~56B possibilities — 10k draws should be essentially collision-free
        assertThat(codes).hasSizeGreaterThan(9_990);
    }
}
