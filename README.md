# Raffle / High-ticket Marketplace MVP

Minimal monorepo with NestJS + Postgres backend and Next.js frontend. Payments, identity, and legal rules are **stubbed** for MVP.

## Prereqs
- Node.js 20+
- pnpm
- Docker + Docker Compose

## Install dependencies
```bash
pnpm install
```

## Start infra (Postgres + API)
```bash
# Move into infra directory to access docker-compose.yml
cd infra
# Start Postgres (on port 5433) and build/run API container
docker compose up -d
```


## API setup (local dev)
```bash
# Move into API directory for backend setup
cd apps/api
# Generate Prisma client from schema
pnpm prisma:generate
# Apply database migrations to Postgres
pnpm prisma:migrate
# Start NestJS API in development mode (watches for changes)
pnpm dev
```

API runs on `http://localhost:3001`.
Postgres runs on `localhost:5433` (user: raffle, password: raffle, db: raffle).


## Web app setup
```bash
# Move into web directory for frontend setup
cd apps/web
# Start Next.js frontend in development mode
pnpm dev
```

Web runs on `http://localhost:3000`.


## Dev auth mode
When `NODE_ENV=development`, API accepts dev headers:
- `X-DEV-ALIAS-ID` (user identity)
- `X-DEV-KYC-VERIFIED` (KYC status)

The web app provides a **Dev Session** widget in the header to store these in `localStorage` and send with API requests.

### Sample alias IDs
- Seller: `seller-1111-2222-3333`
- Buyer: `buyer-aaaa-bbbb-cccc`

## Core flows
1. **Seller**: Create draft listing → edit → activate (KYC verified required)
2. **Buyer**: Browse active listings → purchase tickets (payment is stubbed)
3. **System**: Closes listing at threshold and selects winner
4. **Audit**: All critical actions are stored in `audit_events`

## TODOs / Stubs
- Payments integration (Stripe/PSP webhooks and reconciliation)
- JWT/JWKS verification (real IdP)
- Legal/jurisdiction gating


## Tests
```bash
# Move into API directory to run backend tests
cd apps/api
# Run all tests using Jest
pnpm test
```


## Environment variables
- `DATABASE_URL` (API, e.g. postgresql://raffle:raffle@localhost:5433/raffle)
- `NEXT_PUBLIC_API_BASE_URL` (web, defaults to http://localhost:3001)
