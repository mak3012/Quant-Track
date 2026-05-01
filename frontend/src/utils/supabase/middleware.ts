import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  try {
    // 1. Create a response object to modify cookies
    let supabaseResponse = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // 2. Safely grab environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // If keys are missing, don't crash the server! Just let the user see the page (auth will fail later).
    if (!supabaseUrl || !supabaseKey) {
      console.warn("Supabase keys missing in Edge Runtime!")
      return supabaseResponse
    }

    // 3. Initialize Supabase strictly for Edge
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    })

    // 4. Ping Supabase to refresh the auth token
    await supabase.auth.getUser()

    return supabaseResponse

  } catch (error) {
    // If absolutely anything goes wrong, catch the error and let the app load anyway
    console.error("Middleware caught an error:", error)
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}