package com.urlshortener.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.urlshortener.dto.ErrorResponse;
import com.urlshortener.service.RateLimiterService;
import com.urlshortener.util.IpUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RateLimiterService rateLimiterService;
    private final ObjectMapper objectMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {

        if (Boolean.TRUE.equals(request.getAttribute("apiKeyAuthenticated"))) {
            return true; // API key holders bypass rate limiting
        }

        String ip = IpUtils.extractIp(request);
        long retryAfter = rateLimiterService.check(ip);

        if (retryAfter > 0) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("Retry-After", String.valueOf(retryAfter));
            objectMapper.writeValue(
                    response.getWriter(),
                    new ErrorResponse("Rate limit exceeded. Try again in " + retryAfter + " seconds.")
            );
            return false;
        }

        return true;
    }

}
