# GitHub Copilot / AI Agent Instructions for sayabackup

Purpose: quick, actionable guidance for AI coding agents to be productive in this monorepo.

- Monorepo layout: this is a pnpm/turbo workspace. Root scripts are in `package.json` (runs `turbo dev` / `turbo run dev --filter=backend`). Use `pnpm` at the workspace root.
- Frontend: Expo / React Native app in `apps/frontend` (uses `expo`, React Query, and a TRPC client). Key entry: `apps/frontend/app` and `apps/frontend/trpc/trpc.ts`.
- Backend: Cloudflare Workers + tRPC in `apps/backend`. tRPC context and router bootstrap are in `apps/backend/src/trpc.ts` and `apps/backend/src/index.ts` which also wires Drizzle D1 via `drizzle(env.DB, ...)`.
- Shared utilities: `@sayabackup/utils` implemented in `shared/src` and relied on by both frontend and backend (e.g., `encrypt`/`decrypt` used for cookies).

Key workflows (how to run things locally)

- Install: run `pnpm install` at repo root.
- Dev (full): `pnpm dev` from repo root (runs `turbo dev`).
- Frontend dev: `pnpm --filter frontend dev` or `cd apps/frontend && pnpm dev` (uses Expo). Typical commands: `pnpm --filter frontend start`, `pnpm --filter frontend android`.
- Backend dev: `pnpm --filter backend dev` or `cd apps/backend && pnpm dev` (runs `wrangler dev`).
- Backend migrations & local DB: see `apps/backend/package.json` scripts: `migrate:local` runs `wrangler d1 migrations apply ... --local`. Use `pnpm --filter backend run cf-typegen` after changing wrangler bindings.

Important conventions & patterns

- TRPC: server defines `Context` in `apps/backend/src/trpc.ts`. The frontend uses generated TRPC hooks; common patterns:
  - Invalidate cache: `const utils = trpc.useUtils(); utils.gallery.get.invalidate()` (see usages in `apps/frontend/*`).
  - Infinite queries: frontend uses `useInfiniteQuery` pattern and flattens pages (example in `apps/frontend/app/album/[id].tsx`).
- Cookies: cookie values are encrypted with `@sayabackup/utils` `encrypt`/`decrypt`. Backend `setCookie` and `getCookie` live in `apps/backend/src/index.ts` context creation.
- Database: backend uses Drizzle ORM + Cloudflare D1. Migrations live under `apps/backend/drizzle` and snapshots in `apps/backend/drizzle/meta`.
- S3: frontend has S3 helpers under `apps/frontend/s3` (`credentials.ts`, `upload.ts`, `get_file.ts`); backend also depends on AWS SDK—check `apps/backend` when changing server-side S3 logic.

Files to inspect when changing behavior

- TRPC server/router: `apps/backend/src/routers/routers.ts` and `apps/backend/src/trpc.ts`.
- Worker bootstrap / CORS cookie handling: `apps/backend/src/index.ts`.
- Frontend screens and TRPC use: `apps/frontend/app/*` (e.g., `app/album/[id].tsx` demonstrates infinite queries and navigation), and `apps/frontend/trpc/trpc.ts`.
- Shared utils: `shared/src/*` and package entry in `utils/package.json`.

Testing & linting

- Backend tests: run `pnpm --filter backend test` (uses `vitest`).
- Frontend lint: `pnpm --filter frontend lint` (runs `expo lint`).

Notes for AI edits

- Preserve existing TRPC context shape and cookie encryption semantics when editing server code (see `apps/backend/src/trpc.ts` and `apps/backend/src/index.ts`).
- When adding server bindings, update `wrangler.jsonc` and re-run `pnpm --filter backend run cf-typegen` to refresh `Env` types.
- For frontend UI changes, prefer editing files under `apps/frontend/app` and reuse `components/*` and `hooks/*`. Use `CustomImage` and `Header` components rather than duplicating styling.

If you modify build or env-related files, mention required local steps (e.g., `pnpm install`, `pnpm dev`, re-run `cf-typegen`, or apply D1 migrations).

Questions? If anything looks missing or unclear, ask which workflow you want covered next (CI, deploy, or running the worker in a specific environment).
