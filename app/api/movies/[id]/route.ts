import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';

function parseGenres(input: unknown): string[] | null {
  if (Array.isArray(input)) {
    const cleaned = input.map((g) => String(g).trim()).filter(Boolean);
    return cleaned.length ? cleaned : null;
  }
  if (typeof input === 'string') {
    const cleaned = input
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);
    return cleaned.length ? cleaned : null;
  }
  return null;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const body = await request.json();
  const { title, year, poster_url, overview, genres, curator_score, curator_note } = body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
  }

  const score = Number(curator_score);
  if (Number.isNaN(score) || score < 0 || score > 10) {
    return NextResponse.json(
      { error: 'Your score must be a number between 0 and 10.' },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('movies')
    .update({
      title: title.trim(),
      year: year ? Number(year) : null,
      poster_url: poster_url || null,
      overview: overview || null,
      genres: parseGenres(genres),
      curator_score: score,
      curator_note: curator_note || null,
    })
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ movie: data });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from('movies').delete().eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
