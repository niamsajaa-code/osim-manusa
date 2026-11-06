import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 
  import.meta.env.VITE_SUPABASE_URL || 'https://yppdnhuglvbevkuopprc.supabase.co';
const SUPABASE_ANON_KEY = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwcGRuaHVnbHZiZXZrdW9wcHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyNzI1ODEsImV4cCI6MjEwNzg0ODU4MX0.pvqs-6fxI_zGyXw7aLlKXRGmhsMI98Ye5gpsUemKouQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const SUPABASE_CONFIG = {
  url: SUPABASE_URL,
  hasKey: Boolean(SUPABASE_ANON_KEY),
};
