import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,       // ❌ Stop writing sessions to localStorage
      autoRefreshToken: false,     // ❌ Stop refreshing non-existent tokens
    },
  }
);
