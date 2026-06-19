import { createClient } from '@supabase/supabase-js';

// Browser client using the public anon key. Used only for the one thing
// visitors are allowed to write: their own guest score row (enforced by
// the RLS policies in supabase/schema.sql).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabaseBrowser = createClient(url, key, {
  auth: { persistSession: false },
});
