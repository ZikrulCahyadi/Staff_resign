import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a client only if URL is provided, otherwise export null
// We pass a dummy string if missing just to prevent the module from crashing the entire React app
export const supabase = supabaseUrl && supabaseUrl !== 'url_supabase_anda' 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
