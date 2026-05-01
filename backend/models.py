from pydantic import BaseModel, Field
from typing import List, Optional

class BacktestRequest(BaseModel):
    ticker: str = Field(..., example="AAPL")
    start_date: str = Field(..., example="2023-01-01")
    end_date: str = Field(..., example="2024-01-01")
    strategy: str = Field(default="SMA", example="SMA") # SMA, RSI, MACD, BOLLINGER
    
    # SMA params
    sma_short: int = Field(default=20, example=20)
    sma_long: int = Field(default=50, example=50)
    
    # RSI params
    rsi_period: int = Field(default=14, example=14)
    rsi_overbought: int = Field(default=70, example=70)
    rsi_oversold: int = Field(default=30, example=30)
    
    # MACD params
    macd_fast: int = Field(default=12, example=12)
    macd_slow: int = Field(default=26, example=26)
    macd_signal: int = Field(default=9, example=9)
    
    # Bollinger params
    bb_window: int = Field(default=20, example=20)
    bb_std: float = Field(default=2.0, example=2.0)
    
    user_id: Optional[str] = Field(default=None, description="UUID of the user from Supabase")
    save_metrics: bool = Field(default=False, description="Save result to backtest_history")

class DailyEquity(BaseModel):
    date: str
    equity: float

class BacktestResponse(BaseModel):
    daily_equity: List[DailyEquity]
    total_return: float
    annualized_volatility: float
    sharpe_ratio: float
