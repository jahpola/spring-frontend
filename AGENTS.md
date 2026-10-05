# AGENTS.md

## Project overview

This repository contains the Product Hub frontend for the Spring Boot service in
`../spring-hello`. It is a React 19 and TypeScript single-page application built with Vite.

The application manages products through the CRUD API under `/api/products`.

## Toolchain

- Node.js 24 or newer
- pnpm, pinned by the `packageManager` field in `package.json`
- React and TypeScript
- Material UI and Emotion
- React Router
- TanStack Query
- React Hook Form and Zod
- Biome for formatting, linting, and import organization
- Vitest, React Testing Library, and MSW

Use pnpm exclusively. Do not add npm or Yarn lockfiles.

Enable the pinned package manager with:

```bash
corepack enable
pnpm install --frozen-lockfile
```

The settings in `pnpm-workspace.yaml` are intentional:

- MSW is the only dependency approved to run an install script.
- `whatwg-url` is pinned to a version compatible with pnpm's release-age policy.

Do not remove or broaden these settings without verifying a clean frozen-lockfile install.

## Common commands

```bash
pnpm dev          # Start the development server
pnpm check        # Check formatting, linting, and imports
pnpm check:fix    # Apply safe Biome fixes
pnpm typecheck    # Run TypeScript checks
pnpm test         # Run all tests once
pnpm build        # Type-check and build for production
pnpm preview      # Preview the production build
```

For normal code changes, run the smallest relevant tests while iterating. Before completing a
change, run:

```bash
pnpm check
pnpm typecheck
pnpm test
pnpm build
```

## Source layout

```text
src/
├── api/                 Shared HTTP client and API error types
├── app/                 App providers, router, theme, and query client
├── components/          Shared presentation and state components
├── features/products/   Product API, components, pages, schemas, and types
├── test/                Shared MSW server and test setup
├── main.tsx             Browser entry point
└── styles.css           Minimal global styles
```

Keep feature-specific code inside its feature directory. Put code in shared directories only when
it is genuinely reusable across features.

Use the `@/` alias for imports from `src`.

## Coding conventions

- Preserve strict TypeScript safety. Do not introduce `any`, unsafe casts, or non-null assertions
  when a guard or accurate type can express the behavior.
- Follow Biome formatting: single quotes, no required semicolons, trailing commas, and a
  100-character line width.
- Prefer named exports for application modules.
- Use Material UI components and the shared theme instead of introducing a separate styling
  system.
- Keep components focused. Move server communication into API modules and TanStack Query hooks.
- Display request failures explicitly. Do not silently replace failed responses with empty data.
- Render backend messages as text, never as HTML.
- Keep loading, empty, error, and success behavior accessible.

## Backend integration

The backend normally runs at `http://localhost:8081`. Vite proxies `/api` there during local
development. Production can set `VITE_API_BASE_URL`, but same-origin reverse proxying is preferred.

Start the backend with:

```bash
cd ../spring-hello
./gradlew bootRun
```

Important runtime contract details:

- Product endpoints are under `/api/products`.
- The list endpoint uses zero-based `page`, `size`, and Spring `sort` parameters.
- Pagination metadata is nested under the response's `page` property.
- Product prices may be returned as JSON numbers. Keep form and request prices as decimal strings
  to avoid floating-point transformations.
- `inStock` is read-only and derived by the backend from `stockQuantity`.
- Validation errors can contain `fieldErrors` and `globalErrors`.

Update frontend types and tests together when the API contract changes. Prefer verifying uncertain
contract details against the running backend or its Java DTO/controller definitions.

## MCP servers

`.mcp.json` configures project MCP servers with pinned versions:

- `playwright`: headless, isolated browser. Use it to verify UI changes against `pnpm dev` with the
  backend running: loading, empty, error, and success states, URL pagination and sorting, and
  phone-width layouts. Prefer accessibility snapshots over screenshots.
- `mui`: official Material UI documentation for the installed major version.
- `context7`: current documentation for other dependencies such as TanStack Query, React Router,
  Zod, and Vitest.

For database inspection, add a read-only Postgres server in local scope. It connects as the
`mcp_ro` role that the backend's compose setup creates (see `../spring-hello/docs/docker-setup.md`):

```bash
claude mcp add --scope local postgres -- uvx --python 3.13 --with 'mcp<2' postgres-mcp \
  --access-mode=restricted 'postgresql://mcp_ro:mcp_ro@localhost:5432/product'
```

Change data through the backend API, not the database.

## Data and form patterns

- Use the shared API client in `src/api/client.ts`.
- Centralize TanStack Query keys and query options in the feature API layer.
- Invalidate list queries after mutations and update or remove relevant detail cache entries.
- Use React Hook Form with Zod for editable forms.
- Mirror backend validation rules on the client, but always handle backend validation responses.
- Do not make `inStock` editable.

## Testing

- Place focused unit tests next to the implementation as `*.test.ts` or `*.test.tsx`.
- Use React Testing Library for user-visible behavior.
- Use MSW for HTTP integration tests; do not mock `fetch` directly.
- Reset the shared QueryClient and browser history between integration tests.
- Test meaningful loading, empty, error, validation, and successful mutation states.
- Avoid implementation-detail assertions when an accessible role, name, or visible result is
  available.

When a backend contract changes, add or update an MSW integration test that exercises the observed
response shape.

## Dependency changes

- Use `pnpm add`, `pnpm remove`, and `pnpm update`; do not hand-edit lockfile entries.
- Commit `package.json`, `pnpm-lock.yaml`, and any intentional `pnpm-workspace.yaml` changes
  together.
- Preserve pnpm's supply-chain checks. Prefer a compatible, established dependency release over
  disabling release-age verification.
- Approve dependency build scripts narrowly and only when required.

## Scope and generated files

Do not edit generated output in `dist/` or dependencies in `node_modules/`. Make changes in source
files and regenerate output through the documented commands.

Avoid unrelated refactors. Preserve URL-based pagination and sorting, responsive behavior, and the
existing error handling when modifying product pages.
