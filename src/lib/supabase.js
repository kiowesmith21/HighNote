
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qhcwbgksoziwwvpkfyku.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoY3diZ2tzb3ppd3d2cGtmeWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0MTUyNzIsImV4cCI6MjA1OTk5MTI3Mn0.mpa35rO7oyuiuvSYS6fLhH26RN88s4DJBclvWiJDZuA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});
