import { createClient } from '@supabase/supabase-js';

// The .trim() cleans up any hidden spaces from Vercel
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
