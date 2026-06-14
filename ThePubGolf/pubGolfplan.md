# Pub Golf Web App — Implementation Plan

A mobile-first web app for a team pub golf event. Players register with a name + emoji, get sorted into teams, and follow a pub itinerary where the core game is finishing a drink in as few sips as possible (golf scoring: lower is better). Admins manage teams, scores, penalties, and the itinerary. One mini-game (reaction time) is playable in-browser, with the team score being the average of its players' results.

This plan is written to be executed end-to-end by Claude Code, including project setup, database, and deployment.

---

## 1. Stack & Hosting (free-tier first)

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router, TypeScript) | One deployable unit (UI + API routes), first-class Vercel support |
| Hosting | Vercel (Hobby/free tier) | Zero-cost hosting, instant deploys, env var management |
| Database | Supabase (free tier, Postgres) | Free Postgres + Realtime subscriptions for live leaderboards |
| Data access | `@supabase/supabase-js` + `@supabase/ssr` | Server-side queries from API routes / server components |
| Styling | Tailwind CSS v4 | Fast mobile-first styling, easy theming via CSS variables |
| Charts | Recharts | Lightweight, responsive dashboard plots |
| Realtime | Supabase Realtime (postgres_changes) | Live score updates on leaderboard without polling |

Both a Supabase and a Vercel MCP connector are available — use them to create the Supabase project/migrations and to configure + deploy on Vercel. Confirm any cost-incurring step before executing it; everything below must fit free tiers.

**Free-tier guardrails:** single Supabase project (no branches), no edge functions required, no image storage (emojis are unicode), no cron jobs. Vercel Hobby is sufficient — no ISR-heavy patterns, no long-running functions.

---

## 2. Auth Model (keep it deliberately simple — this is a party app)

- **Players:** No passwords. "Register" = create a player row with `name` + `emoji` (both required, name unique case-insensitively). "Log in" = pick your name from the list (or auto-restore via a `player_id` stored in a signed httpOnly cookie + localStorage fallback). If the cookie is lost, the player just re-selects their name.
- **Admins:** A single shared admin passcode stored in env var `ADMIN_PASSCODE`. Entering it on `/admin/login` sets a signed httpOnly cookie (`admin=true`, HMAC-signed with `AUTH_SECRET`). All mutating API routes verify this cookie server-side.
- **Security posture:** All writes go through Next.js API routes / server actions using the Supabase **service role key** (server-only env var). The public anon key is used client-side **only** for read subscriptions (Realtime). Enable RLS on all tables: `SELECT` allowed for anon, no anon writes. This makes "only admins can update scores" enforceable at the DB layer, not just in the UI.
- Exception: mini-game result submission is a player write — route it through a server action that validates the `player_id` cookie and sanity-checks values (reaction times between 80ms and 10,000ms) to keep cheating low-effort-proof.

---

## 3. Database Schema (Supabase migration)

```sql
create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  captain_id uuid, -- FK added after players exists
  created_at timestamptz not null default now()
);

create table players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji text not null,
  team_id uuid references teams(id) on delete set null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index players_name_unique on players (lower(name));
create index players_team_idx on players (team_id);

alter table teams
  add constraint teams_captain_fk foreign key (captain_id)
  references players(id) on delete set null;

create table stops (
  id uuid primary key default gen_random_uuid(),
  position int not null,             -- order in the route
  pub_name text not null,
  location text not null,            -- free-text address/area
  lat double precision,              -- optional, for map links
  lng double precision,
  drink text not null,               -- drink selection for this stop
  mini_game text not null,           -- name/description of the stop's mini game
  is_web_game boolean not null default false, -- true => reaction-time game
  created_at timestamptz not null default now()
);
create unique index stops_position_unique on stops (position);

create table scores (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  stop_id uuid not null references stops(id) on delete cascade,
  sips int not null check (sips >= 1),            -- golf strokes
  penalties int not null default 0 check (penalties >= 0),
  penalty_reason text,
  updated_at timestamptz not null default now(),
  unique (team_id, stop_id)
);
create index scores_stop_idx on scores (stop_id);

create table minigame_results (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  stop_id uuid not null references stops(id) on delete cascade,
  round_times_ms int[] not null,     -- 3 rounds
  avg_ms int not null,
  created_at timestamptz not null default now(),
  unique (player_id, stop_id)        -- one attempt per player per stop
);
create index minigame_stop_idx on minigame_results (stop_id);
```

- Total score per team = `sum(sips + penalties)` across stops; **lowest wins**.
- Enable RLS on all tables: anon role gets `select` only; no anon `insert/update/delete`. Service role bypasses RLS for server-side writes.
- Enable Realtime on `scores` and `minigame_results`.
- Seed a sample itinerary of 5 stops (placeholder pubs) so the app is demoable immediately; admins can edit/replace via UI.

---

## 4. Pages & Features

### Public / Player

| Route | Purpose |
|---|---|
| `/` | Landing: register (name + emoji picker) or "I'm already registered" name select |
| `/itinerary` | Ordered list of stops: pub name, location (tap → Google Maps link if lat/lng or address), drink, mini-game |
| `/leaderboard` | Live team leaderboard (Realtime): total strokes, penalties, position deltas, per-stop breakdown |
| `/team` | Your team: name, captain, members (emojis), your team's scorecard |
| `/stats` | Dashboard with plots (see §6) |
| `/play/[stopId]` | The reaction-time mini-game (only enabled for stops with `is_web_game = true`) |

### Admin (`/admin`, passcode-gated)

| Capability | Detail |
|---|---|
| Team generation | Button: shuffle all unassigned/registered players into N teams of equal size (admin picks N or team size; remainder distributed round-robin). Re-running re-shuffles with confirmation. |
| Team management | Rename teams; pick a captain from team members; drag/move players between teams |
| Score entry | Per stop: enter sips per team, add penalties with optional reason; edits allowed (upsert on `team_id+stop_id`) |
| Itinerary CRUD | Create/edit/delete/reorder stops from the UI (pub name, location, drink, mini-game, mark as web game) — this covers both "create itinerary from UI" and "override itinerary" |
| Mini-game override | Edit the `mini_game` field per stop at any time |

### Player registration rules
- Name: 2–20 chars, trimmed, unique (case-insensitive). Friendly error if taken.
- Emoji: picked from a curated grid (~60 fun emojis), required.
- After registering, player lands on `/itinerary` with a welcome toast.

---

## 5. Reaction-Time Mini-Game (bonus, but in scope)

Spec:
1. Game screen shows the **target face** ("the one we're concerned about" — pick something funny, e.g. 🫠) prominently before starting.
2. 3 rounds. Each round: a full-screen **3 → 2 → 1 countdown**, then 8–12 emoji faces appear **randomly scattered within the viewport, non-overlapping** (compute positions with collision rejection against face bounding circles; account for safe-area insets on mobile).
3. Timer starts the instant faces render. Tapping the target face stops the clock and records the round time in ms. Tapping any other face is a **no-op** (no penalty, no feedback beyond a subtle shake).
4. Add a small random delay (300–1500ms) between countdown end and faces appearing to prevent anticipatory tapping.
5. After 3 rounds: show the player their times + average, submit once to `minigame_results` (server action; reject duplicates per the unique constraint with a friendly "already played" state).
6. **Team score for the game = average of its players' `avg_ms`** (players who didn't play are simply excluded). Display per-team on the leaderboard/stats; the admin decides how it converts to strokes/penalties (out of scope to automate — keep it informational).

Implementation notes: pure client-side React state machine (idle → countdown → waiting → active → roundDone → finished), `performance.now()` for timing, faces sized ≥ 56px touch targets.

---

## 6. Stats Dashboard (`/stats`)

Build with Recharts, mobile-first (stacked cards):
- **Race for the Claret Mug:** cumulative strokes per team across stops (line chart, lower = better).
- **Per-stop bar chart:** sips + penalties stacked, grouped by team.
- **Penalty board:** total penalties per team + reasons list ("Hall of Shame").
- **Reaction-time podium:** fastest individual averages (player name + emoji) and team averages.
- **Fun stats cards:** best single-stop score, most consistent team (lowest variance), biggest comeback (position change).

All reads via server components or anon-key selects; subscribe to Realtime on `scores` for live refresh on `/leaderboard`.

---

## 7. Design / Theming

- **Mobile-first** (design at 375px, scale up to desktop). Bottom tab nav on mobile (Itinerary / Leaderboard / Play / Stats / Team).
- **Palette:** Aston Martin racing green as primary — `#00594F` (deep green) with `#00352F` dark shade and a lime/acid accent `#CEDC00` for highlights, on near-black `#0B0F0E` or off-white surfaces. Use the colours only — **no F1 branding, logos, liveries, or motorsport references**.
- Fresh, playful feel: big emojis, rounded cards, subtle motion (tasteful — no confetti spam), large touch targets, dark-mode-friendly default.
- Consult the frontend-design skill when building the UI so it doesn't look like a default Tailwind template.

---

## 8. Build Order (phases with acceptance criteria)

### Phase 1 — Foundation
- [ ] Scaffold Next.js 15 + TypeScript + Tailwind project
- [ ] Create Supabase project (via MCP), apply migration in §3, enable RLS + Realtime, seed 5 sample stops
- [ ] Env wiring: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSCODE`, `AUTH_SECRET`
- **AC:** app boots locally, itinerary page renders seeded stops from DB.

### Phase 2 — Players & Teams
- [ ] Registration + name-select login, signed player cookie
- [ ] Admin login (passcode → signed cookie), admin route guard (middleware)
- [ ] Team generation algorithm + team rename + captain selection + move players
- **AC:** Given 11 registered players and 3 teams requested, when admin generates teams, then teams are 4/4/3 and every player has a team; non-admins receive 401 on any admin API route.

### Phase 3 — Scoring & Itinerary Admin
- [ ] Score entry per team/stop (sips, penalties + reason), upsert semantics
- [ ] Itinerary CRUD with drag-to-reorder (positions stay contiguous)
- [ ] Leaderboard with Realtime updates
- **AC:** updating a score on one device reflects on another device's leaderboard within ~2s without refresh; anon Supabase client cannot insert/update any table (verified by test).

### Phase 4 — Mini-Game
- [ ] Reaction game per §5, result submission, one-attempt enforcement
- [ ] Team averages surfaced on leaderboard/stats
- **AC:** faces never overlap nor render off-screen on a 375×667 viewport; tapping non-target faces does nothing; duplicate submission returns the friendly "already played" state.

### Phase 5 — Stats, Polish, Deploy
- [ ] `/stats` dashboard per §6
- [ ] Theming pass per §7, loading/empty/error states, basic a11y (contrast, focus, touch targets)
- [ ] Deploy to Vercel (via MCP): set env vars, production deploy, verify Supabase Realtime works from the deployed URL
- [ ] README with setup, env vars, and "event day runbook" (reset data, regenerate teams)
- **AC:** production URL works end-to-end on a real phone: register → see itinerary → admin enters a score → leaderboard updates live → play mini-game → stats render.

---

## 9. Testing

- Unit tests (Vitest): team-split algorithm (sizes, remainder distribution), score totalling, non-overlapping face placement, reaction-time validation bounds.
- Integration: API route auth (admin-only writes rejected without cookie), score upsert, duplicate mini-game submission.
- One Playwright smoke test for the happy path (register → leaderboard renders).
- Keep it proportionate — this is a one-night event app, not a flight system.

## 10. Non-Goals (do not build)

- Real user accounts, OAuth, email, or password reset
- Native apps or PWA offline support
- Payments, photo uploads, chat
- Automatic conversion of mini-game times into strokes (admin applies judgement)
- Multi-event support (single event, single itinerary; a "reset all data" admin action is enough)

## 11. Open Decisions (defaults chosen — override if needed)

- Team count vs team size: admin chooses **number of teams** at generation time (default 4).
- Mini-game stop: default the web game to stop #3 in the seed data.
- Penalty unit: 1 penalty = +1 stroke (kept as a separate column so the Hall of Shame works).
