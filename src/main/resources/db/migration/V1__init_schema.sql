CREATE TABLE urls (
    id           BIGSERIAL    PRIMARY KEY,
    short_code   VARCHAR(10)  NOT NULL UNIQUE,
    original_url TEXT         NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    expires_at   TIMESTAMPTZ,
    click_count  BIGINT       NOT NULL DEFAULT 0
);

CREATE INDEX idx_urls_short_code ON urls (short_code);
