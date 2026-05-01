import os
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL is not set")
    conn = psycopg2.connect(database_url, cursor_factory=RealDictCursor)
    return conn

def init_db():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Create backtest_history table if it doesn't exist
        # user_id can be UUID from Supabase auth.users, stored as string here
        cur.execute("""
            CREATE TABLE IF NOT EXISTS backtest_history (
                id SERIAL PRIMARY KEY,
                user_id UUID NOT NULL,
                ticker VARCHAR(20) NOT NULL,
                return_pct DECIMAL(10, 4) NOT NULL,
                sharpe_ratio DECIMAL(10, 4) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """)
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error initializing database: {e}")

def save_backtest_result(user_id: str, ticker: str, return_pct: float, sharpe_ratio: float):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO backtest_history (user_id, ticker, return_pct, sharpe_ratio)
            VALUES (%s, %s, %s, %s)
            RETURNING id;
        """, (user_id, ticker, return_pct, sharpe_ratio))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()
