import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import LogoutButton from '@/components/LogoutButton';
import DeleteMovieButton from '@/components/DeleteMovieButton';
import type { Movie } from '@/lib/types';

export const revalidate = 0;

export default async function DashboardPage() {
  if (!isAdmin()) {
    redirect('/admin');
  }

  const supabase = getSupabaseServerClient();
  const { data: movies } = await supabase
    .from('movies')
    .select('*')
    .order('curator_score', { ascending: false });

  const list = (movies as Movie[]) || [];

  return (
    <main className="max-w-4xl mx-auto px-6 pt-12 pb-24">
      <div className="flex items-center justify-between mb-2">
        <p className="font-mono-num text-xs uppercase tracking-[0.3em] text-muted">
          Private booth
        </p>
        <LogoutButton />
      </div>
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-display italic text-4xl tracking-wide text-cream">DASHBOARD</h1>
        <Link
          href="/admin/dashboard/add"
          className="bg-amber text-ink font-mono-num uppercase tracking-wide text-sm py-2 px-4 rounded-sm hover:opacity-90 transition-opacity"
        >
          + Add movie
        </Link>
      </div>

      {list.length === 0 ? (
        <p className="text-muted">
          Nothing in the rankings yet.{' '}
          <Link href="/admin/dashboard/add" className="text-amber hover:underline">
            Add your first movie
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-2">
          {list.map((movie) => (
            <li
              key={movie.id}
              className="flex items-center gap-4 bg-surface border border-surface2 rounded-sm px-4 py-3"
            >
              <div className="relative w-10 h-14 shrink-0 bg-surface2 rounded-sm overflow-hidden">
                {movie.poster_url ? (
                  <Image
                    src={movie.poster_url}
                    alt=""
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-cream truncate">
                  {movie.title}{' '}
                  {movie.year ? (
                    <span className="text-muted font-mono-num text-sm">{movie.year}</span>
                  ) : null}
                </p>
              </div>
              <span className="font-mono-num text-amber text-sm w-10 text-right shrink-0">
                {Number(movie.curator_score).toFixed(1)}
              </span>
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href={`/admin/dashboard/edit/${movie.id}`}
                  className="text-xs font-mono-num uppercase tracking-wide text-muted hover:text-amber transition-colors"
                >
                  Edit
                </Link>
                <DeleteMovieButton movieId={movie.id} title={movie.title} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
