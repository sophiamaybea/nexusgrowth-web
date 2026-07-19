import { useEffect, useMemo, useState } from 'react'
import { Panel } from '../../components/ui/Panel'
import { Badge } from '../../components/ui/Badge'
import { TruthBadge } from '../../components/ui/TruthBadge'
import { ChevronRight } from 'lucide-react'
import { getReports, updateReportStatus, reportSourceLabel } from '../../services/reports'
import type { Report, ReportPriority, ReportStatus, ReportSource } from '../../types/reports'

function formatCurrency(value: number): string {
  const formatted = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(value))
  return `£${formatted}`
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  const days = Math.round(hrs / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

const PRIORITY_VARIANT: Record<ReportPriority, 'warning' | 'info' | 'muted'> = {
  high: 'warning', medium: 'info', low: 'muted',
}

const STATUS_VARIANT: Record<ReportStatus, 'warning' | 'info' | 'muted'> = {
  unread: 'warning', read: 'muted', actioned: 'info',
}

const SOURCES: (ReportSource | 'all')[] = ['all', 'reflection_leader', 'teacher_agent', 'rd_daily']

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [selected, setSelected] = useState<Report | null>(null)
  const [sourceFilter, setSourceFilter] = useState<ReportSource | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await getReports()
        setReports(data)
        setSelected(data[0] ?? null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reports')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(
    () => reports.filter(r => sourceFilter === 'all' || r.source === sourceFilter),
    [reports, sourceFilter],
  )

  const unreadCount = reports.filter(r => r.status === 'unread').length

  async function markActioned(r: Report) {
    setBusy(true)
    setError(null)
    try {
      const updated = await updateReportStatus(r.id, 'actioned')
      setReports(prev => prev.map(x => (x.id === r.id ? updated : x)))
      setSelected(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update report')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-display font-semibold text-nexus-text">Reports Inbox</h1>

      {error && (
        <div className="p-4 rounded-lg bg-nexus-danger/10 border border-nexus-danger/30 text-nexus-danger text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Table */}
        <div className="xl:col-span-3">
          <Panel
            title={`${unreadCount} unread reports`}
            titleRight={
              <div className="flex gap-1 flex-wrap">
                {SOURCES.map(s => (
                  <button
                    key={s}
                    onClick={() => setSourceFilter(s)}
                    className={`text-[11px] px-2 py-1 rounded-md transition-colors ${
                      sourceFilter === s
                        ? 'bg-nexus-accent/20 text-nexus-accent'
                        : 'text-nexus-textMuted hover:text-nexus-text'
                    }`}
                  >{s === 'all' ? 'All' : reportSourceLabel(s)}</button>
                ))}
              </div>
            }
          >
            {loading ? (
              <div className="text-nexus-textMuted text-sm py-8 text-center">Loading reports…</div>
            ) : filtered.length === 0 ? (
              <div className="text-nexus-textMuted text-sm py-8 text-center">No reports in this inbox.</div>
            ) : (
              <div className="space-y-2">
                {filtered.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      selected?.id === r.id
                        ? 'bg-nexus-accent/10 border-nexus-accent/30'
                        : 'bg-nexus-surface border-nexus-border hover:border-nexus-textMuted/30'
                    }`}
                  >
                    {r.status === 'unread' && (
                      <span className="w-1.5 h-1.5 bg-nexus-accent rounded-full shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className={`text-sm truncate ${
                          r.status === 'unread' ? 'text-nexus-text font-medium' : 'text-nexus-textMuted'
                        }`}>{r.title}</p>
                        <span className="text-[11px] text-nexus-textMuted/60 shrink-0">{relativeTime(r.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-nexus-accent">{reportSourceLabel(r.source)}</span>
                        <span className="text-[11px] text-nexus-textMuted">· {r.dept}</span>
                        <Badge label={r.priority} variant={PRIORITY_VARIANT[r.priority]} />
                        <Badge label={r.status} variant={STATUS_VARIANT[r.status]} />
                        {r.financial_summary && <TruthBadge tier={r.financial_summary.verified ? 'verified' : 'partial'} />}
                      </div>
                    </div>
                    <ChevronRight size={13} className="text-nexus-textMuted shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </Panel>
        </div>

        {/* Detail panel */}
        <div className="xl:col-span-2">
          <Panel title={selected ? 'Report Detail' : 'Select a report'}>
            {!selected ? (
              <p className="text-nexus-textMuted text-sm text-center py-8">Select a report from the inbox to preview.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Title</p>
                  <p className="text-nexus-text font-medium">{selected.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">From</p>
                    <p className="text-sm text-nexus-text">{selected.author}</p>
                  </div>
                  <div>
                    <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Source</p>
                    <p className="text-sm text-nexus-text">{reportSourceLabel(selected.source)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Dept</p>
                    <p className="text-sm text-nexus-text">{selected.dept}</p>
                  </div>
                  <div>
                    <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Received</p>
                    <p className="text-sm text-nexus-text">{relativeTime(selected.created_at)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-2">Body</p>
                  <p className="text-sm text-nexus-text leading-relaxed">{selected.body}</p>
                </div>
                {selected.financial_summary && (
                  <div className="p-3 rounded-lg bg-nexus-surface border border-nexus-border">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-nexus-textMuted uppercase tracking-wider">Financial Figure</p>
                      <TruthBadge tier={selected.financial_summary.verified ? 'verified' : 'partial'} />
                    </div>
                    <p className="text-lg font-mono font-semibold text-nexus-text">
                      {formatCurrency(
                        selected.financial_summary.spend ??
                        selected.financial_summary.gap_value ??
                        selected.financial_summary.overage ?? 0,
                      )}
                    </p>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <button
                    className="btn-primary text-xs px-4 py-2 disabled:opacity-50"
                    disabled={busy || selected.status === 'actioned'}
                    onClick={() => markActioned(selected)}
                  >
                    {selected.status === 'actioned' ? 'Actioned' : 'Mark Actioned'}
                  </button>
                </div>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
