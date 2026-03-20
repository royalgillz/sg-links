package com.sglinks.service;

import com.sglinks.repository.ClickRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class GeoIpService {

    private static final Logger log = LoggerFactory.getLogger(GeoIpService.class);

    private static final Pattern PRIVATE_IP = Pattern.compile(
            "^(10\\.|172\\.(1[6-9]|2[0-9]|3[01])\\.|192\\.168\\.|127\\.|0:0:0:0:0:0:0:1|::1|localhost).*"
    );
    private static final Pattern COUNTRY_CODE = Pattern.compile("\"countryCode\"\\s*:\\s*\"([A-Z]{2})\"");

    private final ClickRepository clickRepository;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(3))
            .build();

    @Async
    public void resolveAndStore(Long clickId, String ip) {
        if (ip == null || ip.isBlank() || PRIVATE_IP.matcher(ip).matches()) {
            return;
        }
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("http://ip-api.com/json/" + ip + "?fields=countryCode"))
                    .timeout(Duration.ofSeconds(3))
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                var matcher = COUNTRY_CODE.matcher(response.body());
                if (matcher.find()) {
                    clickRepository.updateCountry(clickId, matcher.group(1));
                }
            }
        } catch (Exception e) {
            log.debug("GeoIP lookup failed for {}: {}", ip, e.getMessage());
        }
    }
}
