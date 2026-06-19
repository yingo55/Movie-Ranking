import { redirect } from 'next/navigation';
import Link from 'next/link';
import { isAdmin } from '@/lib/auth';
import AdminMovieForm from '@/components/AdminMovieForm';

export default function AddMoviePage() {
  if (!isAdmin()) {
    redirect('/admin');
  }

  return (
    <main className="max-w-3xl mx-auto px-6 pt-12 pb-24">
      <Link
        href="/admin/dashboard"
        className="inline-block font-mono-num text-xs uppercase tracking-wide text-muted hover:text-amber transition-colors mb-8"
      >
        &larr; Back to dashboard
      </Link>
      <h1 className="font-display italic text-4xl tracking-wide text-cream mb-8">ADD MOVIE</h1>
      <AdminMovieForm mode="create" />
    </main>
  );
}
