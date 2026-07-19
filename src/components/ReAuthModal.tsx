import { useState } from 'react'
import { ShieldCheck, Lock } from 'lucide-react'
import { Panel } from '../components/ui/Panel'

interface ReAuthModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (email: string, password: string) => Promise<boolean>
  title?: string
  message?: string
}

export function ReAuthModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Re-authentication required',
  message = 'This irreversible action requires you to confirm your identity.',
}: ReAuthModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const ok = await onConfirm(email.trim(), password)
      if (!ok) {
        setError('Authentication failed. Check your credentials and try again.')
        setPassword('')
      }
    } catch {
      setError('Authentication failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
      <Panel title={title} className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 text-nexus-warning">
            <Lock size={14} />
            <p className="text-xs text-nexus-textMuted">{message}</p>
          </div>

          <div>
            <label className="block text-xs text-nexus-textMuted uppercase tracking-wider mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-3 py-2 text-sm text-nexus-text placeholder:text-nexus-textMuted/50 focus:outline-none focus:border-nexus-accent/50"
              placeholder="ceo@nexusgrowth.com"
            />
          </div>

          <div>
            <label className="block text-xs text-nexus-textMuted uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-3 py-2 text-sm text-nexus-text placeholder:text-nexus-textMuted/50 focus:outline-none focus:border-nexus-accent/50"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-nexus-danger bg-nexus-danger/10 border border-nexus-danger/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary text-xs px-4 py-2 flex-1 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <ShieldCheck size={13} />
              {submitting ? 'Verifying…' : 'Confirm Identity'}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="btn-ghost text-xs px-4 py-2 flex-1 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </Panel>
    </div>
  )
}
