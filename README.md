---
title: SG Links
emoji: 🔗
colorFrom: yellow
colorTo: red
sdk: docker
app_port: 7860
pinned: false
---

<!-- The YAML block above is read by Hugging Face Spaces to build this repo as a
     Docker Space. GitHub renders it as a small table; it is safe to leave in place. -->

# sg/links

A full-featured link shortener by Sehaj Gill with analytics, user accounts, AI slug suggestions, and a browser extension. Built with Spring Boot, React, PostgreSQL, and Redis.

The frontend is its own thing on purpose: a hand-drawn "engineer's notebook" look built with rough.js sketchy borders, a monospace/grotesque type system, neobrutalist hard shadows, a notebook/blueprint theme toggle, and a Three.js interlocking chain-link hero. No gradient soup.

**Live:** https://your-user-sg-links.hf.space (replace with your own Space URL)

**API docs:** https://your-user-sg-links.hf.space/swagger-ui.html

![App screenshot](docs/screenshot.png)

## Features

| Feature | Detail |
|---|---|
| URL shortening | Base62 short codes with a Bloom filter seeded from the DB on startup |
| Custom aliases | Choose your own slug (e.g. `/my-link`) |
| AI slug suggestions | Click the sparkle button to get 3 AI-generated slug ideas (OpenAI gpt-4o-mini primary, Claude Haiku fallback) |
| Link expiry | Set a TTL of 1 day to 1 year |
| Password protection | BCrypt-hashed password gates the redirect |
| Bulk shorten | Shorten up to 20 URLs at once |
| Click analytics | Per-click referrer, browser, OS, and country breakdown with a time-series chart |
| Country tracking | Async IP to country lookup via ip-api.com |
| Link editing | Update the destination URL of any existing short link |
| Shareable analytics | Append `+` to any short URL to get a public analytics page at `/s/{code}` |
| OG tag overrides | Set custom title, description, and image for social link previews per link |
| QR codes | Generated client-side with PNG and SVG download |
| User accounts | Register / login with JWT auth; links associated with your account |
| Link-in-bio page | Public page at `/u/{username}` showing all your public links |
| Link history | localStorage-backed history (server-side when logged in); CSV export; mobile-friendly |
| Rate limiting | 10 requests / 60 s per IP on all endpoints including redirects |
| Redis caching | Cache-aside on redirect, so popular links skip the database |
| API keys | Generate keys to bypass rate limiting; SHA-256 hashed in DB |
| Browser extension | Chrome Manifest V3 extension to shorten the current tab's URL |
| 3D chain-link hero | Three.js interlocking-rings "link" motif, theme-aware, with mouse parallax |
| Notebook / blueprint themes | Light hand-drawn "notebook" theme and dark "blueprint" theme with a toggle |
| GSD mode | Paste a URL for an instant shorten; bookmarklet for one-click shortening from any page |

## Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3.2, Spring Security |
| Auth | JWT (JJWT 0.12), BCrypt |
| Frontend | React 19 + Vite + Tailwind CSS v4, with rough.js (hand-drawn UI) and Three.js |
| Database | PostgreSQL 16 + Flyway migrations (V1 to V8) |
| Cache / Rate limiting | Redis 7 |
| AI | OpenAI gpt-4o-mini (primary) + Anthropic Claude Haiku (fallback) for slug suggestions |
| 3D graphics | Three.js |
| API docs | SpringDoc OpenAPI (Swagger UI) |
| Metrics | Micrometer + Prometheus (`/actuator/prometheus`) |
| Logging | Logstash JSON (production) / human-readable (local) |
| Testing | JUnit 5 + Testcontainers + Playwright E2E |
| CI | GitHub Actions (unit, integration, Playwright, frontend build) |
| Deployment | Hugging Face Spaces (Docker), Neon (Postgres), Upstash (Redis) |

## API

Full interactive docs at `/swagger-ui.html`.

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/urls` | Shorten a URL |
| `POST` | `/api/urls/bulk` | Shorten up to 20 URLs |
| `POST` | `/api/urls/suggest-slug` | Get AI slug suggestions for a URL |
| `GET` | `/{code}` | Redirect (append `+` for the shareable analytics page) |
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

`alias`, `expiryDays`, `password`, and the OG fields are all optional.

### Auth usage

```bash
# Register
curl -X POST https://your-user-sg-links.hf.space/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "email": "alice@example.com", "password": "secret123"}'

# Login
curl -X POST https://your-user-sg-links.hf.space/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail": "alice", "password": "secret123"}'

# Use the token
curl -X POST https://your-user-sg-links.hf.space/api/urls \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"url": "https://example.com"}'
```

### API key usage

```bash
curl -X POST https://your-user-sg-links.hf.space/api/urls \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_your_key_here" \
  -d '{"url": "https://example.com"}'
```

Valid API keys bypass the per-IP rate limit.

## Architecture notes

- **Bloom filter** (Guava): seeded from all existing short codes on startup; a fast in-memory negative check before hitting Postgres.
- **Cache-aside**: `redirect:{code}` cached in Redis with a TTL matching link expiry; evicted on delete/edit.
- **Atomic click counter**: `UPDATE urls SET click_count = click_count + 1` avoids lost updates under concurrency.
- **Rate limiter**: atomic fixed-window counter via a Redis Lua script covering all endpoints including redirects.
- **JWT auth**: stateless HS256 tokens; `JwtAuthenticationFilter` sets the Spring Security context; anonymous usage is fully preserved.
- **API key auth**: SHA-256 hashed keys stored in DB; the interceptor runs before the rate limiter so valid keys skip it.
- **AI slugs**: tries OpenAI `gpt-4o-mini` first, falls back to Anthropic Claude Haiku; gracefully returns an empty list if neither key is set; no extra SDK dependency (raw HTTP).
- **OG tag injection**: `/s/{code}` and `/u/{username}` are served by `SpaController`, which reads `index.html` and injects per-link OG meta tags server-side.
- **Metrics**: `urls.created`, `urls.redirected` (cache_hit tag), `urls.deleted` counters exposed to Prometheus.
- **3-stage Docker build**: Node builds React, Maven injects the assets, a JRE runs the JAR.

## Design language

The UI is deliberately not a generic SaaS template:

- **Two themes, one toggle**: a light "notebook" theme (cream paper, ink, coral accent) and a dark "blueprint" theme (navy graph paper, cyan accent).
- **Hand-drawn borders**: cards, inputs, and buttons are framed with rough.js, so the strokes wobble like a felt-tip sketch.
- **Type system**: Bricolage Grotesque for headings, JetBrains Mono for UI and data, Caveat for handwritten annotations.
- **Neobrutalist surfaces**: solid borders with hard offset shadows, no glassmorphism or gradients.
- **3D chain-link hero**: three interlocking rings (the "link" motif) rendered as a Three.js wireframe, with the middle ring in the brand accent and gentle mouse parallax.

## Browser Extension

The `extension/` folder contains a Chrome Manifest V3 extension.

**Setup:**
1. Open `extension/popup.js` and set `BASE_URL` to your deployed URL.
2. In Chrome: `chrome://extensions`, enable Developer mode, Load unpacked, select `extension/`.
3. Click the extension icon on any page to shorten the current tab's URL.

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
# Unit tests, no infrastructure needed
./mvnw test -Dtest=Base62EncoderTest

# Integration tests, Testcontainers spins up Postgres + Redis automatically
./mvnw test -Dtest="SgLinksApplicationTests,SgLinksIntegrationTest"

# Playwright E2E, requires a built frontend
cd frontend
npm run build
npx playwright test
```

### Check metrics and health

```bash
curl http://localhost:8080/actuator/health
curl http://localhost:8080/actuator/prometheus
```

## Deployment (Hugging Face Spaces + Neon + Upstash)

The app runs as a single Docker container on a free Hugging Face Space. Spaces does not
provide a managed database or Redis, so Postgres comes from Neon and Redis from Upstash,
both on their free tiers. The result is a fully free, three-provider setup.

### 1. Create a Postgres database on Neon

1. Sign up at [neon.tech](https://neon.tech) and create a project.
2. From the connection details, note the host, database name, user, and password.
3. Neon only accepts SSL connections, so `PGSSLMODE` must be `require`.

### 2. Create a Redis database on Upstash

1. Sign up at [upstash.com](https://upstash.com) and create a Redis database.
2. Copy the TLS connection URL. It looks like `rediss://default:<password>@<region>.upstash.io:6379`.

### 3. Create the Hugging Face Space

1. On [huggingface.co](https://huggingface.co), create a new Space with **SDK: Docker**.
2. Push this repository to the Space's git remote. The YAML front matter at the top of this
   README tells Spaces to build the Dockerfile and serve the app on port 7860.

### 4. Set Space secrets

In the Space settings, add the following as **Secrets** (or **Variables** for the non-secret ones):

| Variable | Source |
|---|---|
| `APP_BASE_URL` | Your Space URL, e.g. `https://your-user-sg-links.hf.space` |
| `JWT_SECRET` | A long random string (32+ chars) for signing JWT tokens |
| `PGHOST` | Neon host |
| `PGPORT` | `5432` |
| `PGDATABASE` | Neon database name |
| `PGUSER` | Neon user |
| `PGPASSWORD` | Neon password |
| `PGSSLMODE` | `require` (Neon requires SSL) |
| `REDIS_URL` | Upstash TLS URL (`rediss://...`) |
| `OPENAI_API_KEY` | Optional, enables AI slug suggestions (primary, gpt-4o-mini) |
| `ANTHROPIC_API_KEY` | Optional, AI slug fallback if the OpenAI key is not set |

The Dockerfile defaults `PORT` to 7860 to match the Space, so you do not need to set it.

### Notes and tradeoffs

- Free Spaces sleep after about 48 hours of inactivity and the local disk is ephemeral.
  Because Postgres and Redis are external, no data is lost when the Space restarts.
- The public URL is a `*.hf.space` subdomain, which is longer than a custom domain.
- Free CPU Basic gives 2 vCPU and 16 GB RAM, which is plenty for this app.

### Deploying elsewhere

The same Dockerfile runs on any container host (Railway, Fly.io, Render, etc.). Those
platforms inject their own `PORT`, which overrides the Dockerfile default, and most provide
managed Postgres and Redis so you can skip Neon and Upstash. Set the same environment
variables listed above (with `PGSSLMODE=disable` if the managed Postgres does not require SSL).
