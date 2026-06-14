# ⛳ Pub Golf

A mobile-first web app for running a team pub golf event. Players register, get sorted into teams, and score points across a pub crawl. Lowest score wins.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Supabase** (PostgreSQL + Realtime)
- **Tailwind CSS v4**
- **Recharts** (stats dashboard)
- **Vercel** (hosting)

---

## Setup

### 1. Clone and install

```bash
git clone <your-repo>
cd ThePubGolf
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project (free tier).
2. In the SQL editor, run the entire contents of [`supabase/migration.sql`](./supabase/migration.sql).
3. In **Table Editor → scores**, click **Realtime** and enable it. Repeat for **minigame_results**.

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role secret |
| `ADMIN_PASSCODE` | Any string you choose — shared with admin on the day |
| `AUTH_SECRET` | Random 32+ character string (e.g. `openssl rand -hex 32`) |

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel

1. Push to GitHub.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo.
3. In **Environment Variables**, add all five variables from `.env.local`.
4. Deploy. Vercel will auto-deploy on every push to `main`.

> The app fits comfortably within Vercel Hobby (free) limits — no edge functions, no image storage, no cron jobs.

---

## Running tests

```bash
# Unit tests (team splitting, score maths, face placement, reaction-time validation)
npm test

# E2E smoke tests (requires running dev server)
npm run test:e2e
```

---

## Event Day Runbook

### Before the event

1. Open the admin panel: `yoursite.com/admin` → enter the passcode.
2. Go to **Itinerary** and edit/confirm the 5 stops — pub names, locations, drinks, mini-games.
3. Make sure exactly one stop has the **GAME** badge (the reaction-time web game).

### On the day — setup phase

1. Share `yoursite.com` with all players and have everyone register (name + emoji).
2. Once all players are in, go to **Admin → Teams**.
3. Choose the number of teams and click **Shuffle & assign**. The algorithm distributes players round-robin (e.g. 11 players + 3 teams → 4/4/3).
4. Optionally rename teams, pick captains, or move players between teams.

### During the event — scoring

1. After each stop, go to **Admin → Scores**.
2. Select the stop from the dropdown.
3. Enter **sips** (strokes) and **penalties** for each team. Add a penalty reason for the Hall of Shame.
4. Hit **Save** — the leaderboard updates live on everyone's phone within ~2 seconds.

### The mini-game (reaction time)

Players tap **⚡ Play** in the bottom nav at the designated stop. The game runs entirely in-browser — 3 rounds, tap the 🫠 face as fast as possible. Results are submitted automatically and appear in the **Stats** dashboard. The admin decides if/how to convert reaction times into bonus strokes.

### End of event

1. Declare the winner from the **Leaderboard**.
2. Check the **Stats** page for the Hall of Shame, race chart, and reaction-time podium.

### Resetting for another event

Go to **Admin** and scroll to the bottom. Click **🗑️ Reset event data** — this clears all players, teams, scores, and mini-game results but keeps the itinerary intact.

---

## Project structure

```
app/
  (with-nav)/         # Player-facing pages (bottom nav)
    page.tsx          # Registration / login
    itinerary/        # Stop list
    leaderboard/      # Live leaderboard
    team/             # Your team + scorecard
    stats/            # Charts and fun stats
    play/[stopId]/    # Reaction-time mini-game
  admin/              # Admin panel (passcode-gated)
  api/                # API routes
lib/
  supabase/           # DB client + types
  auth.ts             # HMAC cookie signing
  utils/              # Team splitting, score maths, face placement
supabase/
  migration.sql       # Full schema + RLS + seed data
tests/
  *.test.ts           # Vitest unit tests
  e2e/smoke.spec.ts   # Playwright smoke test
```
