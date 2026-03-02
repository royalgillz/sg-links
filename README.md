# URL Shortener

A portfolio URL shortener with analytics, custom aliases, link expiry, and rate limiting. Built with Spring Boot, React, PostgreSQL, and Redis. Deployed on Railway.

**Live:** https://url-shortener-production-sehaj.up.railway.app

## Features

- Shorten any URL to a Base62 short code
- Custom aliases (e.g. `/my-link`)
- Link expiry (1 day to 1 year)
- Click analytics — referrer and user-agent tracking
- Rate limiting (10 requests / 60 s per IP)
- Link history with click counts, open, copy, and delete
- 3D animated background (Three.js)

## Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3.2 |
| Frontend | React + Vite + Tailwind CSS v4 |
| Database | PostgreSQL 16 + Flyway |
| Cache / Rate limiting | Redis 7 |
| 3D graphics | Three.js |
| Deployment | Railway (Docker) |

## API

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/urls` | Shorten a URL |
| `GET` | `/{code}` | Redirect to original URL |
| `GET` | `/api/urls/{code}/stats` | Get click stats |
| `DELETE` | `/api/urls/{code}` | Delete a short URL |

### Shorten request body

```json
{
  "url": "https://example.com",
  "alias": "my-link",
  "expiryDays": 7
}
```

`alias` and `expiryDays` are optional.

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

The frontend dev server (with hot reload) runs separately:

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173 — proxies API calls to the backend on port 8080.

### Verify health

```bash
curl http://localhost:8080/actuator/health
```

### Run tests

```bash
# Unit tests only (no infra needed)
./mvnw test -Dtest=Base62EncoderTest
```

## Deployment

Deployed via Railway using a 3-stage Docker build:

1. Node 22 builds the React frontend
2. Maven injects the built assets and packages the JAR
3. Eclipse Temurin 17 JRE runs the JAR

Required Railway environment variables:

| Variable | Example |
|---|---|
| `APP_BASE_URL` | `https://your-app.up.railway.app` |
| `PGHOST` | injected by Railway Postgres |
| `PGPORT` | injected by Railway Postgres |
| `PGDATABASE` | injected by Railway Postgres |
| `PGUSER` | injected by Railway Postgres |
| `PGPASSWORD` | injected by Railway Postgres |
| `REDIS_URL` | injected by Railway Redis |
