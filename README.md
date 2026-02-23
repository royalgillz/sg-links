# URL Shortener

A portfolio-quality URL shortener with analytics, built with Java 21, Spring Boot 3, PostgreSQL, and Redis.

## Stack

| Layer | Technology |
|---|---|
| Runtime | Java 21, Spring Boot 3.2 |
| Database | PostgreSQL 16 + Flyway migrations |
| Cache | Redis 7 |
| Build | Maven |
| Infrastructure | Docker Compose |

## API

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/urls` | Shorten a URL |
| `GET` | `/{code}` | Redirect to original URL |

## Local Development

### Prerequisites
- Java 21
- Maven 3.9+
- Docker + Docker Compose

### Start infrastructure

```bash
docker compose up -d
```

### Run the application

```bash
./mvnw spring-boot:run
```

### Verify health

```bash
curl http://localhost:8080/actuator/health
```

### Shorten a URL

```bash
curl -s -X POST http://localhost:8080/api/urls \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com"}' | jq .
```

### Run tests

```bash
# Unit tests only (no infra needed)
./mvnw test -Dtest=Base62EncoderTest

# All tests (requires docker compose up -d)
./mvnw test
```

## Phases

- [x] Phase 0 — Skeleton, Docker Compose, Flyway baseline
- [x] Phase 1 — Core URL shortening + Bloom filter
- [ ] Phase 2 — Analytics (click tracking, stats endpoint)
- [ ] Phase 3 — Redis cache (cache-aside on redirect)
- [ ] Phase 4 — Rate limiting
- [ ] Phase 5 — API keys
- [ ] Phase 6 — Observability
- [ ] Phase 7 — Testing (Testcontainers + Playwright)
- [ ] Phase 8 — CI/CD
- [ ] Phase 9 — Production polish
