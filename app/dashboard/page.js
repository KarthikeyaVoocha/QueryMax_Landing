'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Users, Copy, Check, LogOut, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [copied, setCopied] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      if (!supabase) {
        router.push('/login')
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      setUser(session.user)
      await fetchUserData(session.user.id)
      await fetchLeaderboard()
      setLoading(false)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/login')
    }
  }

  const fetchUserData = async (userId) => {
    try {
      const response = await fetch(`/api/user?id=${userId}`)
      const data = await response.json()
      
      if (response.ok) {
        setUserData(data.user)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard')
      const data = await response.json()
      setLeaderboard(data.leaderboard || [])
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    }
  }

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/signup?ref=${userData.referralCode}`
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSignOut = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut()
      }
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
      router.push('/')
    }
  }

  const rewardTiers = [
    { rank: 'Top 500', reward: '1 year free', color: 'from-yellow-400 to-orange-500' },
    { rank: 'Top 1000', reward: '75% off', color: 'from-purple-400 to-pink-500' },
    { rank: 'Top 2000', reward: '50% off', color: 'from-blue-400 to-cyan-500' },
    { rank: 'Top 5000', reward: '25% off', color: 'from-green-400 to-teal-500' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">User data not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              QueryMax Dashboard
            </h1>
            <p className="text-slate-400 mt-2">Welcome back, {userData.name}!</p>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Referral Boost Banner */}
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 border border-blue-500/30 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <h3 className="text-2xl font-bold text-white">Climb the Ranks!</h3>
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <p className="text-center text-lg text-blue-200">
              <span className="font-semibold text-yellow-300">Each referral moves you up 50 ranks!</span> 
              <br />
              <span className="text-slate-300">Share your link below to unlock better rewards 🚀</span>
            </p>
          </div>

          {/* User Stats Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Your Current Rank
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  #{userData.rank}
                </div>
                <p className="text-slate-400 mt-2">Referrals: {userData.referralCount}</p>
                <p className="text-sm text-slate-500 mt-1">
                  {userData.rank <= 500 ? '🎉 You qualify for 1 year free!' : 
                   userData.rank <= 1000 ? '🎉 You qualify for 75% off!' :
                   userData.rank <= 2000 ? '🎉 You qualify for 50% off!' :
                   userData.rank <= 5000 ? '🎉 You qualify for 25% off!' :
                   `Refer ${Math.ceil((userData.rank - 500) / 50)} more to get 1 year free!`}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Your Referral Link
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-3">
                  <p className="text-sm text-slate-400 mb-2">Referral Code:</p>
                  <code className="text-2xl font-bold text-blue-400">{userData.referralCode}</code>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-slate-800 px-3 py-2 rounded text-sm text-slate-300 overflow-hidden text-ellipsis">
                    {window.location.origin}/signup?ref={userData.referralCode}
                  </code>
                  <Button onClick={copyReferralLink} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-sm text-slate-400 mt-3">Share this link to climb the leaderboard!</p>
              </CardContent>
            </Card>
          </div>

          {/* Reward Tiers */}
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm mb-12">
            <CardHeader>
              <CardTitle className="text-white">Reward Tiers</CardTitle>
              <CardDescription className="text-slate-400">Climb the ranks to unlock exclusive rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {rewardTiers.map((tier, index) => (
                  <div key={index} className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                    <div className={`text-2xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent mb-2`}>
                      {tier.rank}
                    </div>
                    <div className="text-slate-300 font-semibold">{tier.reward}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Live Leaderboard</CardTitle>
              <CardDescription className="text-slate-400">Top users by rank</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {leaderboard.slice(0, 50).map((leaderUser, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      leaderUser.email === userData.email 
                        ? 'bg-blue-900/30 border border-blue-600' 
                        : 'bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-500 text-slate-900' :
                        index === 1 ? 'bg-slate-400 text-slate-900' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {leaderUser.rank}
                      </div>
                      <div>
                        <div className="text-white font-medium">{leaderUser.name}</div>
                        <div className="text-xs text-slate-400">{leaderUser.referralCount} referrals</div>
                      </div>
                    </div>
                    {leaderUser.email === userData.email && (
                      <Badge className="bg-blue-600">You</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}