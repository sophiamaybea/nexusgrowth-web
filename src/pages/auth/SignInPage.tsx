import { useState, FormEvent } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { Loader2, ShieldCheck } from 'lucide-react'

export default function SignInPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard'

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await signIn(email, password)
    setLoading(false)
    if (result.ok) {
      navigate(from, { replace: true })
    } else {
      setError(result.error ?? 'Sign in failed')
    }
  }

  return (
    <div className="min-h-screen bg-nexus-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="font-display font-semibold text-2xl text-nexus-text">
            Nexus<span className="text-nexus-accent">Growth</span>
          </span>
          <p className="text-nexus-textMuted text-sm mt-1">CEO Command Platform</p>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center gap-2 mb-5">
            <ShieldCheck size={15} className="text-nexus-accent" />
            <h1 className="text-nexus-text text-sm font-semibold">Secure Sign In</h1>
          </div>

          {/* Demo hint */}
          <div className="mb-4 p-3 rounded-lg border border-nexus-accent/20 bg-nexus-accent/5">
            <p className="text-[11px] text-nexus-textMuted">
              <span className="text-nexus-accent font-medium">Note — </span>
              Use credentials issued by your Supabase auth provider.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] text-nexus-textMuted uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-3 py-2.5
                           text-sm text-nexus-text placeholder:text-nexus-textMuted/50
                           focus:outline-none focus:border-nexus-accent/50 transition-colors"
                placeholder="you@nexusgrowth.io"
              />
            </div>
            <div>
              <label className="block text-[11px] text-nexus-textMuted uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-3 py-2.5
                           text-sm text-nexus-text placeholder:text-nexus-textMuted/50
                           focus:outline-none focus:border-nexus-accent/50 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-nexus-danger text-xs px-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : null}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-nexus-textMuted text-xs mt-5">
          <Link to="/" className="hover:text-nexus-text transition-colors">← Back to public site</Link>
        </p>
      </div>
    </div>
  )
}
