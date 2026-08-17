# OpenEx 3.0 - Simulated Crypto Exchange & AI Trading Terminal

A microservices-based simulated crypto exchange built over a 3-week capstone
sprint: a Kotlin/Spring Boot trading backend, a React frontend, and a Python
AI/analytics service, all running locally with Docker Compose.

## Architecture

| Service | Tech | Port |
|---|---|---|
| `backend` | Kotlin, Spring Boot, PostgreSQL, Flyway | 8080 |
| `frontend` | React, Vite | 5173 |
| `market-data-service` | Python, Flask, LangChain, Ollama | 5000 |
| `postgres` | PostgreSQL 16 | 5432 |
| `redis` | Redis 7 | 6379 |

## Prerequisites

- Docker Desktop
- Node.js 18+ and npm (for running the frontend outside Docker)
- Java 21 and the Gradle wrapper (bundled — no separate install needed)
- Python 3.12+ (for running market-data-service outside Docker)
- [Ollama](https://ollama.com/download), with the `phi3:mini` model pulled:

ollama pull phi3:mini

  Ollama runs on the host machine, not inside Docker - see "Known
  Limitations" below for why.

## Quick Start (backend + database + market data, via Docker)

git clone https://github.com/Bonolo0226/openex.git
cd openex
docker compose up --build


This starts Postgres, Redis, the Kotlin backend, and the market-data-service
together, with Postgres/Redis health-checked before the backend starts.

- Backend health check: http://localhost:8080/health
- Market data health check: http://localhost:5000/health
- Market data feed: http://localhost:5000/api/market-data

## Running the frontend

The frontend runs outside Docker during development:

cd frontend
npm install
npm run dev


Open http://localhost:5173.

## Running the AI chat locally (outside Docker)

Ollama must be running on your host machine for `/api/chat` to work, even
when market-data-service itself is running inside Docker — Ollama isn't
containerized in this setup (see below). Start it with:

ollama serve


(Ollama's installer typically registers this to run automatically; if
`ollama pull phi3:mini` already worked, it's likely already running.)

## Testing

**Backend:**

cd backend
.\gradlew.bat test

Requires Postgres running (`docker compose up -d postgres`).

**Manual end-to-end flow:**
1. Register a user via the frontend login page
2. Deposit funds: `POST /api/wallets/deposit`
3. Place an order: `POST /api/orders` (with an `Idempotency-Key` header)
4. Watch the live order book update on the Trading page
5. Ask the chat widget about your balance

## Known Limitations

- **Ollama is not containerized.** Reliable GPU passthrough and model
  download timing inside Docker Compose is a meaningfully bigger undertaking
  than this capstone's scope — Ollama is intended to run on the host
  machine alongside the Dockerized services. `market-data-service`'s
  `/api/chat` endpoint calls `http://localhost:11434` (Ollama's default),
  which works because it also runs on the host in this setup.
- **Local LLM inference is slow on modest hardware.** Response times of
  several seconds are expected on machines with limited RAM; this is a
  genuine trade-off of running AI fully offline rather than via a paid
  cloud API.
- **User-to-account mapping is derived, not stored.** `userId` is computed
  as `UUID.nameUUIDFromBytes(username)` rather than looked up from the
  `users` table directly in every endpoint - functionally consistent, but
  a real production system would resolve this via a proper foreign key
  relationship.
- **No balance-sufficiency check on order placement.** A user can place an
  order that would take their balance negative; this was a deliberate
  scope decision to keep focus on the ledger/matching-engine mechanics
  the capstone emphasizes.

## Project Structure

openex/
backend/ Kotlin/Spring Boot API, ledger, matching engine
frontend/ React SPA
market-data-service/ Flask API, market data simulation, AI chat
docker-compose.yml Orchestrates postgres, redis, backend, market-data-service
