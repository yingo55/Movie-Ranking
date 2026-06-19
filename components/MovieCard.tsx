import Link from 'next/link';
import Image from 'next/image';
import TicketBadge from './TicketBadge';

type Props = {
  rank: number;
  id: string;
  title: string;
  year: number | null;
  posterUrl: string | null;
  genres: string[] | null;
  curatorScore: number;
  guestAvg: number | null;
  guestCount: number;
};

export default function MovieCard({
  rank,
  id,
  title,
  year,
  posterUrl,
  genres,
  curatorScore,
  guestAvg,
  guestCount,
}: Props) {
  return (
    <Link
      href={`/movie/${id}`}
      className="group flex items-center gap-5 bg-surface border border-surface2 rounded-sm px-4 py-4 hover:border-amber/60 transition-colors"
    >
      <span className="rank-numeral text-4xl md:text-5xl w-12 md:w-16 shrink-0 text-right">
        {String(rank).padStart(2, '0')}
      </span>

      <div className="relative w-14 h-20 md:w-16 md:h-24 shrink-0 bg-surface2 rounded-sm overflow-hidden">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={`${title} poster`}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-xs font-mono-num">
            No art
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-serif text-lg md:text-xl text-cream truncate group-hover:text-amber transition-colors">
          {title}
          {year ? <span className="text-muted font-mono-num text-sm ml-2">{year}</span> : null}
        </h3>
        {genres && genres.length > 0 ? (
          <p className="text-xs font-mono-num text-muted uppercase tracking-wide mt-1 truncate">
            {genres.slice(0, 3).join(' / ')}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <TicketBadge score={curatorScore} label="Mine" variant="curator" />
        {guestAvg !== null ? (
          <TicketBadge score={guestAvg} label={`${guestCount} guest${guestCount === 1 ? '' : 's'}`} variant="guest" />
        ) : null}
      </div>
    </Link>
  );
}
