import { createClient } from '@supabase/supabase-js'

// Prefer build-time env; fall back to embedded defaults so GH Pages still works
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lskltntkhyoabeqsript.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxza2x0bnRraHlvYWJlcXNyaXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MzQzNTAsImV4cCI6MjA4MDUxMDM1MH0.CdI9Fc622nbs8Bl5mD06YXmFIc98uN4MxxRJu2HTHck'

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY at build time or update src/lib/supabase.js defaults for GH Pages.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)