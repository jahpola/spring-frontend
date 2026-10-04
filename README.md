# Product Hub frontend

React frontend for the `spring-hello` product API.

## Requirements

- Node.js 24 or newer
- Corepack
- The backend project at `../spring-hello`

The pnpm version is pinned in `package.json`.

## Install

```bash
corepack enable
pnpm install
```

## Run locally

Start the backend:

```bash
cd ../spring-hello
./gradlew bootRun
```

Then start the frontend:

```bash
pnpm dev
```

Vite proxies `/api` requests to `http://localhost:8081`, so the backend does not need a
development CORS exception. Open the URL printed by Vite, normally `http://localhost:5173`.

## Configuration

Copy `.env.example` to `.env.local` only when the API is not served through the same origin:

```dotenv
VITE_API_BASE_URL=https://api.example.com
```

Leave `VITE_API_BASE_URL` empty for local development and same-origin deployments. In production,
prefer routing `/api` to the Spring service through a reverse proxy.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the Vite development server |
| `pnpm build` | Type-check and create a production build |
| `pnpm preview` | Preview the production build |
| `pnpm typecheck` | Run TypeScript without emitting files |
| `pnpm lint` | Run Biome lint rules |
| `pnpm format` | Format files with Biome |
| `pnpm check` | Check linting, formatting, and import organization |
| `pnpm check:fix` | Apply safe Biome fixes |
| `pnpm test` | Run the test suite once |
| `pnpm test:watch` | Run tests in watch mode |

## Features

- Paginated and sortable product catalog
- Product detail view
- Create and edit forms with client and server validation
- Confirmed product deletion
- Loading, empty, network-error, and API-error states
- Responsive Material UI layout

The frontend consumes the CRUD endpoints under `/api/products`. Prices remain decimal strings at
the API boundary to avoid floating-point changes.
