-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query)

create extension if not exists "pgcrypto";

-- The curator's catalog and rankings
create table if not exists movies (
  id uuid primary key default gen_random_uuid(),
  tmdb_id integer,
  title text not null,
  year integer,
  poster_url text,
  overview text,
  genres text[],
  curator_score numeric(3,1) not null check (curator_score >= 0 and curator_score <= 10),
  curator_note text,
  created_at timestamptz not null default now()
);

-- Anonymous guest scores, one per movie per browser (via guest_id stored client-side)
create table if not exists guest_scores (
  id uuid primary key default gen_random_uuid(),
  movie_id uuid not null references movies(id) on delete cascade,
  guest_id text not null,
  nickname text not null check (char_length(nickname) between 1 and 30),
  score numeric(3,1) not null check (score >= 0 and score <= 10),
  comment text check (comment is null or char_length(comment) <= 280),
  created_at timestamptz not null default now(),
  unique (movie_id, guest_id)
);

create index if not exists guest_scores_movie_id_idx on guest_scores (movie_id);

-- Row Level Security: public can read everything, and can only insert/update
-- their own guest score row. Movies can only be written by the service role
-- (used server-side by the password-protected admin pages), never by visitors.
alter table movies enable row level security;
alter table guest_scores enable row level security;

drop policy if exists "public read movies" on movies;
create policy "public read movies" on movies for select using (true);

drop policy if exists "public read guest_scores" on guest_scores;
create policy "public read guest_scores" on guest_scores for select using (true);

drop policy if exists "public insert guest_scores" on guest_scores;
create policy "public insert guest_scores" on guest_scores for insert with check (true);

drop policy if exists "public update own guest_score" on guest_scores;
create policy "public update own guest_score" on guest_scores for update using (true) with check (true);
