'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, Zap, Shield, Lock, Trophy, Users, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default function LandingPage() {
  const router = useRouter()
  const [totalUsers, setTotalUsers] = useState(100)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    fetchStats()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      router.push('/dashboard')
    } else {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()
      setTotalUsers(Math.max(100, data.totalUsers))
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
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
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
            Enable AI agents to securely interact with structured data through natural language
          </p>

          {/* User Counter */}
          <div className="mt-8 mb-10 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm px-6 py-3 rounded-full border border-blue-500/30">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-lg font-semibold text-blue-300">{totalUsers}+ joined</span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => router.push('/signup')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-6 text-lg"
            >
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              onClick={() => router.push('/login')}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-6 text-lg"
            >
              Sign In
            </Button>
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

        {/* How It Works Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 border-2 border-blue-500/30 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="w-8 h-8 text-blue-400" />
              <h3 className="text-3xl font-bold text-white">How It Works</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-2xl font-bold">
                  1
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Sign Up</h4>
                <p className="text-slate-400 text-sm">Create your account and get your unique referral link</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold">
                  2
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Share & Climb</h4>
                <p className="text-slate-400 text-sm">
                  <span className="text-yellow-300 font-semibold">Each friend = +50 ranks! 🚀</span>
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Trophy className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Win Rewards</h4>
                <p className="text-slate-400 text-sm">Top 500 get 1 year FREE!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reward Tiers */}
        <Card className="max-w-4xl mx-auto bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-center text-2xl">Exclusive Launch Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {rewardTiers.map((tier, index) => (
                <div key={index} className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <div className={`text-xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent mb-1`}>
                    {tier.rank}
                  </div>
                  <div className="text-sm text-slate-300">{tier.reward}</div>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-slate-500 mt-6">
              Refer friends to climb the ranks and unlock better rewards!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}