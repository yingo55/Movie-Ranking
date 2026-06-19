import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { isAdmin } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import AdminMovieForm from '@/components/AdminMovieForm';
import type { Movie } from '@/lib/types';

export default async function EditMoviePage({ params }: { params: { id: string } }) {
  if (!isAdmin()) {
    redirect('/admin');
  }

  const supabase = getSupabaseServerClient();
  const { data: movie } = await supabase
    .from('movies')
    .select('*')
    .eq('id', params.id)
    .single<Movie>();

  if (!movie) {
    notFound();
  }

  return (
    <main className="max-w-3xl mx-auto px-6 pt-12 pb-24">
      <Link
        href="/admin/dashboard"
        className="inline-block font-mono-num text-xs uppercase tracking-wide text-muted hover:text-amber transition-colors mb-8"
      >
        &larr; Back to dashboard
      </Link>
      <h1 className="font-display italic text-4xl tracking-wide text-cream mb-8">EDIT MOVIE</h1>
      <AdminMovieForm
        mode="edit"
        movieId={movie.id}
        initial={{
          title: movie.title,
          year: movie.year,
          poster_url: movie.poster_url,
          overview: movie.overview,
          genres: movie.genres,
          curator_score: Number(movie.curator_score),
          curator_note: movie.curator_note,
          tmdb_id: movie.tmdb_id,
        }}
      />
    </main>
  );
}
