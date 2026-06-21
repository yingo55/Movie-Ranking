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

  const sortMode: 'curator' | 'guests' = searchParams.sort === 'guests' ? 'guests' : 'curator';

  const ranked: RankedMovie[] = ((movies as Movie[]) || [])
    .map((m) => {
      const stat = statsByMovie.get(m.id);
      return {
        ...m,
        guestAvg: stat ? stat.sum / stat.count : null,
        guestCount: stat ? stat.count : 0,
      };
    })
    .sort((a, b) => {
      if (sortMode === 'guests') {
        return (b.guestAvg ?? -1) - (a.guestAvg ?? -1);
      }
      return b.curator_score - a.curator_score;
    });

  return (
    <main className="max-w-5xl mx-auto px-6">
      <header className="pt-16 pb-10 text-center">
        <h1 className="font-display italic text-5xl md:text-7xl tracking-wide text-cream">
          E&apos;s Movie Rankings
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
