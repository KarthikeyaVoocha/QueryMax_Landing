import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Generate unique referral code
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Calculate rank based on signup position and referrals
function calculateRank(signupPosition, referralCount) {
  const baseRank = 100 + signupPosition
  const rankReduction = referralCount * 50
  return Math.max(1, baseRank - rankReduction)
}

// POST /api/create-profile - Create user profile after signup
export async function POST(request) {
  try {
    const { pathname } = new URL(request.url)
    const body = await request.json()

    if (pathname === '/api/create-profile') {
      const { userId, email, name, referredByCode } = body

      if (!userId || !email || !name) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (existingProfile) {
        return NextResponse.json({ user: existingProfile })
      }

      // Get current user count for rank calculation
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      const signupPosition = count || 0

      // Generate unique referral code
      let referralCode = generateReferralCode()
      let isUnique = false
      
      while (!isUnique) {
        const { data } = await supabase
          .from('users')
          .select('referralCode')
          .eq('referralCode', referralCode)
          .single()
        
        if (!data) {
          isUnique = true
        } else {
          referralCode = generateReferralCode()
        }
      }

      // Calculate initial rank
      const rank = calculateRank(signupPosition, 0)

      // Create user profile
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{
          id: userId,
          email,
          name,
          referralCode,
          referredByCode: referredByCode || null,
          referralCount: 0,
          rank
        }])
        .select()
        .single()

      if (insertError) {
        console.error('Error creating user profile:', insertError)
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
      }

      // If user was referred, update referrer's count and rank
      if (referredByCode) {
        const { data: referrer } = await supabase
          .from('users')
          .select('*')
          .eq('referralCode', referredByCode)
          .single()

        if (referrer) {
          const newReferralCount = (referrer.referralCount || 0) + 1
          
          // Get referrer's signup position
          const { count: referrerPosition } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .lt('createdAt', referrer.createdAt)
          
          const newRank = calculateRank(referrerPosition || 0, newReferralCount)
          
          await supabase
            .from('users')
            .update({ 
              referralCount: newReferralCount,
              rank: newRank
            })
            .eq('id', referrer.id)
        }
      }

      return NextResponse.json({ success: true, user: newUser })
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/stats - Get total user count
// GET /api/leaderboard - Get top users by rank
// GET /api/user?id=xxx - Get user details by ID
export async function GET(request) {
  try {
    const { pathname, searchParams } = new URL(request.url)

    if (pathname === '/api/stats') {
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      return NextResponse.json({ totalUsers: count || 0 })
    }

    if (pathname === '/api/leaderboard') {
      const { data, error } = await supabase
        .from('users')
        .select('name, email, referralCode, referralCount, rank')
        .order('rank', { ascending: true })
        .limit(100)

      if (error) {
        console.error('Error fetching leaderboard:', error)
        return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
      }

      return NextResponse.json({ leaderboard: data || [] })
    }

    if (pathname === '/api/user') {
      const userId = searchParams.get('id')
      
      if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error || !data) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      return NextResponse.json({ user: data })
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}