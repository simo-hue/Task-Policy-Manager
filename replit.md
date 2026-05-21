# TO Mattioli DO

A personal productivity web app in Italian for managing daily tasks and insurance policies. Frontend-only — all data lives in the browser's localStorage, so there are zero hosting/database costs.

## Run & Operate

- `pnpm --filter @workspace/gestionale run dev` — run the web app (workflow `artifacts/gestionale: web`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

No env vars required for the app itself.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + TailwindCSS + shadcn/ui
- Routing: wouter
- Forms: react-hook-form + zod
- Dates: date-fns (Italian locale)
- Persistence: browser `localStorage` (no backend)

## Where things live

- `artifacts/gestionale/` — the web app
  - `src/App.tsx` — router setup (Dashboard, Attività, Polizze)
  - `src/pages/` — page components
  - `src/components/` — shared UI (Shell/sidebar, etc.)
  - `src/hooks/use-local-storage.ts` — generic localStorage hook with cross-tab sync
  - `src/lib/tasks-store.ts` — `useTasks()` hook, key `gestionale.tasks.v1`
  - `src/lib/policies-store.ts` — `usePolicies()` hook, key `gestionale.policies.v1`
  - `src/index.css` — theme palette (HSL space-separated tokens)
- `artifacts/api-server/` — scaffold only, unused by the gestionale app

## Architecture decisions

- **No backend, no database.** Personal single-user tool — data is stored in `localStorage` to keep hosting free. The `api-server` artifact ships with the monorepo scaffold but is not wired into the app.
- **Italian-only UI.** All strings, dates, and validation messages are in Italian; date-fns uses the `it` locale.
- **Two domain entities.** `Task` (todo) and `Policy` (with `status: 'da_emettere' | 'emessa'`). Policies split visually into "In scadenza" (emessa, sorted by `expiryDate`) and "Da emettere" (sorted by `targetIssueDate`), with urgency badges based on days-to-expiry (<7 = red, 7–30 = amber).
- **Seed on first run.** Each store seeds 2–3 realistic example items so the app is never empty on first visit.

## Product

- **Dashboard (`/`)** — summary cards (attività di oggi, in ritardo, polizze in scadenza a 30gg, da emettere), "Prossime scadenze" and "Attività urgenti" shortlists.
- **Attività (`/attivita`)** — tabs "Da fare" / "Completate", add/complete/reopen/delete tasks with optional due date.
- **Polizze (`/polizze`)** — two clearly separated sections (In scadenza / Da emettere); add/edit/delete; "Segna come emessa" converts a draft policy into an issued one with an expiry date.

## User preferences

- App must remain free to maintain — no servers, no databases, no third-party paid services.
- Minimal, professional, time-saving UI — no emojis.

## Gotchas

- Data lives in the user's browser only. Clearing browser storage or switching browsers wipes everything. (Export/import is intentionally out of scope for the first build.)
- `src/index.css` uses HSL space-separated values (e.g. `--primary: 221 83% 53%`). Don't wrap with `hsl()` in the variable definition.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
