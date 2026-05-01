'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveStrategy(name: string, type: string, parameters: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from('strategies')
    .insert([
      {
        user_id: user.id,
        name,
        type,
        parameters_json: parameters
      }
    ])
    .select()

  if (error) {
    console.error("Error saving strategy:", error)
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/backtest')
  return data
}

export async function recordTrade(ticker: string, type: 'BUY' | 'SELL', price: number, quantity: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from('trades')
    .insert([
      {
        user_id: user.id,
        ticker,
        type,
        price,
        quantity
      }
    ])
    .select()

  if (error) {
    console.error("Error recording trade:", error)
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/portfolio')
  return data
}
