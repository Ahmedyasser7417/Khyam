import { createClient } from '@supabase/supabase-js'

// IMPORTANT: Replace with actual Supabase URL and Anon Key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lmispzxczucanuhwwtny.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtaXNwenhjenVjYW51aHd3dG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NDgzOTEsImV4cCI6MjA4NzQyNDM5MX0.u5va7fAaU8dSqNoCDLtTK_AmKrwSYq4kRiGuhkpFdCg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
