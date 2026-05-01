import { createClient } from "@/utils/supabase/server"
import { recordTrade } from "../actions"
import YahooFinance from "yahoo-finance2"
const yahooFinance = new YahooFinance()
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function PortfolioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let trades: any[] = []
  
  if (user) {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      
    if (!error && data) {
      trades = data
    }
  }

  // Calculate active positions and cost basis
  let positions: Record<string, { quantity: number, totalCost: number }> = {};
  
  // Trades are descending, we need ascending for cost basis calculation
  [...trades].reverse().forEach(trade => {
    if (!positions[trade.ticker]) {
      positions[trade.ticker] = { quantity: 0, totalCost: 0 }
    }
    const amount = Number(trade.price) * trade.quantity
    if (trade.type === 'BUY') {
      positions[trade.ticker].quantity += trade.quantity
      positions[trade.ticker].totalCost += amount
    } else {
      if (positions[trade.ticker].quantity > 0) {
        const avgCost = positions[trade.ticker].totalCost / positions[trade.ticker].quantity
        positions[trade.ticker].quantity -= trade.quantity
        positions[trade.ticker].totalCost -= avgCost * trade.quantity
      }
    }
  })

  const activePositions = Object.entries(positions).filter(([_, pos]) => pos.quantity > 0)
  
  // Fetch live prices
  const livePrices: Record<string, number> = {}
  if (activePositions.length > 0) {
    const tickers = activePositions.map(([ticker]) => ticker)
    try {
      const quotes = await yahooFinance.quote(tickers)
      const quotesArray = Array.isArray(quotes) ? quotes : [quotes]
      quotesArray.forEach((q: any) => {
        livePrices[q.symbol] = q.regularMarketPrice || 0
      })
    } catch (e) {
      console.error("Error fetching live prices", e)
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Paper Trading Portfolio</h1>
          <p className="text-zinc-400 mt-2">Manage your active positions and trade history.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="bg-zinc-900 border-zinc-800 col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-white">Record Trade</CardTitle>
            <CardDescription className="text-zinc-400">Add a paper trade to your portfolio.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={async (formData) => {
              "use server"
              const ticker = formData.get("ticker") as string
              const type = formData.get("type") as "BUY" | "SELL"
              const price = Number(formData.get("price"))
              const quantity = Number(formData.get("quantity"))
              await recordTrade(ticker, type, price, quantity)
            }} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-300">Ticker</label>
                <input name="ticker" required className="w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-white" placeholder="AAPL" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-300">Type</label>
                <select name="type" required className="w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-white">
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-300">Price</label>
                <input name="price" type="number" step="0.01" required className="w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-white" placeholder="150.00" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-300">Quantity</label>
                <input name="quantity" type="number" required className="w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-white" placeholder="10" />
              </div>
              <button type="submit" className="w-full rounded-md bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                Record Trade
              </button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Active Positions (Live PnL)</CardTitle>
            <CardDescription className="text-zinc-400">Current open positions and real-time market value.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableHead className="text-zinc-300">Ticker</TableHead>
                  <TableHead className="text-zinc-300 text-right">Shares</TableHead>
                  <TableHead className="text-zinc-300 text-right">Avg Cost</TableHead>
                  <TableHead className="text-zinc-300 text-right">Live Price</TableHead>
                  <TableHead className="text-zinc-300 text-right">Market Value</TableHead>
                  <TableHead className="text-zinc-300 text-right">PnL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activePositions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-zinc-500 py-8">
                      No active positions.
                    </TableCell>
                  </TableRow>
                ) : (
                  activePositions.map(([ticker, pos]) => {
                    const avgCost = pos.totalCost / pos.quantity
                    const livePrice = livePrices[ticker] || avgCost // Fallback if no live price
                    const marketValue = pos.quantity * livePrice
                    const pnl = marketValue - pos.totalCost
                    const pnlPct = (pnl / pos.totalCost) * 100
                    const isPositive = pnl >= 0

                    return (
                      <TableRow key={ticker} className="border-zinc-800 hover:bg-zinc-800/50">
                        <TableCell className="font-bold text-white">{ticker}</TableCell>
                        <TableCell className="text-right text-zinc-300">{pos.quantity}</TableCell>
                        <TableCell className="text-right text-zinc-300">${avgCost.toFixed(2)}</TableCell>
                        <TableCell className="text-right text-white font-medium">
                          ${livePrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-zinc-300">${marketValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell className={`text-right font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                          {isPositive ? '+' : ''}{pnl.toFixed(2)} ({isPositive ? '+' : ''}{pnlPct.toFixed(2)}%)
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 col-span-1 md:col-span-3">
        <CardHeader>
          <CardTitle className="text-white">Recent Trades</CardTitle>
          <CardDescription className="text-zinc-400">A list of your recent paper trades stored in PostgreSQL.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption className="text-zinc-500">Your recent trading activity.</TableCaption>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                <TableHead className="text-zinc-300">Date</TableHead>
                <TableHead className="text-zinc-300">Ticker</TableHead>
                <TableHead className="text-zinc-300">Type</TableHead>
                <TableHead className="text-zinc-300 text-right">Price</TableHead>
                <TableHead className="text-zinc-300 text-right">Quantity</TableHead>
                <TableHead className="text-zinc-300 text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-zinc-500 py-8">
                    No trades found. Run a backtest or add a paper trade.
                  </TableCell>
                </TableRow>
              ) : (
                trades.map((trade) => (
                  <TableRow key={trade.id} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="font-medium text-white" suppressHydrationWarning>
                      {new Date(trade.timestamp).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-white">{trade.ticker}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        trade.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {trade.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-zinc-300">${Number(trade.price).toFixed(2)}</TableCell>
                    <TableCell className="text-right text-zinc-300">{trade.quantity}</TableCell>
                    <TableCell className="text-right text-white font-medium">
                      ${(Number(trade.price) * trade.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
