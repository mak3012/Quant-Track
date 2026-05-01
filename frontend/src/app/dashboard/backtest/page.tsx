"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { createClient } from "@/utils/supabase/client"
import { saveStrategy } from "../actions"

export default function BacktestPage() {
  const [ticker, setTicker] = useState("AAPL")
  const [startDate, setStartDate] = useState("2023-01-01")
  const [endDate, setEndDate] = useState("2024-01-01")
  const [strategy, setStrategy] = useState("SMA")
  const [smaShort, setSmaShort] = useState(20)
  const [smaLong, setSmaLong] = useState(50)
  const [rsiPeriod, setRsiPeriod] = useState(14)
  const [rsiOverbought, setRsiOverbought] = useState(70)
  const [rsiOversold, setRsiOversold] = useState(30)
  const [macdFast, setMacdFast] = useState(12)
  const [macdSlow, setMacdSlow] = useState(26)
  const [macdSignal, setMacdSignal] = useState(9)
  const [bbWindow, setBbWindow] = useState(20)
  const [bbStd, setBbStd] = useState(2.0)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [saveMetrics, setSaveMetrics] = useState(false)
  const supabase = createClient()

  const runBacktest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${apiUrl}/backtest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ticker,
          start_date: startDate,
          end_date: endDate,
          strategy,
          sma_short: smaShort,
          sma_long: smaLong,
          rsi_period: rsiPeriod,
          rsi_overbought: rsiOverbought,
          rsi_oversold: rsiOversold,
          macd_fast: macdFast,
          macd_slow: macdSlow,
          macd_signal: macdSignal,
          bb_window: bbWindow,
          bb_std: bbStd,
          user_id: user?.id,
          save_metrics: saveMetrics
        })
      })
      if (!res.ok) {
        throw new Error("Failed to run backtest")
      }
      const data = await res.json()
      setResults(data)
    } catch (err) {
      console.error(err)
      alert("Error running backtest")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveStrategy = async () => {
      try {
        await saveStrategy(`${ticker} ${smaShort}/${smaLong} SMA`, 'SMA_CROSSOVER', {
          ticker,
          start_date: startDate,
          end_date: endDate,
          sma_short: smaShort,
          sma_long: smaLong
        })
        alert("Strategy saved successfully!")
      } catch (err: any) {
        alert("Error saving strategy: " + err.message)
      }
    }

    return (
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Strategy Backtester</h1>
          <p className="text-zinc-400 mt-2">Test moving average crossover strategies on historical data.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-zinc-900 border-zinc-800 col-span-1">
            <CardHeader>
              <CardTitle className="text-white">Parameters</CardTitle>
              <CardDescription className="text-zinc-400">Configure your strategy.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={runBacktest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ticker" className="text-zinc-300">Ticker Symbol</Label>
                  <Input
                    id="ticker"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start" className="text-zinc-300">Start Date</Label>
                    <Input
                      id="start"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end" className="text-zinc-300">End Date</Label>
                    <Input
                      id="end"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="strategy" className="text-zinc-300">Strategy</Label>
                  <select 
                    id="strategy"
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value)}
                    className="w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-white"
                  >
                    <option value="SMA">SMA Crossover</option>
                    <option value="RSI">RSI Mean Reversion</option>
                    <option value="MACD">MACD Trend</option>
                    <option value="BOLLINGER">Bollinger Bands</option>
                  </select>
                </div>
                
                {strategy === "SMA" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smaShort" className="text-zinc-300">SMA Short</Label>
                      <Input id="smaShort" type="number" value={smaShort} onChange={(e) => setSmaShort(Number(e.target.value))} className="bg-zinc-800 border-zinc-700 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smaLong" className="text-zinc-300">SMA Long</Label>
                      <Input id="smaLong" type="number" value={smaLong} onChange={(e) => setSmaLong(Number(e.target.value))} className="bg-zinc-800 border-zinc-700 text-white" />
                    </div>
                  </div>
                )}
                
                {strategy === "RSI" && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rsiPeriod" className="text-zinc-300">Period</Label>
                      <Input id="rsiPeriod" type="number" value={rsiPeriod} onChange={(e) => setRsiPeriod(Number(e.target.value))} className="bg-zinc-800 border-zinc-700 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rsiOverbought" className="text-zinc-300">Overbought</Label>
                      <Input id="rsiOverbought" type="number" value={rsiOverbought} onChange={(e) => setRsiOverbought(Number(e.target.value))} className="bg-zinc-800 border-zinc-700 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rsiOversold" className="text-zinc-300">Oversold</Label>
                      <Input id="rsiOversold" type="number" value={rsiOversold} onChange={(e) => setRsiOversold(Number(e.target.value))} className="bg-zinc-800 border-zinc-700 text-white" />
                    </div>
                  </div>
                )}
                
                {strategy === "MACD" && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="macdFast" className="text-zinc-300">Fast</Label>
                      <Input id="macdFast" type="number" value={macdFast} onChange={(e) => setMacdFast(Number(e.target.value))} className="bg-zinc-800 border-zinc-700 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="macdSlow" className="text-zinc-300">Slow</Label>
                      <Input id="macdSlow" type="number" value={macdSlow} onChange={(e) => setMacdSlow(Number(e.target.value))} className="bg-zinc-800 border-zinc-700 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="macdSignal" className="text-zinc-300">Signal</Label>
                      <Input id="macdSignal" type="number" value={macdSignal} onChange={(e) => setMacdSignal(Number(e.target.value))} className="bg-zinc-800 border-zinc-700 text-white" />
                    </div>
                  </div>
                )}
                
                {strategy === "BOLLINGER" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bbWindow" className="text-zinc-300">Window</Label>
                      <Input id="bbWindow" type="number" value={bbWindow} onChange={(e) => setBbWindow(Number(e.target.value))} className="bg-zinc-800 border-zinc-700 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bbStd" className="text-zinc-300">Std Dev</Label>
                      <Input id="bbStd" type="number" step="0.1" value={bbStd} onChange={(e) => setBbStd(Number(e.target.value))} className="bg-zinc-800 border-zinc-700 text-white" />
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="saveMetrics"
                    checked={saveMetrics}
                    onChange={(e) => setSaveMetrics(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-800 text-emerald-600 focus:ring-emerald-600"
                  />
                  <Label htmlFor="saveMetrics" className="text-zinc-300">Save results to history</Label>
                </div>
                <div className="flex gap-4 mt-4">
                  <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
                    {loading ? "Running..." : "Run Backtest"}
                  </Button>
                  <Button type="button" onClick={handleSaveStrategy} className="flex-1 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-white">
                    Save Strategy
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Performance</CardTitle>
              <CardDescription className="text-zinc-400">Equity curve and metrics.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-6 animate-pulse">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 bg-zinc-800 rounded-lg"></div>
                    <div className="h-24 bg-zinc-800 rounded-lg"></div>
                    <div className="h-24 bg-zinc-800 rounded-lg"></div>
                  </div>
                  <div className="h-[300px] w-full bg-zinc-800 rounded-lg mt-4"></div>
                </div>
              ) : results ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                      <p className="text-sm text-zinc-400">Total Return</p>
                      <p className={`text-2xl font-bold ${results.total_return >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {(results.total_return * 100).toFixed(2)}%
                      </p>
                    </div>
                    <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                      <p className="text-sm text-zinc-400">Sharpe Ratio</p>
                      <p className="text-2xl font-bold text-white">{results.sharpe_ratio.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                      <p className="text-sm text-zinc-400">Volatility (Ann.)</p>
                      <p className="text-2xl font-bold text-white">{(results.annualized_volatility * 100).toFixed(2)}%</p>
                    </div>
                  </div>

                  <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={results.daily_equity}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                        <XAxis
                          dataKey="date"
                          stroke="#a1a1aa"
                          tickFormatter={(val) => val.substring(5, 10)}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          domain={['auto', 'auto']}
                          stroke="#a1a1aa"
                          tickFormatter={(val) => `$${val.toLocaleString()}`}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                          itemStyle={{ color: '#10b981' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="equity"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500 bg-zinc-900/50">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p>Run a backtest to see results here.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
}
