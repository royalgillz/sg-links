# URL Shortener

A portfolio URL shortener with analytics, built with Spring Boot, React, PostgreSQL, and Redis. Deployed on Railway.

**Live:** https://url-shortener-production-sehaj.up.railway.app
**API docs:** https://url-shortener-production-sehaj.up.railway.app/swagger-ui.html

## Features

| Feature | Detail |
|---|---|
| URL shortening | Base62 short codes with Bloom filter for fast negative lookups |
| Custom aliases | Choose your own slug (e.g. `/my-link`) |
| Link expiry | Set a TTL of 1 day to 1 year |
| Password protection | BCrypt-hashed password gates the redirect |
| Bulk shorten | Shorten up to 20 URLs at once |
| Click analytics | Per-click referrer, browser, OS breakdown, and time-series bar chart |
| Preview mode | Append `+` to any short URL to inspect stats before visiting |
| QR codes | Generated client-side with one-click PNG download |
| Link history | localStorage-backed history with click counts, favicons, and CSV export |
| Rate limiting | 10 requests / 60 s per IP via atomic Redis Lua script |
| Redis caching | Cache-aside on redirect — popular links skip the database |
| API keys | Generate keys to bypass rate limiting; SHA-256 hashed in DB |
| 3D background | Three.js animated scene with mouse parallax |
| GSD mode | Paste a URL → instant shorten; bookmarklet for one-click shortening from any page |

## Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3.2 |
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| Database | PostgreSQL 16 + Flyway migrations |
| Cache / Rate limiting | Redis 7 |
| 3D graphics | Three.js |
| API docs | SpringDoc OpenAPI (Swagger UI) |
| Metrics | Micrometer + Prometheus (`/actuator/prometheus`) |
| Logging | Logstash JSON (production) / human-readable (local) |
| Testing | JUnit 5 + Testcontainers + Playwright E2E |
| CI | GitHub Actions (unit · integration · Playwright · frontend build) |
| Deployment | Railway (3-stage Docker build) |

## API

Full interactive docs at `/swagger-ui.html`.

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/urls` | Shorten a URL |
| `POST` | `/api/urls/bulk` | Shorten up to 20 URLs |
| `GET` | `/{code}` | Redirect (append `+` for preview) |
| `POST` | `/api/urls/{code}/unlock` | Verify password and retrieve original URL |
| `GET` | `/api/urls/{code}/stats` | Click analytics |
| `DELETE` | `/api/urls/{code}` | Delete a short URL |
| `POST` | `/api/keys` | Generate an API key |
| `DELETE` | `/api/keys/{id}` | Revoke an API key (requires `X-API-Key` header) |

### Shorten request body

```json
{
  "url": "https://example.com",
  "alias": "my-link",
  "expiryDays": 7,
  "password": "secret"
}
```

`alias`, `expiryDays`, and `password` are all optional.

### API key usage

```bash
curl -X POST https://your-app.up.railway.app/api/urls \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_your_key_here" \
  -d '{"url": "https://example.com"}'
```

Valid API keys bypass the per-IP rate limit.

## Architecture notes

- **Bloom filter** (Guava) — fast in-memory check before hitting Postgres for non-existent codes
- **Cache-aside** — `redirect:{code}` cached in Redis with TTL matching link expiry; evicted on delete
- **Atomic click counter** — `UPDATE urls SET click_count = click_count + 1` avoids lost updates under concurrency
- **Rate limiter** — atomic fixed-window counter via Redis Lua script, no external library
- **API key auth** — SHA-256 hashed keys stored in DB; interceptor runs before rate limiter so valid keys skip it
- **Metrics** — `urls.created`, `urls.redirected` (cache_hit tag), `urls.deleted` counters exposed to Prometheus
- **3-stage Docker build** — Node builds React → Maven injects assets → JRE runs the JAR

## Local Development

### Prerequisites

- Java 17
- Maven 3.9+
- Node.js 22+
- Docker + Docker Compose

### Start infrastructure

```bash
docker compose up -d
```

### Run the application

```bash
./mvnw spring-boot:run
```

Frontend dev server (hot reload, proxies API to port 8080):

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### Run tests

```bash
# Unit tests — no infrastructure needed
./mvnw test -Dtest=Base62EncoderTest

# Integration tests — Testcontainers spins up Postgres + Redis automatically
./mvnw test -Dtest="UrlShortenerApplicationTests,UrlShortenerIntegrationTest"

# Playwright E2E — requires a built frontend
cd frontend
npm run build
npx playwright test
```

### Check metrics and health

```bash
curl http://localhost:8080/actuator/health
curl http://localhost:8080/actuator/prometheus
```

## Deployment

Deployed via Railway using a 3-stage Docker build:

1. **Node 22** — builds the React frontend
2. **Maven** — injects the built assets and packages the Spring Boot JAR (skipping Node)
3. **Eclipse Temurin 17 JRE** — runs the JAR

Required Railway environment variables:

| Variable | Source |
|---|---|
| `APP_BASE_URL` | Your Railway public URL, e.g. `https://your-app.up.railway.app` |
| `PGHOST` | Injected by Railway Postgres plugin |
| `PGPORT` | Injected by Railway Postgres plugin |
| `PGDATABASE` | Injected by Railway Postgres plugin |
| `PGUSER` | Injected by Railway Postgres plugin |
| `PGPASSWORD` | Injected by Railway Postgres plugin |
| `REDIS_URL` | Injected by Railway Redis plugin |
