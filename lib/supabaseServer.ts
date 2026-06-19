import { createClient } from '@supabase/supabase-js';

// Server-side reads using the public anon key. Safe to use in Server
// Components for any page a visitor can see, since RLS only allows
// public SELECT on these tables.
export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars.'
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
