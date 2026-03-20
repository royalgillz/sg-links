package com.sglinks.exception;

public class UrlPasswordRequiredException extends RuntimeException {
    public UrlPasswordRequiredException(String code) {
        super("Password required for: " + code);
    }
}
