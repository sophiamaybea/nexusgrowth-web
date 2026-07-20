import { useEffect, useMemo, useState } from 'react'
import { Panel } from '../../components/ui/Panel'
import { Badge } from '../../components/ui/Badge'
import { TruthBadge } from '../../components/ui/TruthBadge'
import { Search, ArrowUpCircle, XCircle, RotateCcw } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import {
  getReflections,
  promoteReflection,
  killReflection,
  openReflection,
} from '../../services/reflections'
import type { Reflection } from '../../types/reports'
import { formatCurrency } from '../../lib/format'

type Category = 'all' | 'lesson' | 'issue' | 'decision'

const CAT_COLORS: Record<string, 'warning' | 'info' | 'muted'> = {
  lesson: 'info',
  issue: 'warning',
  decision: 'muted',
}

const STATE_VARIANT: Record<Reflection['state'], 'success' | 'warning' | 'muted'> = {
  promoted: 'success',
  open: 'warning',
  killed: 'muted',
}

export default function ReflectionPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<Reflection[]>([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Category>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await getReflections()
      setEntries(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reflections')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const actorName = user?.email || 'CEO'

  const filtered = useMemo(
    () =>
      entries.filter(e => {
        const matchCat = filter === 'all' || e.category === filter
        const q = query.toLowerCase()
        const matchQ =
          !q ||
          e.title.toLowerCase().includes(q) ||
          e.summary.toLowerCase().includes(q) ||
          e.dept.toLowerCase().includes(q)
        return matchCat && matchQ
      }),
    [entries, filter, query],
  )

  const promoted = entries.filter(e => e.state === 'promoted')
  const recurring = entries.filter(e => e.recurring && e.state !== 'killed')

  async function handleAction(id: string, action: 'promote' | 'kill' | 'open') {
    setBusyId(id)
    setError(null)
    try {
      if (action === 'promote') await promoteReflection(id, actorName)
      else if (action === 'kill') await killReflection(id, actorName)
      else await openReflection(id, actorName)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update reflection')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-display font-semibold text-nexus-text">Reflection / Memory</h1>

      {error && (
        <div className="p-4 rounded-lg bg-nexus-danger/10 border border-nexus-danger/30 text-nexus-danger text-xs">
          {error}
        </div>
      )}

      {/* Promoted lessons */}
      <Panel title="Promoted Lessons">
        {loading ? (
          <div className="text-nexus-textMuted text-sm py-4 text-center">Loading…</div>
        ) : promoted.length === 0 ? (
          <div className="text-nexus-textMuted text-sm py-4 text-center">No promoted lessons yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {promoted.map(e => (
              <div key={e.id} className="p-3 rounded-lg bg-nexus-accent/5 border border-nexus-accent/20">
                <p className="text-[11px] text-nexus-accent font-medium uppercase tracking-wider mb-1">{e.dept}</p>
                <p className="text-sm text-nexus-text font-medium mb-1">{e.title}</p>
                <p className="text-[11px] text-nexus-textMuted leading-relaxed">{e.summary}</p>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Recurring issues */}
      {recurring.length > 0 && (
        <Panel title="Recurring Issues">
          <div className="space-y-2">
            {recurring.map(e => (
              <div key={e.id} className="flex items-start gap-3 p-3 rounded-lg bg-nexus-surface border border-nexus-border">
                <span className="status-dot warning mt-1.5" />
                <div>
                  <p className="text-sm text-nexus-text">{e.title}</p>
                  <p className="text-[11px] text-nexus-textMuted">{e.dept} · gap-discovery</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Searchable log */}
      <Panel
        title="Reflection Log"
        titleRight={
          <div className="flex items-center gap-2">
            {(['all', 'lesson', 'issue', 'decision'] as Category[]).map(c => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`text-[11px] px-2.5 py-1 rounded-md capitalize transition-colors ${
                  filter === c
                    ? 'bg-nexus-accent/20 text-nexus-accent'
                    : 'text-nexus-textMuted hover:text-nexus-text'
                }`}
              >{c}</button>
            ))}
          </div>
        }
      >
        <div className="mb-4 relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textMuted" />
          <input
            className="w-full bg-nexus-surface border border-nexus-border rounded-lg pl-8 pr-3 py-2
                       text-sm text-nexus-text placeholder:text-nexus-textMuted/50
                       focus:outline-none focus:border-nexus-accent/50 transition-colors"
            placeholder="Search reflections, departments…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-nexus-textMuted text-sm py-8 text-center">Loading reflections…</div>
        ) : filtered.length === 0 ? (
          <div className="text-nexus-textMuted text-sm py-6 text-center">No entries match your filter.</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(e => (
              <div key={e.id} className="flex items-start gap-4 p-3 rounded-lg bg-nexus-surface border border-nexus-border">
                <div className="shrink-0 pt-0.5">
                  <Badge label={e.category} variant={CAT_COLORS[e.category]} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="text-sm text-nexus-text font-medium truncate">{e.title}</p>
                    <Badge label={e.state} variant={STATE_VARIANT[e.state]} />
                  </div>
                  <p className="text-[11px] text-nexus-textMuted leading-relaxed">{e.summary}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <p className="text-[10px] text-nexus-textMuted/60">{e.dept}</p>
                    {e.financial_impact > 0 && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] text-nexus-textMuted">
                        impact {formatCurrency(e.financial_impact)}
                        <TruthBadge tier={e.financial_verified ? 'verified' : 'partial'} showLabel={false} />
                      </span>
                    )}
                  </div>
                  {e.state !== 'killed' && (
                    <div className="flex items-center gap-2 mt-2">
                      {e.state !== 'promoted' && (
                        <button
                          disabled={busyId === e.id}
                          onClick={() => handleAction(e.id, 'promote')}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-nexus-success/15 text-nexus-success border border-nexus-success/30 hover:bg-nexus-success/25 disabled:opacity-50"
                        >
                          <ArrowUpCircle size={12} /> Promote
                        </button>
                      )}
                      <button
                        disabled={busyId === e.id}
                        onClick={() => handleAction(e.id, 'kill')}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-nexus-danger/15 text-nexus-danger border border-nexus-danger/30 hover:bg-nexus-danger/25 disabled:opacity-50"
                      >
                        <XCircle size={12} /> Kill
                      </button>
                    </div>
                  )}
                  {e.state === 'killed' && (
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        disabled={busyId === e.id}
                        onClick={() => handleAction(e.id, 'open')}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-nexus-muted/40 text-nexus-textMuted border border-nexus-border hover:text-nexus-text disabled:opacity-50"
                      >
                        <RotateCcw size={12} /> Reopen
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}
