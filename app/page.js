'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Database, Zap, Shield, Lock, Trophy, Users, Copy, Check } from 'lucide-react'

export default function QueryMaxLanding() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [userData, setUserData] = useState(null)
  const [totalUsers, setTotalUsers] = useState(100)
  const [leaderboard, setLeaderboard] = useState([])
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  // Get referral code from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const refCode = urlParams.get('ref')
    if (refCode) {
      setReferralCode(refCode)
    }
  }, [])

  // Fetch stats and leaderboard
  useEffect(() => {
    fetchStats()
    fetchLeaderboard()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()
      setTotalUsers(Math.max(100, data.totalUsers))
    } catch (error) {
      console.error('Error fetching stats:', error)
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

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          name,
          referredByCode: referralCode || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Signup failed')
        setLoading(false)
        return
      }

      setUserData(data.user)
      setSignupSuccess(true)
      fetchStats()
      fetchLeaderboard()
    } catch (error) {
      setError('An error occurred. Please try again.')
      console.error('Signup error:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}?ref=${userData.referralCode}`
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const painPoints = [
    {
      icon: Database,
      title: 'Complex Schema Integration',
      description: 'QueryMax seamlessly maps AI agent queries to any database structure',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Zap,
      title: 'Speed',
      description: 'Sub-second query execution powered by AI-optimized pipelines',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Shield,
      title: 'Privacy',
      description: 'Localized data control ensures sensitive information never leaves your environment',
      gradient: 'from-green-500 to-teal-500'
    },
    {
      icon: Lock,
      title: 'Security',
      description: 'AI-based validation prevents malicious or unintended database commands',
      gradient: 'from-orange-500 to-red-500'
    }
  ]

  const rewardTiers = [
    { rank: 'Top 500', reward: '1 year free', color: 'from-yellow-400 to-orange-500' },
    { rank: 'Top 1000', reward: '75% off', color: 'from-purple-400 to-pink-500' },
    { rank: 'Top 2000', reward: '50% off', color: 'from-blue-400 to-cyan-500' },
    { rank: 'Top 5000', reward: '25% off', color: 'from-green-400 to-teal-500' }
  ]

  if (signupSuccess && userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 mb-6">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Welcome to QueryMax! 🎉
              </h1>
              <p className="text-xl text-slate-300">You're all set, {userData.name}!</p>
            </div>

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
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-slate-800 px-3 py-2 rounded text-sm text-slate-300 overflow-hidden text-ellipsis">
                      {window.location.origin}?ref={userData.referralCode}
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
                  {leaderboard.slice(0, 20).map((user, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        user.email === userData.email 
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
                          {user.rank}
                        </div>
                        <div>
                          <div className="text-white font-medium">{user.name}</div>
                          <div className="text-xs text-slate-400">{user.referralCount} referrals</div>
                        </div>
                      </div>
                      {user.email === userData.email && (
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-slate-700">
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600">New</Badge>
            <span className="text-sm text-slate-300">Next-generation AI-first database platform</span>
          </div>
          
          <h1 className="text-7xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
            QueryMax
          </h1>
          
          <p className="text-4xl md:text-5xl font-bold mb-6 text-slate-200">
            Data that Speaks
          </p>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Enable AI agents to securely interact with structured data through natural language
          </p>

          {/* User Counter */}
          <div className="mt-8 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm px-6 py-3 rounded-full border border-blue-500/30">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-lg font-semibold text-blue-300">{totalUsers}+ joined</span>
          </div>
        </div>

        {/* Pain Points Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-20 max-w-6xl mx-auto">
          {painPoints.map((point, index) => {
            const Icon = point.icon
            return (
              <Card key={index} className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:bg-slate-900/70 transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${point.gradient} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white text-xl">{point.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400">{point.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Signup Section */}
        <div className="max-w-xl mx-auto">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-2xl text-center">Join the Waitlist</CardTitle>
              <CardDescription className="text-slate-400 text-center">
                Sign up now to secure your spot and climb the leaderboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="Referral code (optional)"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
                {error && (
                  <div className="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded">
                    {error}
                  </div>
                )}
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 text-lg"
                >
                  {loading ? 'Signing up...' : 'Join Now'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Reward Tiers Preview */}
          <Card className="mt-8 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-center">Exclusive Launch Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {rewardTiers.map((tier, index) => (
                  <div key={index} className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                    <div className={`text-lg font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent mb-1`}>
                      {tier.rank}
                    </div>
                    <div className="text-sm text-slate-300">{tier.reward}</div>
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-slate-500 mt-4">
                Refer friends to climb the ranks and unlock better rewards!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}