import { createClient } from '@supabase/supabase-js';

// Ensure the environment variables are not undefined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key from .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
