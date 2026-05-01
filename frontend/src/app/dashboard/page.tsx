import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Activity, Briefcase, TrendingUp, Cpu, ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function DashboardOverview() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch real counts from the database
  let strategyCount = 0
  let tradeCount = 0

  if (user) {
    const { count: sCount } = await supabase.from('strategies').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    const { count: tCount } = await supabase.from('trades').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    strategyCount = sCount || 0
    tradeCount = tCount || 0
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            Command Center
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium border border-emerald-500/20">Live</span>
          </h1>
          <p className="text-zinc-400">Welcome back, your quantitative engine is standing by.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/backtest" className="px-4 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors border border-zinc-700">
            New Backtest
          </Link>
          <Link href="/dashboard/portfolio" className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors shadow-lg shadow-emerald-900/20 flex items-center gap-2">
            Trade Terminal <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Real Data Cards */}
        <Card className="bg-zinc-900/50 backdrop-blur-sm border-zinc-800/80 shadow-xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
            <CardTitle className="text-sm font-medium text-zinc-300">Saved Strategies</CardTitle>
            <Cpu className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-white">{strategyCount}</div>
            <p className="text-xs text-zinc-500 mt-1">Custom algorithmic models</p>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/50 backdrop-blur-sm border-zinc-800/80 shadow-xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
            <CardTitle className="text-sm font-medium text-zinc-300">Total Paper Trades</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-white">{tradeCount}</div>
            <p className="text-xs text-zinc-500 mt-1">Executed executions</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 backdrop-blur-sm border-zinc-800/80 shadow-xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
            <CardTitle className="text-sm font-medium text-zinc-300">System Status</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-white flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
              Online
            </div>
            <p className="text-xs text-zinc-500 mt-1">FastAPI Engine connected</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/30 p-8 flex flex-col items-center justify-center text-center">
        <Cpu className="h-12 w-12 text-zinc-700 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Ready to crunch numbers?</h3>
        <p className="text-zinc-400 max-w-md mx-auto mb-6">Head over to the Backtest Engine to test RSI, MACD, Bollinger Bands, and SMA crossovers against historical data.</p>
        <Link href="/dashboard/backtest" className="px-6 py-3 rounded-lg bg-white text-black font-semibold hover:bg-zinc-200 transition-colors">
          Initialize Engine
        </Link>
      </div>
    </div>
  )
}
