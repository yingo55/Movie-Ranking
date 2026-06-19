'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseClient';
import { getGuestId } from '@/lib/guestId';

type Props = {
  movieId: string;
};

export default function GuestScoreForm({ movieId }: Props) {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [score, setScore] = useState(7);
  const [comment, setComment] = useState('');
  const [hasExisting, setHasExisting] = useState(false);
  const [status, setStatus] = useState<'loading' | 'idle' | 'saving' | 'done' | 'error'>(
    'loading'
  );
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function loadExisting() {
      const guestId = getGuestId();
      const { data } = await supabaseBrowser
        .from('guest_scores')
        .select('nickname, score, comment')
        .eq('movie_id', movieId)
        .eq('guest_id', guestId)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        setNickname(data.nickname);
        setScore(Number(data.score));
        setComment(data.comment || '');
        setHasExisting(true);
      }
      setStatus('idle');
    }
    loadExisting();
    return () => {
      cancelled = true;
    };
  }, [movieId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim()) {
      setErrorMsg('Enter a nickname so the curator knows who rated this.');
      setStatus('error');
      return;
    }

    setStatus('saving');
    setErrorMsg('');
    const guestId = getGuestId();

    const { error } = await supabaseBrowser.from('guest_scores').upsert(
      {
        movie_id: movieId,
        guest_id: guestId,
        nickname: nickname.trim().slice(0, 30),
        score,
        comment: comment.trim() ? comment.trim().slice(0, 280) : null,
      },
      { onConflict: 'movie_id,guest_id' }
    );

    if (error) {
      setStatus('error');
      setErrorMsg('Something went wrong saving your score. Try again in a moment.');
      return;
    }

    setHasExisting(true);
    setStatus('done');
    router.refresh();
  }

  if (status === 'loading') {
    return <div className="text-muted text-sm font-mono-num">Checking for your score...</div>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface border border-surface2 rounded-sm p-5 md:p-6 space-y-5"
    >
      <div>
        <h3 className="font-display text-2xl tracking-wide text-cream">
          {hasExisting ? 'Update your score' : 'Add your score'}
        </h3>
        <p className="text-sm text-muted mt-1">
          No account needed -- just a nickname. Submitting again updates your existing score.
        </p>
      </div>

      <div>
        <label htmlFor="nickname" className="block text-xs font-mono-num uppercase tracking-wide text-muted mb-1.5">
          Nickname
        </label>
        <input
          id="nickname"
          type="text"
          maxLength={30}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="e.g. Popcorn Pete"
          className="w-full bg-surface2 border border-surface2 focus:border-teal rounded-sm px-3 py-2 text-cream placeholder:text-muted/60 outline-none transition-colors"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="score" className="block text-xs font-mono-num uppercase tracking-wide text-muted">
            Your score
          </label>
          <span className="font-mono-num text-teal text-lg">{score.toFixed(1)}</span>
        </div>
        <input
          id="score"
          type="range"
          min={0}
          max={10}
          step={0.5}
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor="comment" className="block text-xs font-mono-num uppercase tracking-wide text-muted mb-1.5">
          Comment (optional)
        </label>
        <textarea
          id="comment"
          maxLength={280}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="What did you think?"
          className="w-full bg-surface2 border border-surface2 focus:border-teal rounded-sm px-3 py-2 text-cream placeholder:text-muted/60 outline-none transition-colors resize-none"
        />
      </div>

      {status === 'error' ? <p className="text-velvet text-sm">{errorMsg}</p> : null}
      {status === 'done' ? (
        <p className="text-teal text-sm">Your score is on the board. Thanks for weighing in.</p>
      ) : null}

      <button
        type="submit"
        disabled={status === 'saving'}
        className="w-full bg-amber text-ink font-mono-num uppercase tracking-wide text-sm py-2.5 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {status === 'saving' ? 'Saving...' : hasExisting ? 'Update score' : 'Submit score'}
      </button>
    </form>
  );
}
