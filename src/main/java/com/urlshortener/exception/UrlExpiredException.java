package com.urlshortener.exception;

public class UrlExpiredException extends RuntimeException {
    public UrlExpiredException(String code) {
        super("Short link '" + code + "' has expired");
    }
}
