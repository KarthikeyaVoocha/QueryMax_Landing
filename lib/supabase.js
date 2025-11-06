import { createClient } from '@supabase/supabase-js'

// Lazy initialization to avoid build-time issues
let supabaseInstance = null

export const supabase = new Proxy({}, {
  get(target, prop) {
    if (!supabaseInstance) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (supabaseUrl && supabaseAnonKey) {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
      } else {
        // Return dummy client for build time
        return () => Promise.resolve({ data: null, error: null })
      }
    }
    return supabaseInstance[prop]
  }
})

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