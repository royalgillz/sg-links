package com.urlshortener.service;

import org.springframework.stereotype.Component;

@Component
public class UserAgentParser {

    public String browser(String ua) {
        if (ua == null || ua.isBlank()) return "Unknown";
        if (ua.contains("Edg/"))       return "Edge";
        if (ua.contains("OPR/") || ua.contains("Opera")) return "Opera";
        if (ua.contains("Chrome/"))    return "Chrome";
        if (ua.contains("Firefox/"))   return "Firefox";
        if (ua.contains("Safari/") && ua.contains("Version/")) return "Safari";
        if (ua.contains("MSIE") || ua.contains("Trident/")) return "IE";
        return "Other";
    }

    public String os(String ua) {
        if (ua == null || ua.isBlank()) return "Unknown";
        if (ua.contains("Android"))    return "Android";
        if (ua.contains("iPhone") || ua.contains("iPad")) return "iOS";
        if (ua.contains("Windows"))    return "Windows";
        if (ua.contains("Mac OS X"))   return "macOS";
        if (ua.contains("Linux"))      return "Linux";
        return "Other";
    }
}
