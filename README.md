# URL Shortener

A full-featured URL shortener with analytics, user accounts, AI slug suggestions, and a browser extension. Built with Spring Boot, React, PostgreSQL, and Redis. Deployed on Railway.

**Live:** https://url-shortener-production-sehaj.up.railway.app

**API docs:** https://url-shortener-production-sehaj.up.railway.app/swagger-ui.html

[![App screenshot](docs/screenshot.png)](https://url-shortener-production-sehaj.up.railway.app)

## Features

| Feature | Detail |
|---|---|
| URL shortening | Base62 short codes with Bloom filter seeded from DB on startup |
| Custom aliases | Choose your own slug (e.g. `/my-link`) |
| AI slug suggestions | Click ✨ to get 3 AI-generated slug ideas via Claude (Haiku) |
| Link expiry | Set a TTL of 1 day to 1 year |
| Password protection | BCrypt-hashed password gates the redirect |
| Bulk shorten | Shorten up to 20 URLs at once |
| Click analytics | Per-click referrer, browser, OS, and country breakdown with time-series chart |
| Country tracking | Async IP → country lookup via ip-api.com |
| Link editing | Update the destination URL of any existing short link |
| Shareable analytics | Append `+` to any short URL to get a public analytics page at `/s/{code}` |
| OG tag overrides | Set custom title, description, and image for social link previews per link |
| QR codes | Generated client-side with PNG **and SVG** download |
| User accounts | Register / login with JWT auth; links associated with your account |
| Link-in-bio page | Public page at `/u/{username}` showing all your public links |
| Link history | localStorage-backed history (server-side when logged in); CSV export; mobile-friendly |
| Rate limiting | 10 requests / 60 s per IP on all endpoints including redirects |
| Redis caching | Cache-aside on redirect — popular links skip the database |
| API keys | Generate keys to bypass rate limiting; SHA-256 hashed in DB |
| Browser extension | Chrome Manifest V3 extension to shorten the current tab's URL |
| 3D background | Three.js animated scene with mouse parallax |
| GSD mode | Paste a URL → instant shorten; bookmarklet for one-click shortening from any page |

## Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3.2, Spring Security |
| Auth | JWT (JJWT 0.12), BCrypt |
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| Database | PostgreSQL 16 + Flyway migrations (V1–V8) |
| Cache / Rate limiting | Redis 7 |
| AI | Anthropic Claude Haiku (slug suggestions) |
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
| `POST` | `/api/urls/suggest-slug` | Get AI slug suggestions for a URL |
| `GET` | `/{code}` | Redirect (append `+` for shareable analytics page) |
| `POST` | `/api/urls/{code}/unlock` | Verify password and retrieve original URL |
| `GET` | `/api/urls/{code}/stats` | Click analytics |
| `PATCH` | `/api/urls/{code}` | Update the destination URL |
| `DELETE` | `/api/urls/{code}` | Delete a short URL |
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Login and get a JWT token |
| `GET` | `/api/users/me` | Get current user profile (requires auth) |
| `GET` | `/api/users/me/links` | Get all links owned by the current user (requires auth) |
| `GET` | `/api/users/{username}/bio` | Public link-in-bio data for a username |
| `POST` | `/api/keys` | Generate an API key |
| `DELETE` | `/api/keys/{id}` | Revoke an API key (requires `X-API-Key` header) |

### Shorten request body

```json
{
  "url": "https://example.com",
  "alias": "my-link",
  "expiryDays": 7,
  "password": "secret",
  "ogTitle": "Check out this article",
  "ogDescription": "A short description shown in link previews",
  "ogImage": "https://example.com/preview.jpg"
}
```

`alias`, `expiryDays`, `password`, and OG fields are all optional.

### Auth usage

```bash
# Register
curl -X POST https://your-app.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "email": "alice@example.com", "password": "secret123"}'

# Login
curl -X POST https://your-app.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail": "alice", "password": "secret123"}'

# Use the token
curl -X POST https://your-app.up.railway.app/api/urls \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"url": "https://example.com"}'
```

### API key usage

```bash
curl -X POST https://your-app.up.railway.app/api/urls \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_your_key_here" \
  -d '{"url": "https://example.com"}'
```

Valid API keys bypass the per-IP rate limit.

## Architecture notes

- **Bloom filter** (Guava) — seeded from all existing short codes on startup; fast in-memory negative check before hitting Postgres
- **Cache-aside** — `redirect:{code}` cached in Redis with TTL matching link expiry; evicted on delete/edit
- **Atomic click counter** — `UPDATE urls SET click_count = click_count + 1` avoids lost updates under concurrency
- **Rate limiter** — atomic fixed-window counter via Redis Lua script covering all endpoints including redirects
- **JWT auth** — stateless HS256 tokens; `JwtAuthenticationFilter` sets Spring Security context; anonymous usage fully preserved
- **API key auth** — SHA-256 hashed keys stored in DB; interceptor runs before rate limiter so valid keys skip it
- **AI slugs** — calls Anthropic Claude Haiku via raw HTTP (no extra SDK dependency); gracefully returns empty list if `ANTHROPIC_API_KEY` is unset
- **OG tag injection** — `/s/{code}` and `/u/{username}` served by `SpaController` which reads `index.html` and injects per-link OG meta tags server-side
- **Metrics** — `urls.created`, `urls.redirected` (cache_hit tag), `urls.deleted` counters exposed to Prometheus
- **3-stage Docker build** — Node builds React → Maven injects assets → JRE runs the JAR

## Browser Extension

The `extension/` folder contains a Chrome Manifest V3 extension.

**Setup:**
1. Open `extension/popup.js` and set `BASE_URL` to your deployed URL
2. In Chrome: `chrome://extensions` → Enable Developer mode → Load unpacked → select `extension/`
3. Click the extension icon on any page to shorten the current tab's URL

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
| `JWT_SECRET` | A long random string (min 32 chars) for signing JWT tokens |
| `ANTHROPIC_API_KEY` | Optional — enables AI slug suggestions |
| `PGHOST` | Injected by Railway Postgres plugin |
| `PGPORT` | Injected by Railway Postgres plugin |
| `PGDATABASE` | Injected by Railway Postgres plugin |
| `PGUSER` | Injected by Railway Postgres plugin |
| `PGPASSWORD` | Injected by Railway Postgres plugin |
| `REDIS_URL` | Injected by Railway Redis plugin |
