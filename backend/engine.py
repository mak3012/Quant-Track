import pandas as pd
import numpy as np
import yfinance as yf

from models import BacktestRequest

def run_backtest(req: BacktestRequest):
    # Fetch data
    df = yf.download(req.ticker, start=req.start_date, end=req.end_date, progress=False)
    
    if df.empty:
        raise ValueError(f"No data found for {req.ticker} between {req.start_date} and {req.end_date}")
    
    # In yfinance >= 0.2.x, closing price might be under 'Close'
    close_col = 'Close'
    if 'Adj Close' in df.columns:
        close_col = 'Adj Close'
        
    prices = df[close_col].copy()
    
    if isinstance(prices, pd.DataFrame):
        prices = prices.iloc[:, 0]
        
    strategy = req.strategy.upper()
    signals = pd.Series(0, index=prices.index)
    
    if strategy == "SMA":
        sma_s = prices.rolling(window=req.sma_short).mean()
        sma_l = prices.rolling(window=req.sma_long).mean()
        signals = (sma_s > sma_l).astype(int)
        
    elif strategy == "RSI":
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=req.rsi_period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=req.rsi_period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        # Buy if RSI < oversold, Sell if RSI > overbought. We hold if RSI is neutral, but for simplicity let's stay long if RSI < overbought, otherwise 0
        # Actually standard RSI: Buy when crosses above oversold, hold until it crosses above overbought.
        # Let's use a simpler logic: long if RSI < overbought, neutral if RSI > overbought (mean reversion style)
        signals = (rsi < req.rsi_overbought).astype(int)
        
    elif strategy == "BOLLINGER":
        sma = prices.rolling(window=req.bb_window).mean()
        std = prices.rolling(window=req.bb_window).std()
        lower_band = sma - (req.bb_std * std)
        upper_band = sma + (req.bb_std * std)
        # Long if price is below lower band (oversold), exit if above upper band.
        # Simple binary representation:
        signals = (prices < sma).astype(int) # Mean reversion: hold when below SMA
        
    elif strategy == "MACD":
        ema_fast = prices.ewm(span=req.macd_fast, adjust=False).mean()
        ema_slow = prices.ewm(span=req.macd_slow, adjust=False).mean()
        macd = ema_fast - ema_slow
        signal_line = macd.ewm(span=req.macd_signal, adjust=False).mean()
        signals = (macd > signal_line).astype(int)
        
    else:
        # Default fallback
        signals = pd.Series(1, index=prices.index) # Buy and hold
        
    # Shift by 1 to avoid lookahead bias
    signals = signals.shift(1).fillna(0)
    
    # Calculate daily returns
    daily_returns = prices.pct_change().fillna(0)
    
    # Strategy returns
    strategy_returns = signals * daily_returns
    
    # Cumulative returns
    cumulative_returns = (1 + strategy_returns).cumprod()
    
    # Calculate metrics
    risk_free_rate = 0.02
    daily_rf = risk_free_rate / 252
    
    excess_returns = strategy_returns - daily_rf
    if strategy_returns.std() > 0:
        sharpe_ratio = float(np.sqrt(252) * excess_returns.mean() / strategy_returns.std())
    else:
        sharpe_ratio = 0.0
        
    total_return = float(cumulative_returns.iloc[-1] - 1) if len(cumulative_returns) > 0 else 0.0
    annualized_volatility = float(strategy_returns.std() * np.sqrt(252))
    
    # Prepare daily equity curve
    equity_curve = (cumulative_returns * 10000).to_frame(name='equity')
    
    if equity_curve.index.name != 'Date':
        pass
    
    equity_curve.index = equity_curve.index.strftime('%Y-%m-%d')
    equity_curve.reset_index(inplace=True)
    equity_curve.rename(columns={'index': 'date', 'Date': 'date'}, inplace=True)
    
    daily_equity_list = equity_curve[['date', 'equity']].to_dict('records')
    
    return {
        "daily_equity": daily_equity_list,
        "total_return": total_return,
        "annualized_volatility": annualized_volatility,
        "sharpe_ratio": sharpe_ratio
    }
