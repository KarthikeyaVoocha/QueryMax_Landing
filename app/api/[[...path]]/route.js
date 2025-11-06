import { NextResponse } from 'next/server'
import { supabase, generateReferralCode, calculateRank } from '../../../lib/supabase.js'

// POST /api/signup - Create new user with referral code
export async function POST(request) {
  try {
    const { pathname } = new URL(request.url)
    const body = await request.json()

    if (pathname === '/api/signup') {
      const { email, name, referredByCode } = body

      if (!email || !name) {
        return NextResponse.json({ error: 'Email and name are required' }, { status: 400 })
      }

      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (existingUser) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
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

      // Create user
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
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
        console.error('Error creating user:', insertError)
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
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

      return NextResponse.json({ 
        success: true, 
        user: newUser,
        referralLink: `${process.env.NEXT_PUBLIC_BASE_URL}?ref=${referralCode}`
      })
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/stats - Get total user count
// GET /api/leaderboard - Get top users by rank
// GET /api/user?email=xxx - Get user details
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
        .limit(50)

      if (error) {
        console.error('Error fetching leaderboard:', error)
        return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
      }

      return NextResponse.json({ leaderboard: data || [] })
    }

    if (pathname === '/api/user') {
      const email = searchParams.get('email')
      
      if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 })
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
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