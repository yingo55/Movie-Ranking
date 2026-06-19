import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { TMDB_GENRES, tmdbPosterUrl } from '@/lib/tmdb';

export async function GET(request: Request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query')?.trim();
  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'TMDB_API_KEY is not configured on the server.' },
      { status: 500 }
    );
  }

  const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
    query
  )}&include_adult=false`;

  const res = await fetch(url);
  if (!res.ok) {
    return NextResponse.json({ error: 'TMDB search failed.' }, { status: 502 });
  }
  const data = await res.json();

  const results = (data.results || []).slice(0, 8).map((m: any) => ({
    tmdb_id: m.id,
    title: m.title,
    year: m.release_date ? Number(String(m.release_date).slice(0, 4)) : null,
    poster_url: tmdbPosterUrl(m.poster_path),
    overview: m.overview || '',
    genres: (m.genre_ids || []).map((id: number) => TMDB_GENRES[id]).filter(Boolean),
  }));

  return NextResponse.json({ results });
}
