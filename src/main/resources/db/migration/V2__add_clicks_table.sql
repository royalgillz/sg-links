CREATE TABLE clicks (
    id          BIGSERIAL    PRIMARY KEY,
    url_id      BIGINT       NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
    clicked_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    referrer    VARCHAR(2048),
    user_agent  VARCHAR(512)
);

CREATE INDEX idx_clicks_url_id ON clicks (url_id);
