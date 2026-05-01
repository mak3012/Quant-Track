import { signup } from '@/app/login/actions'
import Link from 'next/link'

export default function SignupPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-sm rounded-2xl bg-zinc-900/80 backdrop-blur-xl p-8 border border-zinc-800 shadow-2xl relative z-10">
        <div className="mb-8 text-center">
          <div className="mx-auto w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 border border-emerald-500/20">
            <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-sm text-zinc-400">Join Quant-Track today</p>
        </div>
        
        {searchParams?.error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
            Error creating account. Email may be taken.
          </div>
        )}

        <form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-zinc-300">Email Address</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              className="w-full rounded-lg bg-zinc-950/50 border border-zinc-800 px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" 
              placeholder="you@example.com" 
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-zinc-300">Password</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required 
              className="w-full rounded-lg bg-zinc-950/50 border border-zinc-800 px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" 
              placeholder="••••••••"
            />
          </div>
          <div className="pt-2">
            <button formAction={signup} className="w-full rounded-lg bg-zinc-800 border border-zinc-700 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 focus:ring-4 focus:ring-zinc-700/50 transition-all shadow-lg shadow-zinc-900/20">
              Sign Up
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
