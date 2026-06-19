import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import TicketBadge from '@/components/TicketBadge';
import GuestScoreForm from '@/components/GuestScoreForm';
import type { Movie, GuestScore } from '@/lib/types';

export const revalidate = 0;

export default async function MoviePage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient();

  const { data: movie } = await supabase
    .from('movies')
    .select('*')
    .eq('id', params.id)
    .single<Movie>();

  if (!movie) {
    notFound();
  }

  const { data: guestScoresData } = await supabase
    .from('guest_scores')
    .select('*')
    .eq('movie_id', params.id)
    .order('created_at', { ascending: false });

  const guestScores = (guestScoresData as GuestScore[]) || [];
  const guestAvg = guestScores.length
    ? guestScores.reduce((sum, g) => sum + Number(g.score), 0) / guestScores.length
    : null;

  return (
    <main className="max-w-4xl mx-auto px-6 pt-12 pb-24">
      <Link
        href="/"
        className="inline-block font-mono-num text-xs uppercase tracking-wide text-muted hover:text-amber transition-colors mb-8"
      >
        &larr; Back to the rankings
      </Link>

      <div className="grid md:grid-cols-[200px_1fr] gap-8">
        <div className="relative w-full aspect-[2/3] bg-surface2 rounded-sm overflow-hidden">
          {movie.poster_url ? (
            <Image
              src={movie.poster_url}
              alt={`${movie.title} poster`}
              fill
              sizes="200px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted text-sm font-mono-num">
              No artwork
            </div>
          )}
        </div>

        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-cream">
            {movie.title}{' '}
            {movie.year ? <span className="text-muted font-mono-num text-xl">{movie.year}</span> : null}
          </h1>

          {movie.genres && movie.genres.length > 0 ? (
            <p className="font-mono-num text-xs uppercase tracking-wide text-muted mt-2">
              {movie.genres.join(' / ')}
            </p>
          ) : null}

          <div className="flex gap-3 mt-5">
            <TicketBadge score={Number(movie.curator_score)} label="My score" variant="curator" />
            {guestAvg !== null ? (
              <TicketBadge
                score={guestAvg}
                label={`${guestScores.length} guest${guestScores.length === 1 ? '' : 's'}`}
                variant="guest"
              />
            ) : null}
          </div>

          {movie.overview ? (
            <p className="text-cream/80 leading-relaxed mt-6">{movie.overview}</p>
          ) : null}

          {movie.curator_note ? (
            <div className="mt-6 border-l-2 border-amber pl-4">
              <p className="font-mono-num text-xs uppercase tracking-wide text-amber mb-1.5">
                Curator's note
              </p>
              <p className="text-cream/90 leading-relaxed italic">{movie.curator_note}</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-14">
        <GuestScoreForm movieId={movie.id} />

        <div>
          <h2 className="font-display text-2xl tracking-wide text-cream mb-4">
            Guest scores {guestScores.length > 0 ? `(${guestScores.length})` : ''}
          </h2>
          {guestScores.length === 0 ? (
            <p className="text-muted">No one has scored this one yet. Be the first.</p>
          ) : (
            <ul className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
              {guestScores.map((g) => (
                <li
                  key={g.id}
                  className="bg-surface border border-surface2 rounded-sm p-3 flex gap-3 items-start"
                >
                  <span className="font-mono-num text-teal text-lg shrink-0 w-12">
                    {Number(g.score).toFixed(1)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-cream font-medium truncate">{g.nickname}</p>
                    {g.comment ? (
                      <p className="text-muted text-sm mt-0.5 break-words">{g.comment}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
