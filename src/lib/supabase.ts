import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const demoOnly = import.meta.env.VITE_DEMO_ONLY === 'true';

function requireSupabaseSetting(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing Supabase environment variable: ${name}`);
  }
  return value;
}

export const supabase = demoOnly
  ? null
  : createClient(
    requireSupabaseSetting(supabaseUrl, 'VITE_SUPABASE_URL'),
    requireSupabaseSetting(supabaseAnonKey, 'VITE_SUPABASE_ANON_KEY'),
  );
