import { getSupabaseServerClient } from '@/lib/supabaseServer';
import MovieCard from '@/components/MovieCard';
import SortToggle from '@/components/SortToggle';
import type { Movie } from '@/lib/types';

export const revalidate = 0;

type RankedMovie = Movie & { guestAvg: number | null; guestCount: number };

export default async function HomePage({
  searchParams,
}: {
  searchParams: { sort?: string };
}) {
  const supabase = getSupabaseServerClient();

  const [{ data: movies }, { data: scores }] = await Promise.all([
    supabase.from('movies').select('*'),
    supabase.from('guest_scores').select('movie_id, score'),
  ]);

  const statsByMovie = new Map<string, { sum: number; count: number }>();
  (scores || []).forEach((s) => {
    const entry = statsByMovie.get(s.movie_id) || { sum: 0, count: 0 };
    entry.sum += Number(s.score);
    entry.count += 1;
    statsByMovie.set(s.movie_id, entry);
  });

  const sortMode: 'curator' | 'guests' | 'genre' =
    searchParams.sort === 'guests'
      ? 'guests'
      : searchParams.sort === 'genre'
      ? 'genre'
      : 'curator';

  const allMovies: RankedMovie[] = ((movies as Movie[]) || []).map((m) => {
    const stat = statsByMovie.get(m.id);
    return {
      ...m,
      guestAvg: stat ? stat.sum / stat.count : null,
      guestCount: stat ? stat.count : 0,
    };
  });

  // --- Genre view ---
  if (sortMode === 'genre') {
    // Build a map of genre -> movies, sorted by curator score within each genre
    const genreMap = new Map<string, RankedMovie[]>();
    allMovies.forEach((movie) => {
      const genres = movie.genres && movie.genres.length > 0 ? movie.genres : ['Uncategorised'];
      genres.forEach((genre) => {
        const list = genreMap.get(genre) || [];
        list.push(movie);
        genreMap.set(genre, list);
      });
    });

    // Sort genres alphabetically, with Uncategorised at the end
    const sortedGenres = Array.from(genreMap.keys()).sort((a, b) => {
      if (a === 'Uncategorised') return 1;
      if (b === 'Uncategorised') return -1;
      return a.localeCompare(b);
    });

    // Sort movies within each genre by curator score descending
    sortedGenres.forEach((genre) => {
      genreMap.get(genre)!.sort((a, b) => b.curator_score - a.curator_score);
    });

    const genreSlug = (genre: string) =>
      genre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    return (
      <main className="max-w-5xl mx-auto px-6">
        <header className="pt-16 pb-10 text-center">
          <h1 className="font-display italic text-5xl md:text-7xl tracking-wide text-cream">
            Emovielist
          </h1>
          <div className="marquee-rule w-40 mx-auto my-6" />
        </header>

        <div className="flex justify-center mb-10">
          <SortToggle active="genre" />
        </div>

        {/* Quick-jump genre buttons */}
        {sortedGenres.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {sortedGenres.map((genre) => (
              <a
                key={genre}
                href={`#${genreSlug(genre)}`}
                className="px-3 py-1.5 text-xs font-mono-num uppercase tracking-wide border border-surface2 rounded-sm bg-surface text-muted hover:border-amber hover:text-amber transition-colors"
              >
                {genre} ({genreMap.get(genre)!.length})
              </a>
            ))}
          </div>
        )}

        {allMovies.length === 0 ? (
          <div className="text-center py-20 text-muted">
            <p className="font-display text-2xl tracking-wide mb-2">The booth is empty.</p>
            <p>No movies have been added to the rankings yet.</p>
          </div>
        ) : (
          <div className="space-y-14 pb-16">
            {sortedGenres.map((genre) => (
              <section key={genre} id={genreSlug(genre)}>
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="font-display italic text-3xl tracking-wide text-amber">
                    {genre}
                  </h2>
                  <div className="flex-1 h-px bg-surface2" />
                  <span className="font-mono-num text-xs text-muted uppercase tracking-wide">
                    {genreMap.get(genre)!.length} film{genreMap.get(genre)!.length === 1 ? '' : 's'}
                  </span>
                </div>
                <ol className="space-y-3">
                  {genreMap.get(genre)!.map((movie, index) => (
                    <li key={movie.id}>
                      <MovieCard
                        rank={index + 1}
                        id={movie.id}
                        title={movie.title}
                        year={movie.year}
                        posterUrl={movie.poster_url}
                        genres={movie.genres}
                        curatorScore={Number(movie.curator_score)}
                        guestAvg={movie.guestAvg}
                        guestCount={movie.guestCount}
                      />
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        )}
      </main>
    );
  }

  // --- Ranked views (My Ranking / Guest Favorites) ---
  const ranked = allMovies.sort((a, b) => {
    if (sortMode === 'guests') {
      return (b.guestAvg ?? -1) - (a.guestAvg ?? -1);
    }
    return b.curator_score - a.curator_score;
  });

  return (
    <main className="max-w-5xl mx-auto px-6">
      <header className="pt-16 pb-10 text-center">
        <h1 className="font-display italic text-5xl md:text-7xl tracking-wide text-cream">
          Emovielist
        </h1>
        <div className="marquee-rule w-40 mx-auto my-6" />
      </header>

      <div className="flex justify-center mb-10">
        <SortToggle active={sortMode} />
      </div>

      {ranked.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <p className="font-display text-2xl tracking-wide mb-2">The booth is empty.</p>
          <p>No movies have been added to the rankings yet.</p>
        </div>
      ) : (
        <ol className="space-y-3 pb-16">
          {ranked.map((movie, index) => (
            <li key={movie.id}>
              <MovieCard
                rank={index + 1}
                id={movie.id}
                title={movie.title}
                year={movie.year}
                posterUrl={movie.poster_url}
                genres={movie.genres}
                curatorScore={Number(movie.curator_score)}
                guestAvg={movie.guestAvg}
                guestCount={movie.guestCount}
              />
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
