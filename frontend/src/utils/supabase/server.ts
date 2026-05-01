import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  // 1. Force the app to look at the exact NEXT_PUBLIC keys we know exist in Vercel
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // If the keys are completely missing during build/render, don't crash, just warn.
  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase keys are missing in server.ts!")
  }

  // 2. Initialize the server-side client safely
  return createServerClient(
    supabaseUrl || '',
    supabaseKey || '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            // Next.js throws an error if you try to set cookies from a Server Component.
            // We catch it safely here because the Middleware handles the actual setting!
          }
        },
      },
    }
  )
}