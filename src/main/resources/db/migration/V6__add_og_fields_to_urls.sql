ALTER TABLE urls
    ADD COLUMN og_title       VARCHAR(200),
    ADD COLUMN og_description VARCHAR(500),
    ADD COLUMN og_image       TEXT;
