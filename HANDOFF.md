# HANDOFF.md — Session Continuity Log

> **Mandatory**: Every session must read this file at the start and append a new entry at the end before finishing. This keeps context alive across repo imports and cold starts.

---

## Project: ТОПливо (TOPLIVO)

A Telegram Mini App for fuel voucher management. Users buy fuel at today's price and redeem it within 90 days regardless of price hikes. Mobile-first React frontend + Express backend, PostgreSQL database, pnpm monorepo.

---

## How to Resume After a Cold Start (Repo Import)

1. **Read this file top-to-bottom** — understand what was done last session and what's pending.
2. **Check env vars** — `DATABASE_URL`, `PORT`, `INTERNAL_API_SECRET` must be set in Replit Secrets.
3. **Start workflows** — two workflows are needed:
   - API server: `pnpm --filter @workspace/api-server run dev` (port from `PORT` env var, default 5000)
   - Frontend: `pnpm --filter @workspace/toplivo run dev` (port from `PORT` env var for the artifact)
4. **Register artifacts** if not visible in the preview dropdown — use the `artifacts` skill.
5. **Pick up pending tasks** from the bottom of this file.

---

## Architecture Summary

| Layer | Package | Notes |
|---|---|---|
| Frontend | `artifacts/toplivo` | React 19, Vite, Tailwind 4, Shadcn, Framer Motion, React Leaflet, TanStack Query, Wouter |
| Backend | `artifacts/api-server` | Express 5, Node 24, Pino logging |
| Database | `lib/db` | PostgreSQL, Drizzle ORM, drizzle-kit for migrations |
| API Contract | `lib/api-spec` | OpenAPI 3.1 YAML — source of truth |
| Generated Client | `lib/api-client-react` | Orval-generated React Query hooks |
| Generated Validation | `lib/api-zod` | Orval-generated Zod schemas |
| UI Sandbox | `artifacts/mockup-sandbox` | Isolated Vite sandbox for component prototyping |

**Golden rule**: Edit `lib/api-spec/openapi.yaml` → run codegen → types flow everywhere.  
Codegen command: `pnpm --filter @workspace/api-spec run codegen`  
DB push command: `pnpm --filter @workspace/db run push`

---

## Known Issues / Incomplete Areas

- **Auth**: Telegram auth (`/users/auth`) is minimal. User identity relies on insecure `x-telegram-id` header — needs proper Telegram `initData` validation.
- **Market prices**: `getMarketPrices` uses hardcoded constants + `Math.random()` — not real data.
- **Analytics**: `getAnalyticsSummary` uses simulated aggregations.
- **Broadcast**: `/admin/broadcast` endpoint lists users but does NOT call Telegram Bot API — messages are never actually sent.
- **Admin security**: `checkAdmin` is a simple secret string comparison, not robust.

---

## Session Log

---

### Session 1 — 2025-06-27

**Status at start**: Fresh repo import. No workflows configured, no artifacts registered in Replit. Codebase fully written and functional in code.

**What was done this session**:
- Explored the full project structure and documented the architecture above.
- Created this HANDOFF.md file to ensure continuity across sessions.
- User confirmed this file is **mandatory** and must be updated every session.

**Pending / Next steps**:
- Set up Replit workflows for `api-server` and `toplivo` frontend so the app runs in preview.
- Register artifacts in `artifact.toml` so they appear in the preview dropdown.
- Verify `DATABASE_URL` and other secrets are set.
- Address known issues listed above (auth, broadcast, real market prices).

---

_Next session: append a new `### Session N — YYYY-MM-DD` block above this line._
