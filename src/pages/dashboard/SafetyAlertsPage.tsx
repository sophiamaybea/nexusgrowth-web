import { useState } from 'react'
import { Panel } from '../../components/ui/Panel'
import { Badge } from '../../components/ui/Badge'
import { ShieldAlert, ShieldCheck } from 'lucide-react'

type Severity = 'critical' | 'warning' | 'info'
type AckStatus = 'unacknowledged' | 'acknowledged' | 'escalated'

interface Alert {
  id: string
  title: string
  detail: string
  dept: string
  severity: Severity
  ackStatus: AckStatus
  time: string
  escalationNote?: string
}

const INITIAL_ALERTS: Alert[] = [
  { id: 'sa01', title: 'Finance budget variance +18% above plan', detail: 'Infrastructure capex accelerated ahead of schedule. Positive demand signal but cash flow monitoring required.', dept: 'Finance', severity: 'warning', ackStatus: 'unacknowledged', time: '09:42' },
  { id: 'sa02', title: 'Staging deployment pending CEO sign-off',  detail: 'Sprint 14 build validated in staging. Zara awaiting explicit CEO authorisation before production push.', dept: 'Engineering', severity: 'info', ackStatus: 'unacknowledged', time: '08:55' },
  { id: 'sa03', title: 'Open Claw agent loop — task #203',         detail: 'Agent entered retry loop on task #203. Root cause identified: ambiguous success criteria. Resolved — no data loss.', dept: 'Open Claw AI', severity: 'warning', ackStatus: 'acknowledged', time: 'Yesterday 16:10' },
  { id: 'sa04', title: 'Legal clause unresolved — Atlas MSA',     detail: '§7.4 data residency clause waiver required before contract execution. Escalated to CEO for decision.', dept: 'Legal', severity: 'critical', ackStatus: 'escalated', time: 'Mon 11:20', escalationNote: 'Escalated to CEO inbox. Awaiting formal sign-off.' },
  { id: 'sa05', title: 'Client onboarding SLA at risk',            detail: 'Third consecutive onboarding delayed by legal review cycle. Breach window: 12 days.', dept: 'Client Success', severity: 'warning', ackStatus: 'unacknowledged', time: 'Mon 09:00' },
]

const SEV_VARIANT: Record<Severity, 'warning' | 'info' | 'muted'> = {
  critical: 'warning', warning: 'warning', info: 'info',
}

const SEV_DOT: Record<Severity, string> = {
  critical: 'critical', warning: 'warning', info: 'idle',
}

type SevFilter = 'all' | Severity

export default function SafetyAlertsPage() {
  const [sevFilter, setSevFilter] = useState<SevFilter>('all')
  const [alerts, setAlerts]       = useState<Alert[]>(INITIAL_ALERTS)
  const [selected, setSelected]   = useState<Alert | null>(null)

  const filtered = alerts.filter(a => sevFilter === 'all' || a.severity === sevFilter)

  function acknowledge(id: string) {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, ackStatus: 'acknowledged' } : a))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, ackStatus: 'acknowledged' } : null)
  }

  function escalate(id: string) {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, ackStatus: 'escalated', escalationNote: 'Escalated to CEO inbox.' } : a))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, ackStatus: 'escalated', escalationNote: 'Escalated to CEO inbox.' } : null)
  }

  const unackedCount = alerts.filter(a => a.ackStatus === 'unacknowledged').length

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-display font-semibold text-nexus-text">Safety Alerts</h1>

      {unackedCount === 0 ? (
        <div className="flex items-center gap-2 p-4 rounded-xl border border-nexus-success/30 bg-nexus-success/5">
          <ShieldCheck size={16} className="text-nexus-success" />
          <p className="text-sm text-nexus-success">All alerts acknowledged.</p>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-4 rounded-xl border border-nexus-warning/30 bg-nexus-warning/5">
          <ShieldAlert size={16} className="text-nexus-warning" />
          <p className="text-sm text-nexus-warning">{unackedCount} unacknowledged alert{unackedCount !== 1 ? 's' : ''} require attention.</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3">
          <Panel
            title="Active Alerts"
            titleRight={
              <div className="flex gap-1.5">
                {(['all','critical','warning','info'] as SevFilter[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setSevFilter(s)}
                    className={`text-[11px] px-2.5 py-1 rounded-md capitalize transition-colors ${
                      sevFilter === s
                        ? 'bg-nexus-accent/20 text-nexus-accent'
                        : 'text-nexus-textMuted hover:text-nexus-text'
                    }`}
                  >{s}</button>
                ))}
              </div>
            }
          >
            <div className="space-y-2">
              {filtered.map(a => (
                <button
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className={`w-full text-left flex items-start gap-3 p-3 rounded-lg border transition-all ${
                    selected?.id === a.id
                      ? 'bg-nexus-accent/10 border-nexus-accent/30'
                      : 'bg-nexus-surface border-nexus-border hover:border-nexus-textMuted/30'
                  }`}
                >
                  <span className={`status-dot ${SEV_DOT[a.severity]} mt-1.5 shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-sm text-nexus-text truncate">{a.title}</p>
                      <span className="text-[11px] text-nexus-textMuted/60 shrink-0">{a.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-nexus-textMuted">{a.dept}</span>
                      <Badge label={a.severity}  variant={SEV_VARIANT[a.severity]} />
                      <Badge
                        label={a.ackStatus === 'unacknowledged' ? 'unacked' : a.ackStatus}
                        variant={a.ackStatus === 'unacknowledged' ? 'warning' : a.ackStatus === 'escalated' ? 'info' : 'muted'}
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>
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
                    <p className="text-sm text-nexus-text">{selected.time}</p>
                  </div>
                  <div>
                    <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Status</p>
                    <Badge
                      label={selected.ackStatus === 'unacknowledged' ? 'unacked' : selected.ackStatus}
                      variant={selected.ackStatus === 'unacknowledged' ? 'warning' : selected.ackStatus === 'escalated' ? 'info' : 'muted'}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Detail</p>
                  <p className="text-sm text-nexus-text leading-relaxed">{selected.detail}</p>
                </div>
                {selected.escalationNote && (
                  <div className="p-3 rounded-lg border border-nexus-accent/20 bg-nexus-accent/5">
                    <p className="text-[11px] text-nexus-accent">{selected.escalationNote}</p>
                  </div>
                )}
                {selected.ackStatus === 'unacknowledged' && (
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => acknowledge(selected.id)} className="btn-primary text-xs px-4 py-2">Acknowledge</button>
                    <button onClick={() => escalate(selected.id)}    className="btn-ghost text-xs px-4 py-2">Escalate</button>
                  </div>
                )}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
