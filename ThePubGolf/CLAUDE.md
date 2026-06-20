# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Pub golf party app — mobile-first, single-event, deployed to Vercel free tier. Full spec in `pubGolfplan.md`.

## Stack

- Next.js 15 (App Router, TypeScript)
- Tailwind CSS v4
- Supabase (PostgreSQL + Realtime via `@supabase/supabase-js` + `@supabase/ssr`)
- Recharts for stats dashboard
- Vitest (unit tests), Playwright (smoke test)

Both a Supabase MCP connector and a Vercel MCP connector are available — use them to run migrations, configure env vars, and deploy. Confirm any cost-incurring step before executing.

## Auth & Security (critical)

- **Admin auth:** shared passcode (`ADMIN_PASSCODE`) → signed httpOnly cookie (`admin=true`, HMAC-signed with `AUTH_SECRET`). All mutating API routes / server actions must verify this cookie server-side.
- **Player auth:** no passwords; `player_id` stored in signed httpOnly cookie + localStorage fallback.
- **Service role key (`SUPABASE_SERVICE_ROLE_KEY`) is server-only.** Never expose it to the client. All DB writes go through Next.js API routes or server actions using the service role.
- **Anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) is read-only.** Used client-side only for Realtime subscriptions.
- **RLS on every table:** anon role = SELECT only; no anon INSERT/UPDATE/DELETE. Service role bypasses RLS for server-side writes.
- **Mini-game exception:** reaction-time results are submitted via a server action that validates the `player_id` cookie and sanity-checks values (reaction times must be 80–10,000ms).

## Required Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_PASSCODE
AUTH_SECRET
```

## Non-Obvious Implementation Rules

### Team generation
Remainder distribution must be round-robin (e.g., 11 players + 3 teams → 4/4/3, not 4/4/3 with one team short). Admin picks number of teams at generation time (default 4).

### Reaction-time mini-game
- Add a **300–1500ms random delay** between countdown end and faces appearing — prevents anticipatory tapping.
- Face positions must be computed with **collision rejection** so faces never overlap. Faces must be ≥ 56px touch targets. Account for safe-area insets on mobile.
- Game uses `performance.now()` for timing. State machine: `idle → countdown → waiting → active → roundDone → finished`.
- Team score = average of its players' `avg_ms` (players who didn't play are excluded).
- Duplicate submission (unique constraint on `player_id + stop_id`) must return a friendly "already played" state, not an error.

### Score totalling
Total score per team = `sum(sips + penalties)` across all stops. **Lowest wins.** Penalty = +1 stroke.

### Realtime
Enable Realtime on `scores` and `minigame_results` tables in Supabase. Leaderboard must update within ~2s of a score change on another device without a page refresh.

## Design

- **Mobile-first at 375px base.** Bottom tab nav on mobile (Itinerary / Leaderboard / Play / Stats / Team).
- **Palette:** primary `#1666C4` (sky blue), dark shade `#0A4099`, accent `#F4C430` (golden yellow), background midnight navy `#070F1B`.
- Big emojis, rounded cards, large touch targets, dark-mode-friendly default, tasteful motion.
- Use the `/frontend-design` skill when building UI components.

## Free-Tier Guardrails

Single Supabase project (no branches), no edge functions, no image storage (emojis are unicode), no cron jobs. No ISR-heavy patterns, no long-running Vercel functions.

## Testing

- Vitest unit tests: team-split algorithm, score totalling, face-placement collision detection, reaction-time validation bounds.
- Playwright: one smoke test for the happy path (register → leaderboard renders).
- Keep it proportionate — this is a one-night event app.
