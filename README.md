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
cd infra
docker compose up -d
```

## API setup (local dev)
```bash
cd apps/api
pnpm prisma:generate
pnpm prisma:migrate
pnpm dev
```

API runs on `http://localhost:3001`.

## Web app setup
```bash
cd apps/web
pnpm dev
```

Web runs on `http://localhost:3000`.

## Dev auth mode
When `NODE_ENV=development`, API accepts dev headers:
- `X-DEV-ALIAS-ID`
- `X-DEV-KYC-VERIFIED`

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
cd apps/api
pnpm test
```

## Environment variables
- `DATABASE_URL` (API)
- `NEXT_PUBLIC_API_BASE_URL` (web, defaults to http://localhost:3001)
