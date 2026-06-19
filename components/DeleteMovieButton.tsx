'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteMovieButton({ movieId, title }: { movieId: string; title: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/movies/${movieId}`, { method: 'DELETE' });
    if (res.ok) {
      router.refresh();
    } else {
      setDeleting(false);
      alert('Could not remove this entry. Try again.');
    }
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-xs font-mono-num uppercase tracking-wide text-muted hover:text-velvet transition-colors"
      >
        Remove
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 text-xs font-mono-num">
      <span className="text-muted">Remove "{title}"?</span>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="text-velvet hover:opacity-80 uppercase tracking-wide"
      >
        {deleting ? 'Removing...' : 'Yes'}
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="text-muted hover:text-cream uppercase tracking-wide"
      >
        Cancel
      </button>
    </span>
  );
}
