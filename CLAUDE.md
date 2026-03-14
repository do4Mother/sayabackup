# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

sayabackup is a photo backup and management application built as a pnpm/Turbo monorepo with three workspaces:
- **apps/frontend** — Expo/React Native app (iOS, Android, Web) with tRPC client, React Query, Zustand
- **apps/backend** — Cloudflare Workers + tRPC server with Drizzle ORM + D1 (SQLite)
- **shared/utils** — `@sayabackup/utils` shared package (encrypt/decrypt, sanitize, random string)

## Common Commands

```bash
# Install dependencies
pnpm install

# Development
pnpm dev                          # Full stack (turbo dev)
pnpm --filter frontend dev        # Frontend only (Expo)
pnpm --filter backend dev         # Backend only (wrangler dev)

# Testing
pnpm --filter backend test        # Backend tests (vitest + cloudflare pool)

# Linting
pnpm --filter frontend lint       # Frontend lint (expo lint)

# Database migrations
pnpm --filter backend run migrate:local   # Apply D1 migrations locally
pnpm --filter backend run studio          # Open Drizzle Studio

# After changing wrangler bindings
pnpm --filter backend run cf-typegen      # Regenerate Env types

# Deploy (turbo orchestrates: utils → frontend export → backend deploy)
pnpm deploy
```

## Architecture

```
Frontend (Expo Router)  ──tRPC/HTTP──▸  Backend (CF Workers)
  ├─ React Query + AsyncStorage cache     ├─ tRPC router (auth, gallery, album)
  ├─ Zustand (session, upload state)      ├─ Drizzle ORM → Cloudflare D1
  ├─ S3 direct upload (presigned URLs)    ├─ JWT auth via encrypted cookies
  └─ Uniwind/Tailwind styling             └─ Serves frontend as static assets
```

**Authentication flow**: Google OAuth → backend issues JWT → stored in AES-encrypted HttpOnly cookie. Frontend checks auth via `client.auth.me.query()` on mount.

**Upload flow**: Client generates thumbnail → fetches S3 credentials from backend (`auth.secret`) → uploads thumbnail + full file to S3 → creates gallery record via tRPC → invalidates React Query cache.

**tRPC patterns**:
- Infinite queries with page flattening (see `app/album/[id].tsx`)
- Cache invalidation: `const utils = trpc.useUtils(); utils.gallery.get.invalidate()`
- Query persistence via AsyncStorage (30-day gcTime)

## Key Files

| What | Where |
|------|-------|
| Frontend root layout & providers | `apps/frontend/app/_layout.tsx` |
| tRPC client setup | `apps/frontend/trpc/trpc.ts` |
| Upload state & logic | `apps/frontend/hooks/use-upload.ts` |
| Session store | `apps/frontend/hooks/use-sessions.ts` |
| S3 helpers | `apps/frontend/s3/` |
| Worker entry + CORS + cookies | `apps/backend/src/index.ts` |
| tRPC context & procedures | `apps/backend/src/trpc.ts` |
| Router definitions | `apps/backend/src/routers/routers.ts` |
| DB schema | `apps/backend/src/db/schema.ts` |
| Migrations | `apps/backend/drizzle/` |
| Cloudflare config | `apps/backend/wrangler.jsonc` |
| Shared crypto/utils | `shared/utils/src/` |

## Important Conventions

- Cookie encryption uses `@sayabackup/utils` `encrypt`/`decrypt` (CryptoJS AES) — preserve this when editing cookie or auth code
- Preserve the tRPC context shape (`env`, `db`, `request`, `user`, `getCookie`, `setCookie`) when editing server code
- Frontend uses file-based routing via Expo Router — screens live in `apps/frontend/app/`
- Reuse existing components from `apps/frontend/components/` and hooks from `apps/frontend/hooks/`
- Code formatting: Biome with tab indentation, double quotes
- When adding Cloudflare Worker bindings, update `wrangler.jsonc` then run `cf-typegen`
