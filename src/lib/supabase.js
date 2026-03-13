import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta?.env?.VITE_SUPABASE_URL ||
  'https://qluqophnxhrvmwklobhk.supabase.co'
// ⚠️  Replace with your actual anon/service key from Supabase Dashboard → Settings → API
const supabaseKey =
  import.meta?.env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_ZLDp_EhhCvgEKQPSaO3zwg_tnpz2ajZ'

export const supabase = createClient(supabaseUrl, supabaseKey)
