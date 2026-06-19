type Props = {
  score: number;
  label: string;
  variant?: 'curator' | 'guest';
};

export default function TicketBadge({ score, label, variant = 'curator' }: Props) {
  return (
    <div
      className={`ticket-badge ${variant === 'guest' ? 'ticket-badge--guest' : ''}`}
      aria-label={`${label}: ${score.toFixed(1)} out of 10`}
    >
      <span className="ticket-badge-score">{score.toFixed(1)}</span>
      <span className="ticket-badge-label">{label}</span>
    </div>
  );
}
