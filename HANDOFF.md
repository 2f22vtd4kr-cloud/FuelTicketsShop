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

### Session 1 — 2026-06-27

**Status at start**: Fresh repo import. No workflows configured, no artifacts registered in Replit. Codebase fully written and functional in code.

**What was done**:
- Explored the full project structure and documented the architecture above.
- Created this HANDOFF.md file to ensure continuity across sessions.
- User confirmed this file is **mandatory** and must be updated every session.
- Artifacts were auto-registered by Replit: `toplivo` (web, `/`), `api-server` (api, `/api`), `mockup-sandbox` (design, `/__mockup`).

**Station seeding — key findings**:
- User provided new Kardeks xlsx: `attached_assets/Spisok_AZS_Kardeks_1782580569294.xlsx` (13,892 rows, dated 11.06.2026).
- **The new file is content-identical to the old one** (`Spisok_AZS_Kardeks_1782577646945.xlsx`) — same 11,318 fuel rows, same brands, same structure.
- Crimea entries in the xlsx are car washes/services (no Бензин/ДТ) → **0 fuel stations** from file.
- Crimea, ДНР, ЛНР, Херсонская, Запорожская stations come entirely from `EXTRA_STATIONS` in `scripts/seed_stations.py` (47 hardcoded entries).
- Updated seed script to point to new file path.
- **Seed script completed successfully on 2026-06-27** → 10,234 stations + 37,075 price rows in DB.

**Seed script details** (`scripts/seed_stations.py`):
- Source file: `attached_assets/Spisok_AZS_Kardeks_1782580569294.xlsx`
- Skips first 4 rows (headers). Filters rows where col[8] or col[9] == `+` (Бензин/ДТ).
- Maps city/region names to lat/lng via `CITY_COORDS` / `REGION_COORDS` dicts + random jitter.
- Clears all existing stations/prices/vouchers before inserting.
- Requires `openpyxl` and `psycopg2` Python packages (`pip install openpyxl psycopg2`).
- Requires `DATABASE_URL` env var.

**Workflows running (set up 2026-06-27)**:
- `API Server` — `cd /home/runner/workspace && PORT=8080 node --enable-source-maps artifacts/api-server/dist/index.mjs` (console, port 8080)
  - **IMPORTANT**: Must use this direct node command, NOT `pnpm run dev`. The pnpm dev script causes EADDRINUSE race on port 8080.
  - Pre-built binary at `artifacts/api-server/dist/index.mjs`. Rebuild with `pnpm --filter @workspace/api-server run build` if code changes.
- `artifacts/toplivo: web` — auto-managed by platform (Vite dev server, port 21641)
- `artifacts/mockup-sandbox: Component Preview Server` — auto-managed by platform

**Bug fixed 2026-06-27**:
- `artifacts/toplivo/src/pages/map.tsx` had wrong import path for MarkerCluster CSS.
  - Was: `react-leaflet-cluster/lib/assets/MarkerCluster.css`
  - Fixed to: `react-leaflet-cluster/dist/assets/MarkerCluster.css` (same for Default.css)

**Pending / Next steps**:
- All secrets set: `DATABASE_URL`, `SESSION_SECRET`, `TELEGRAM_BOT_TOKEN`, `INTERNAL_API_SECRET`, `CRYPTO_BOT_TOKEN`, `ADMIN_TELEGRAM_ID`.
- DB schema pushed + seeded — do NOT re-run seed script casually, it clears all vouchers.
- Address known issues listed above (auth, broadcast, real market prices).

---

_Next session: append a new `### Session N — YYYY-MM-DD` block above this line._
