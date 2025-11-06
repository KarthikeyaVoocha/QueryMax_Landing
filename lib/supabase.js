import { createClient } from '@supabase/supabase-js'

// Create Supabase client with safe initialization
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found')
    return null
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Initialize client
export const supabase = typeof window !== 'undefined' || process.env.NEXT_PUBLIC_SUPABASE_URL
  ? createSupabaseClient()
  : null

// Generate unique referral code
export function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Calculate rank based on signup position and referrals
export function calculateRank(signupPosition, referralCount) {
  const baseRank = 100 + signupPosition
  const rankReduction = referralCount * 50
  return Math.max(1, baseRank - rankReduction)
}

// Get current user session
export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user || null
}

// Sign out user
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}