ALTER TABLE urls
    ADD COLUMN user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE api_keys
    ADD COLUMN user_id BIGINT REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX idx_urls_user_id     ON urls (user_id);
CREATE INDEX idx_api_keys_user_id ON api_keys (user_id);
