import Link from 'next/link';

export default function SortToggle({ active }: { active: 'curator' | 'guests' | 'genre' }) {
  const baseClasses =
    'px-3 py-1.5 text-sm font-mono-num uppercase tracking-wide rounded-sm transition-colors';
  return (
    <div className="inline-flex gap-2 border border-surface2 rounded-sm p-1 bg-surface">
      <Link
        href="/"
        className={`${baseClasses} ${
          active === 'curator' ? 'bg-amber text-ink' : 'text-muted hover:text-cream'
        }`}
      >
        My ranking
      </Link>
      <Link
        href="/?sort=guests"
        className={`${baseClasses} ${
          active === 'guests' ? 'bg-teal text-ink' : 'text-muted hover:text-cream'
        }`}
      >
        Guest favorites
      </Link>
      <Link
        href="/?sort=genre"
        className={`${baseClasses} ${
          active === 'genre' ? 'bg-amber text-ink' : 'text-muted hover:text-cream'
        }`}
      >
        By genre
      </Link>
    </div>
  );
}
