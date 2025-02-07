import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database'

let supabaseClient: ReturnType<typeof createClient<Database>> | null = null

export function initSupabase(supabaseUrl: string, supabaseKey: string) {
  if (!supabaseClient) {
    supabaseClient = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false
      }
    })
  }
  return supabaseClient
}
