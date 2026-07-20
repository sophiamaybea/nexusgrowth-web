import { useState, useEffect, useCallback } from 'react'
import { Panel } from '../../components/ui/Panel'
import { Badge } from '../../components/ui/Badge'
import { ShieldAlert, ShieldCheck, AlertTriangle, Radio } from 'lucide-react'
import type { SafetyAlert, Severity, AckStatus } from '../../types/safety'
import { fetchSafetyAlerts, acknowledgeAlert, escalateAlert } from '../../services/safety'

const SEV_VARIANT: Record<Severity, 'danger' | 'warning' | 'info'> = {
  critical: 'danger',
  warning: 'warning',
  info: 'info',
}

type SevFilter = 'all' | Severity

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) {
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function severityRank(s: Severity): number {
  return s === 'critical' ? 0 : s === 'warning' ? 1 : 2
}

export default function SafetyAlertsPage() {
  const [sevFilter, setSevFilter] = useState<SevFilter>('all')
  const [alerts, setAlerts] = useState<SafetyAlert[]>([])
  const [selected, setSelected] = useState<SafetyAlert | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acting, setActing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchSafetyAlerts()
      setAlerts(data)
      setSelected(prev => (prev ? data.find(a => a.id === prev.id) ?? data[0] ?? null : data[0] ?? null))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load safety alerts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = alerts.filter(a => sevFilter === 'all' || a.severity === sevFilter)

  const unacked = alerts.filter(a => a.ack_status === 'unacknowledged')
  const criticalUnacked = unacked.filter(a => a.severity === 'critical').length

  async function handleAcknowledge() {
    if (!selected || acting || selected.id.startsWith('audit_')) return
    setActing(true)
    try {
      const updated = await acknowledgeAlert(selected.id)
      if (updated) {
        setAlerts(prev => prev.map(a => (a.id === updated.id ? updated : a)))
        setSelected(updated)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to acknowledge alert')
    } finally {
      setActing(false)
    }
  }

  async function handleEscalate() {
    if (!selected || acting || selected.id.startsWith('audit_')) return
    setActing(true)
    try {
      const updated = await escalateAlert(selected.id)
      if (updated) {
        setAlerts(prev => prev.map(a => (a.id === updated.id ? updated : a)))
        setSelected(updated)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to escalate alert')
    } finally {
      setActing(false)
    }
  }

  const ackVariant = (s: AckStatus) =>
    s === 'unacknowledged' ? 'danger' : s === 'escalated' ? 'warning' : 'muted'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShieldAlert size={20} className="text-nexus-danger" />
        <h1 className="text-xl font-display font-semibold text-nexus-text">Safety Alerts</h1>
      </div>

      {/* Strong red/amber banner — only screen permitted to use it */}
      {criticalUnacked > 0 ? (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-nexus-danger/40 bg-nexus-danger/10 animate-pulse-slow">
          <AlertTriangle size={18} className="text-nexus-danger shrink-0" />
          <p className="text-sm text-nexus-danger font-medium">
            {criticalUnacked} critical unacknowledged alert{criticalUnacked !== 1 ? 's' : ''} require immediate attention.
          </p>
        </div>
      ) : unacked.length > 0 ? (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-nexus-warning/40 bg-nexus-warning/10">
          <AlertTriangle size={18} className="text-nexus-warning shrink-0" />
          <p className="text-sm text-nexus-warning font-medium">
            {unacked.length} unacknowledged alert{unacked.length !== 1 ? 's' : ''} require attention.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-4 rounded-xl border border-nexus-success/30 bg-nexus-success/5">
          <ShieldCheck size={16} className="text-nexus-success" />
          <p className="text-sm text-nexus-success">All alerts acknowledged.</p>
        </div>
      )}

      {error && (
        <div className="text-xs text-nexus-danger bg-nexus-danger/10 border border-nexus-danger/20 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3">
          <Panel
            title="Active Alerts"
            titleRight={
              <div className="flex gap-1.5">
                {(['all', 'critical', 'warning', 'info'] as SevFilter[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setSevFilter(s)}
                    className={`text-[11px] px-2.5 py-1 rounded-md capitalize transition-colors ${
                      sevFilter === s
                        ? 'bg-nexus-accent/20 text-nexus-accent'
                        : 'text-nexus-textMuted hover:text-nexus-text'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            }
          >
            {loading ? (
              <div className="py-8 text-center text-nexus-textMuted text-sm">Loading alerts…</div>
            ) : (
              <div className="space-y-2">
                {filtered.map(a => {
                  const isCritical = a.severity === 'critical' && a.ack_status === 'unacknowledged'
                  return (
                    <button
                      key={a.id}
                      onClick={() => setSelected(a)}
                      className={`w-full text-left flex items-start gap-3 p-3 rounded-lg border transition-all ${
                        selected?.id === a.id
                          ? 'bg-nexus-accent/10 border-nexus-accent/30'
                          : isCritical
                            ? 'bg-nexus-danger/5 border-nexus-danger/30'
                            : 'bg-nexus-surface border-nexus-border hover:border-nexus-textMuted/30'
                      }`}
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                          a.severity === 'critical'
                            ? 'bg-nexus-danger'
                            : a.severity === 'warning'
                              ? 'bg-nexus-warning'
                              : 'bg-nexus-info'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <p className="text-sm text-nexus-text truncate">{a.title}</p>
                          <span className="text-[11px] text-nexus-textMuted/60 shrink-0">{formatTime(a.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-nexus-textMuted">{a.dept}</span>
                          <Badge label={a.severity} variant={SEV_VARIANT[a.severity]} />
                          <Badge
                            label={a.ack_status === 'unacknowledged' ? 'unacked' : a.ack_status}
                            variant={ackVariant(a.ack_status)}
                          />
                          {a.source === 'telegram' && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-nexus-textMuted">
                              <Radio size={10} /> TG
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
                {filtered.length === 0 && (
                  <div className="py-8 text-center text-nexus-textMuted text-sm">No alerts match this filter.</div>
                )}
              </div>
            )}
          </Panel>
        </div>

        <div className="xl:col-span-2">
          <Panel title={selected ? 'Alert Detail' : 'Select an alert'}>
            {!selected ? (
              <p className="text-nexus-textMuted text-sm text-center py-8">Select an alert to view detail and actions.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Alert</p>
                  <p className="text-nexus-text font-medium">{selected.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Department</p>
                    <p className="text-sm text-nexus-text">{selected.dept}</p>
                  </div>
                  <div>
                    <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Severity</p>
                    <Badge label={selected.severity} variant={SEV_VARIANT[selected.severity]} />
                  </div>
                  <div>
                    <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Time</p>
                    <p className="text-sm text-nexus-text">{formatTime(selected.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Status</p>
                    <Badge
                      label={selected.ack_status === 'unacknowledged' ? 'unacked' : selected.ack_status}
                      variant={ackVariant(selected.ack_status)}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Source</p>
                    <p className="text-sm text-nexus-text capitalize">{selected.source}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Detail</p>
                  <p className="text-sm text-nexus-text leading-relaxed">{selected.detail}</p>
                </div>
                {selected.escalation_note && (
                  <div className="p-3 rounded-lg border border-nexus-warning/30 bg-nexus-warning/5">
                    <p className="text-[11px] text-nexus-warning">{selected.escalation_note}</p>
                  </div>
                )}
                {!selected.id.startsWith('audit_') ? (
                  selected.ack_status === 'unacknowledged' ? (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleAcknowledge}
                        disabled={acting}
                        className="btn-primary text-xs px-4 py-2 disabled:opacity-50"
                      >
                        {acting ? 'Processing…' : 'Acknowledge'}
                      </button>
                      <button
                        onClick={handleEscalate}
                        disabled={acting}
                        className="btn-ghost text-xs px-4 py-2 disabled:opacity-50 border-nexus-warning/40 text-nexus-warning hover:text-nexus-warning"
                      >
                        Escalate
                      </button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-nexus-textMuted pt-1">
                      This alert was {selected.ack_status}.
                    </p>
                  )
                ) : (
                  <p className="text-[11px] text-nexus-textMuted pt-1">
                    Historical risk event from the audit log (read-only).
                  </p>
                )}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
