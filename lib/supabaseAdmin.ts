import { createClient } from '@supabase/supabase-js';

// Service-role client. Bypasses Row Level Security entirely, so it must
// NEVER be imported into a Client Component or exposed to the browser.
// Only used inside Route Handlers, after isAdmin() confirms the curator
// is logged in.
export function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.'
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
