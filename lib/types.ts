export type Movie = {
  id: string;
  tmdb_id: number | null;
  title: string;
  year: number | null;
  poster_url: string | null;
  overview: string | null;
  genres: string[] | null;
  curator_score: number;
  curator_note: string | null;
  created_at: string;
};

export type GuestScore = {
  id: string;
  movie_id: string;
  guest_id: string;
  nickname: string;
  score: number;
  comment: string | null;
  created_at: string;
};

export type TmdbResult = {
  tmdb_id: number;
  title: string;
  year: number | null;
  poster_url: string | null;
  overview: string;
  genres: string[];
};
