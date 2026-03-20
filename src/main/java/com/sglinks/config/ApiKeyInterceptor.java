package com.sglinks.config;

import com.sglinks.service.ApiKeyService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class ApiKeyInterceptor implements HandlerInterceptor {

    private final ApiKeyService apiKeyService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        String raw = request.getHeader("X-API-Key");
        if (raw == null || raw.isBlank()) {
            return true; // no key provided — normal rate limiting applies
        }
        if (apiKeyService.validate(raw).isEmpty()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("{\"error\":\"Invalid or revoked API key.\"}");
            return false;
        }
        request.setAttribute("apiKeyAuthenticated", true);
        return true;
    }
}
