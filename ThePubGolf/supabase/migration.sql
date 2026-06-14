-- Pub Golf App — run this in Supabase SQL Editor
-- After running: enable Realtime on scores + minigame_results tables in the Supabase dashboard

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  captain_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji text not null,
  team_id uuid references teams(id) on delete set null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists players_name_unique on players (lower(name));
create index if not exists players_team_idx on players (team_id);

alter table teams
  add constraint if not exists teams_captain_fk
  foreign key (captain_id) references players(id) on delete set null;

create table if not exists stops (
  id uuid primary key default gen_random_uuid(),
  position int not null,
  pub_name text not null,
  location text not null,
  lat double precision,
  lng double precision,
  drink text not null,
  mini_game text not null,
  is_web_game boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists stops_position_unique on stops (position);

create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  stop_id uuid not null references stops(id) on delete cascade,
  sips int not null check (sips >= 1),
  penalties int not null default 0 check (penalties >= 0),
  penalty_reason text,
  updated_at timestamptz not null default now(),
  unique (team_id, stop_id)
);
create index if not exists scores_stop_idx on scores (stop_id);

create table if not exists minigame_results (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  stop_id uuid not null references stops(id) on delete cascade,
  round_times_ms int[] not null,
  avg_ms int not null,
  created_at timestamptz not null default now(),
  unique (player_id, stop_id)
);
create index if not exists minigame_stop_idx on minigame_results (stop_id);

-- RLS: enable on all tables, anon gets SELECT only
alter table teams enable row level security;
alter table players enable row level security;
alter table stops enable row level security;
alter table scores enable row level security;
alter table minigame_results enable row level security;

create policy "anon can read teams" on teams for select to anon using (true);
create policy "anon can read players" on players for select to anon using (true);
create policy "anon can read stops" on stops for select to anon using (true);
create policy "anon can read scores" on scores for select to anon using (true);
create policy "anon can read minigame_results" on minigame_results for select to anon using (true);

-- Seed: 5 sample stops (stop #3 has the web game)
insert into stops (position, pub_name, location, drink, mini_game, is_web_game) values
  (1, 'The Anchor', 'Strand, WC2N 5HZ', 'Pint of lager', 'Tallest tower of beer mats', false),
  (2, 'The George', 'Borough High St, SE1 1JA', 'Craft IPA', 'Name that tune (hum it)', false),
  (3, 'The Jolly Butchers', 'Stoke Newington, N16 0PB', 'Gin & tonic', 'Reaction race — tap the face!', true),
  (4, 'The Lamb & Flag', 'Rose St, WC2E 9EB', 'Wheat beer', 'Shot-put (toss a coaster furthest)', false),
  (5, 'The Crown', 'Clerkenwell Green, EC1R 0NA', 'Stout', 'Pub quiz lightning round', false)
on conflict do nothing;
