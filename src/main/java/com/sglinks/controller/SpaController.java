package com.sglinks.controller;

import com.sglinks.model.Url;
import com.sglinks.repository.UrlRepository;
import com.sglinks.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.nio.charset.StandardCharsets;

@Slf4j
@Controller
@RequiredArgsConstructor
public class SpaController {

    private final UrlRepository urlRepository;
    private final UserRepository userRepository;

    @Value("${app.base-url}")
    private String baseUrl;

    @GetMapping("/s/{code}")
    public ResponseEntity<String> shareableStats(@PathVariable String code) {
        String title = code + " — Link Analytics";
        String description = "View click analytics for this short link";
        String imageUrl = "";

        try {
            Url url = urlRepository.findByShortCode(code).orElse(null);
            if (url != null) {
                description = url.getClickCount() + " click" + (url.getClickCount() == 1 ? "" : "s") + " tracked";
                if (url.getOgTitle() != null && !url.getOgTitle().isBlank()) title = url.getOgTitle();
                if (url.getOgDescription() != null && !url.getOgDescription().isBlank()) description = url.getOgDescription();
                if (url.getOgImage() != null && !url.getOgImage().isBlank()) imageUrl = url.getOgImage();
            }
        } catch (Exception e) {
            log.debug("Could not load OG data for /s/{}: {}", code, e.getMessage());
        }

        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(injectOgTags(title, description, imageUrl, baseUrl + "/s/" + code));
    }

    @GetMapping("/u/{username}")
    public ResponseEntity<String> linkInBio(@PathVariable String username) {
        String title = username + "'s links";
        String description = "A curated collection of links by " + username;

        String html = injectOgTags(title, description, "", baseUrl + "/u/" + username);
        return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(html);
    }

    private String injectOgTags(String title, String description, String imageUrl, String pageUrl) {
        String ogTags = """
                <meta property="og:title" content="%s" />
                <meta property="og:description" content="%s" />
                <meta property="og:url" content="%s" />
                <meta property="og:type" content="website" />
                %s
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content="%s" />
                <meta name="twitter:description" content="%s" />
                """.formatted(
                escapeHtml(title),
                escapeHtml(description),
                escapeHtml(pageUrl),
                imageUrl.isBlank() ? "" : "<meta property=\"og:image\" content=\"" + escapeHtml(imageUrl) + "\" />",
                escapeHtml(title),
                escapeHtml(description));

        try {
            ClassPathResource resource = new ClassPathResource("static/index.html");
            String html = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            return html.replace("</head>", ogTags + "</head>");
        } catch (Exception e) {
            // Fallback minimal HTML if static/index.html hasn't been built yet
            return """
                    <!DOCTYPE html><html><head>
                    <meta charset="UTF-8" />
                    <meta property="og:title" content="%s" />
                    <meta property="og:description" content="%s" />
                    <meta http-equiv="refresh" content="0; url=/" />
                    </head><body><a href="/">Go to app</a></body></html>
                    """.formatted(escapeHtml(title), escapeHtml(description));
        }
    }

    private static String escapeHtml(String s) {
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
