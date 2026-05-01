from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import BacktestRequest, BacktestResponse
from engine import run_backtest
from database import init_db, save_backtest_result
import traceback

app = FastAPI(title="Quant-Track API", description="Quantitative Strategy Backtester")

import os

# Configure CORS for frontend access
origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    # Attempt to initialize tables
    init_db()

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Quant-Track API is running."}

@app.post("/backtest", response_model=BacktestResponse)
def backtest_endpoint(req: BacktestRequest):
    try:
        result = run_backtest(req)
        
        # Optionally save to database
        if req.save_metrics and req.user_id:
            save_backtest_result(
                user_id=req.user_id,
                ticker=req.ticker,
                return_pct=result["total_return"],
                sharpe_ratio=result["sharpe_ratio"]
            )
            
        return BacktestResponse(**result)
    except Exception as e:
        # Robust error handler
        error_msg = f"Error processing backtest for {req.ticker}: {str(e)}"
        print(traceback.format_exc())
        raise HTTPException(status_code=400, detail=error_msg)
