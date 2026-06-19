# The Rankings

A personal movie ranking site. You're the only curator — you add movies, rate them,
and write notes. Visitors can browse and submit their own score with a nickname,
no account required.

Stack: Next.js (App Router) + Supabase (Postgres + RLS) + Vercel. Posters and movie
info are pulled from TMDB when you add a title.

## How it's secured (read this)

There are no visitor accounts, so there's nothing to "log in" to on the public
side. Two different access levels instead:

- **Visitors** can read everything and can insert/update exactly one guest score
  row, enforced by Postgres Row Level Security policies (see `supabase/schema.sql`).
  Their "identity" is just a random id stored in their browser's `localStorage` —
  it's a convenience so a repeat visit recognizes them, not a real identity. Anyone
  could technically craft a request to overwrite another guest's score row; there's
  no way to fully prevent that without accounts, but it's a low-stakes guestbook,
  so this tradeoff was made deliberately to keep things account-free.
- **You (the curator)** manage movies through a password-protected `/admin` area.
  It checks a password against `ADMIN_PASSWORD` and sets a cookie that's verified
  on every request — no Supabase auth, no user table, just one shared password
  only you know.

Movie writes (add/edit/delete) only ever happen server-side using Supabase's
service role key, which is never sent to the browser.

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Open **SQL Editor** → **New query**, paste in the contents of
   `supabase/schema.sql`, and run it. This creates the `movies` and
   `guest_scores` tables with Row Level Security already configured.
3. Open **Project Settings → API** and copy three values you'll need next:
   - Project URL
   - `anon` `public` key
   - `service_role` key (keep this one secret)

## 2. Get a free TMDB API key

1. Create an account at [themoviedb.org](https://www.themoviedb.org/).
2. Go to **Settings → API**, request a key (the "Developer" option is free),
   and copy the **API Key (v3 auth)**.

## 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill it in:

```
NEXT_PUBLIC_SUPABASE_URL=        # Project URL from step 1
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # anon public key from step 1
SUPABASE_SERVICE_ROLE_KEY=       # service_role key from step 1 — keep secret

ADMIN_PASSWORD=                  # pick a password only you know
SESSION_SECRET=                  # any long random string, e.g. output of: openssl rand -hex 32

TMDB_API_KEY=                    # API key from step 2
```

## 4. Run it locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` for the public rankings, and
`http://localhost:3000/admin` to sign in and add your first movie.

## 5. Deploy to Vercel

1. Push this folder to a GitHub repo.
2. In [Vercel](https://vercel.com), click **Add New → Project** and import the repo.
3. In the project's **Settings → Environment Variables**, add the same six
   variables from `.env.local`.
4. Deploy. Your site will be live at the Vercel-assigned URL (or a custom domain
   you attach later).

Whenever you add or edit a movie through `/admin`, the change is read straight
from Supabase on every page load, so there's no rebuild or redeploy needed.

## Day-to-day use

- Visit `/admin`, sign in with `ADMIN_PASSWORD`.
- **Add movie**: search TMDB by title, pick the right result to auto-fill the
  poster, year, overview, and genres, then set your own score (0–10) and an
  optional note, and save.
- **Edit/Remove**: from the dashboard list, next to any title.
- Your homepage ranking is sorted by your score by default; visitors can switch
  to "Guest favorites" to sort by the audience average instead.

## Project structure

```
app/                  Pages and API routes (Next.js App Router)
  page.tsx              Homepage — ranked list
  movie/[id]/           Movie detail + guest score form
  admin/                Login + password-protected dashboard
  api/                  Route handlers (admin auth, movie CRUD, TMDB search)
components/            UI building blocks
lib/                   Supabase clients, admin auth, TMDB helpers, types
supabase/schema.sql    Database schema + Row Level Security policies
```
