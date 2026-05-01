# Quant-Track Status Report

This document outlines the current state of the **Quant-Track** project, detailing features that are fully functional, features currently in progress, and identified issues that need to be resolved.

## 🟢 Implemented and Working Perfectly

### 1. Frontend Infrastructure (Next.js 16)
- **Authentication:** Fully functional Supabase authentication (Sign Up / Log In). Sessions are securely stored in cookies using `@supabase/ssr`.
- **Protected Routes:** `proxy.ts` strictly guards the `/dashboard` routes, kicking unauthenticated users back to `/login`.
- **UI Components:** Implemented Shadcn UI with `@base-ui/react` safely. Sidebar and Dropdown navigation are fully interactive. 
- **Bug Fixes:**
  - Resolved `invalid HTML nesting` caused by `asChild` prop mismatches.
  - Eliminated the `MenuGroupRootContext` crash by correctly utilizing `<DropdownMenuGroup>`.
  - Fixed **React Hydration errors** by correctly handling `toLocaleDateString()` with `suppressHydrationWarning`.
  - Fixed TypeScript compiler errors (`Cannot find type definition file for 'node'`).

### 2. Backtesting Engine (FastAPI & Python)
- **API Connectivity:** Next.js seamlessly sends POST requests to `http://localhost:8000/backtest`. Cross-Origin (CORS) is correctly configured.
- **Data Ingestion:** The `yfinance` library successfully downloads historical market data for the requested tickers dynamically.
- **Strategy Logic:** Simple Moving Average (SMA) crossover strategy logic is active. It correctly prevents lookahead bias by shifting signals by 1 day.
- **Metrics Calculation:** Engine accurately calculates Total Return, Sharpe Ratio, Annualized Volatility, and a daily Equity Curve starting at $10,000.
- **Data Visualization:** The frontend successfully receives the `BacktestResponse` payload and renders a dynamic `Recharts` graph.

### 3. Database & Persistence (Supabase PostgreSQL)
- **Direct Database Connectivity:** 
  - FastAPI correctly connects to PostgreSQL via `psycopg2` to write historical `backtest_history` metrics.
  - Next.js uses Next Server Actions (`actions.ts`) to write directly to `strategies` and `trades`.
- **Row Level Security (RLS):** Policies are securely implemented on the `trades` table `WITH CHECK (auth.uid() = user_id)`. The frontend server actions successfully inject the authenticated `user.id` to respect this.
- **Paper Trading Portfolio:** The frontend reliably fetches and lists a user's recent paper trades from the database, rendering them in a customized UI Table.

---

## 🟡 Partially Implemented / Needs Expansion

### 1. Trading Strategy Expansion
- **Status:** Currently, only the SMA Crossover strategy is hardcoded into `engine.py`.
- **Next Steps:** Expand the parameters and logic to support RSI, Bollinger Bands, and MACD strategies.

### 2. Portfolio PnL Logic
- **Status:** The Paper Trading Portfolio lists the `BUY/SELL` history, quantity, and execution price.
- **Next Steps:** The system needs a scheduled task or live price-checker to fetch current market data and compute real-time Profit and Loss (PnL) for open positions.

### 3. Strategies RLS Policy Verification
- **Status:** We wrote the SQL commands for enabling Row Level Security on the `strategies` table, but it relies on manual execution in the Supabase Dashboard. If left unchecked, strategy insertions might fail or leak.

---

## 🔴 What Doesn't Work / Known Blockers

### 1. Network / Cross-Origin during External Access
- While `allowedDevOrigins` was added to `next.config.ts`, testing via local network IP (e.g. `172.16.x.x`) can still occasionally throw strict CORS or HMR resource blocks depending on the browser. Currently, `localhost:3000` is the most stable testing environment.

### 2. Production Deployment Configurations
- The current `.env` files hardcode `localhost:8000` for the backend URL in the Next.js `fetch` requests. When deploying to Vercel/Render, the Next.js frontend will fail to reach the backend unless a `NEXT_PUBLIC_API_URL` environment variable is integrated.

### 3. Missing Frontend "Loading" States
- If `yfinance` takes too long to fetch heavy historical data, the FastAPI endpoint may hang for several seconds. The frontend UI has basic disabled buttons, but could use skeleton loaders or a timeout handler to prevent users from thinking the app froze.

---

## ✅ System Checklist
- [x] Node.js Environment 
- [x] Python Environment (`yfinance`, `fastapi`, `pandas`, `psycopg2`)
- [x] Next.js Turbopack running flawlessly
- [x] Supabase Auth Configuration
- [x] Supabase Database Connection String (Backend)
- [x] Supabase API Keys (Frontend)
- [x] Recharts UI Rendering
- [ ] Real-time WebSocket Implementation (Optional)
- [ ] Production Environment Variables
