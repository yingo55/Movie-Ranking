'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { TmdbResult } from '@/lib/types';

type InitialMovie = {
  title: string;
  year: number | null;
  poster_url: string | null;
  overview: string | null;
  genres: string[] | null;
  curator_score: number;
  curator_note: string | null;
  tmdb_id?: number | null;
};

type Props = {
  mode: 'create' | 'edit';
  movieId?: string;
  initial?: InitialMovie;
};

const emptyMovie: InitialMovie = {
  title: '',
  year: null,
  poster_url: null,
  overview: '',
  genres: [],
  curator_score: 7,
  curator_note: '',
  tmdb_id: null,
};

export default function AdminMovieForm({ mode, movieId, initial }: Props) {
  const router = useRouter();
  const base = initial ?? emptyMovie;

  const [title, setTitle] = useState(base.title);
  const [year, setYear] = useState(base.year ? String(base.year) : '');
  const [posterUrl, setPosterUrl] = useState(base.poster_url || '');
  const [overview, setOverview] = useState(base.overview || '');
  const [genres, setGenres] = useState((base.genres || []).join(', '));
  const [curatorScore, setCuratorScore] = useState(base.curator_score ?? 7);
  const [curatorNote, setCuratorNote] = useState(base.curator_note || '');
  const [tmdbId, setTmdbId] = useState<number | null>(base.tmdb_id || null);

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<TmdbResult[]>([]);
  const [searchError, setSearchError] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearchError('');
    try {
      const res = await fetch(`/api/tmdb/search?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) {
        setSearchError(data.error || 'Search failed.');
        setResults([]);
      } else {
        setResults(data.results || []);
      }
    } catch {
      setSearchError('Search failed. Check your connection and try again.');
    } finally {
      setSearching(false);
    }
  }

  function applyResult(result: TmdbResult) {
    setTitle(result.title);
    setYear(result.year ? String(result.year) : '');
    setPosterUrl(result.poster_url || '');
    setOverview(result.overview);
    setGenres(result.genres.join(', '));
    setTmdbId(result.tmdb_id);
    setResults([]);
    setQuery('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError('');

    const payload = {
      title,
      year: year ? Number(year) : null,
      poster_url: posterUrl || null,
      overview,
      genres,
      curator_score: curatorScore,
      curator_note: curatorNote,
      tmdb_id: tmdbId,
    };

    const url = mode === 'create' ? '/api/movies' : `/api/movies/${movieId}`;
    const method = mode === 'create' ? 'POST' : 'PATCH';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      setSaveError(data.error || 'Something went wrong saving this entry.');
      setSaving(false);
      return;
    }

    router.push('/admin/dashboard');
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {mode === 'create' ? (
        <div className="bg-surface border border-surface2 rounded-sm p-5">
          <h2 className="font-display text-xl tracking-wide mb-3">Find it on TMDB</h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title..."
              className="flex-1 bg-surface2 border border-surface2 focus:border-amber rounded-sm px-3 py-2 text-cream outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={searching}
              className="bg-surface2 border border-surface2 hover:border-amber text-cream font-mono-num uppercase text-sm tracking-wide px-4 rounded-sm transition-colors disabled:opacity-50"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </form>
          {searchError ? <p className="text-velvet text-sm mt-2">{searchError}</p> : null}

          {results.length > 0 ? (
            <ul className="mt-4 space-y-2 max-h-80 overflow-y-auto">
              {results.map((r) => (
                <li key={r.tmdb_id}>
                  <button
                    type="button"
                    onClick={() => applyResult(r)}
                    className="w-full flex items-center gap-3 text-left bg-surface2 hover:bg-surface2/70 border border-transparent hover:border-amber/50 rounded-sm p-2 transition-colors"
                  >
                    <div className="relative w-10 h-14 shrink-0 bg-ink rounded-sm overflow-hidden">
                      {r.poster_url ? (
                        <Image src={r.poster_url} alt="" fill sizes="40px" className="object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="text-cream truncate">
                        {r.title}{' '}
                        {r.year ? <span className="text-muted font-mono-num text-xs">{r.year}</span> : null}
                      </p>
                      <p className="text-muted text-xs truncate">{r.genres.join(', ')}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="bg-surface border border-surface2 rounded-sm p-5 space-y-5">
        <h2 className="font-display text-xl tracking-wide">
          {mode === 'create' ? 'New entry' : 'Edit entry'}
        </h2>

        <div className="grid md:grid-cols-[1fr_auto] gap-5">
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-mono-num uppercase tracking-wide text-muted mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-surface2 border border-surface2 focus:border-amber rounded-sm px-3 py-2 text-cream outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono-num uppercase tracking-wide text-muted mb-1.5">
                  Year
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-surface2 border border-surface2 focus:border-amber rounded-sm px-3 py-2 text-cream outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-mono-num uppercase tracking-wide text-muted mb-1.5">
                  Genres (comma separated)
                </label>
                <input
                  type="text"
                  value={genres}
                  onChange={(e) => setGenres(e.target.value)}
                  className="w-full bg-surface2 border border-surface2 focus:border-amber rounded-sm px-3 py-2 text-cream outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono-num uppercase tracking-wide text-muted mb-1.5">
                Poster URL
              </label>
              <input
                type="text"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                className="w-full bg-surface2 border border-surface2 focus:border-amber rounded-sm px-3 py-2 text-cream outline-none transition-colors"
              />
            </div>
          </div>

          <div className="relative w-28 h-40 bg-surface2 rounded-sm overflow-hidden shrink-0 mx-auto md:mx-0">
            {posterUrl ? (
              <Image src={posterUrl} alt="" fill sizes="112px" className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted text-xs font-mono-num text-center px-2">
                No poster yet
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono-num uppercase tracking-wide text-muted mb-1.5">
            Overview
          </label>
          <textarea
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            rows={3}
            className="w-full bg-surface2 border border-surface2 focus:border-amber rounded-sm px-3 py-2 text-cream outline-none transition-colors resize-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-mono-num uppercase tracking-wide text-muted">
              Your score
            </label>
            <span className="font-mono-num text-amber text-lg">{curatorScore.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            step={0.5}
            value={curatorScore}
            onChange={(e) => setCuratorScore(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-mono-num uppercase tracking-wide text-muted mb-1.5">
            Your note (optional)
          </label>
          <textarea
            value={curatorNote}
            onChange={(e) => setCuratorNote(e.target.value)}
            rows={3}
            placeholder="Why this score? What stuck with you?"
            className="w-full bg-surface2 border border-surface2 focus:border-amber rounded-sm px-3 py-2 text-cream outline-none transition-colors resize-none"
          />
        </div>

        {saveError ? <p className="text-velvet text-sm">{saveError}</p> : null}

        <button
          type="submit"
          disabled={saving}
          className="bg-amber text-ink font-mono-num uppercase tracking-wide text-sm py-2.5 px-6 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? 'Saving...' : mode === 'create' ? 'Add to rankings' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
