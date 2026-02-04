# Frontend Testing Instructions

This guide explains how to test the Next.js frontend for the Raffle / High-ticket Marketplace MVP.

## Prerequisites
- Node.js 20+
- pnpm
- Backend API running at http://localhost:3001
- Postgres running at localhost:5433

## Setup
1. Install dependencies (from workspace root):
   ```bash
   pnpm install
   ```
2. Start backend and database (see main README for details).

## Running the Frontend
1. Move into the web app directory:
   ```bash
   cd apps/web
   ```
2. Start the Next.js development server:
   ```bash
   pnpm dev
   ```
3. Open your browser and go to:
   ```
   http://localhost:3000
   ```

## Testing the Frontend
- Browse listings, create new listings (if logged in as seller), and purchase tickets (if logged in as buyer).
- Use the Dev Session widget in the header to set test alias IDs and KYC status for API requests:
  - Seller: `seller-1111-2222-3333`
  - Buyer: `buyer-aaaa-bbbb-cccc`
- Confirm API connectivity by checking for listings and submitting forms.
- If you see errors, check that the API is running and accessible at http://localhost:3001.

## Useful Commands
- Run frontend tests (if available):
  ```bash
  pnpm test
  ```
- Lint frontend code:
  ```bash
  pnpm lint
  ```

## Troubleshooting
- If you see network/API errors, ensure the backend is running and the environment variable `NEXT_PUBLIC_API_BASE_URL` is set to `http://localhost:3001`.
- For TypeScript or build errors, check your terminal output for details.

---
For more details, see the main README.md in the project root.
