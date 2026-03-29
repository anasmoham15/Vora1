import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// FIX: Warn clearly in the console if env vars are missing, instead of
// silently crashing the whole app with a cryptic error
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Vora] Supabase environment variables are missing.\n' +
    'Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your:\n' +
    '  • .env.local file (for local development)\n' +
    '  • Vercel dashboard → Project Settings → Environment Variables (for production)'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
