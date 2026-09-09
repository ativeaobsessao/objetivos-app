import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tplgrqgpwjljodxqwoyb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwbGdycWdwd2psam9keHF3b3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5MzEyODEsImV4cCI6MjEwNDUwNzI4MX0.IfDPEQ7cTs-tAm47ZqomGrUpJar08cyCo64loTi1Qls';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
