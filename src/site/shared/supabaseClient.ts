import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('[SupabaseClient] Checking config:', {
  urlExists: !!supabaseUrl,
  keyExists: !!supabaseAnonKey,
  url: supabaseUrl ? 'Present' : 'Missing',
  key: supabaseAnonKey ? 'Present' : 'Missing'
})

const hasConfig = !!(supabaseUrl && supabaseAnonKey)

// Criamos um objeto que imita a interface do cliente do Supabase para evitar crashes
// quando as chaves não estão presentes.
const MockSupabaseClient = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: { message: 'No config' } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } }, error: null }),
    signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
    signOut: async () => ({ error: null }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      }),
    }),
  }),
} as any

export const supabase = hasConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : MockSupabaseClient

if (!hasConfig) {
  console.warn('⚠️ Supabase not configured. Admin functions are disabled, but the site remains functional.')
}
