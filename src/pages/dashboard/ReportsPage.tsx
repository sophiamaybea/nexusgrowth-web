import { useState } from 'react'
import { Panel } from '../../components/ui/Panel'
import { Badge } from '../../components/ui/Badge'
import { ChevronRight } from 'lucide-react'

type Priority = 'high' | 'medium' | 'low'
type Status   = 'unread' | 'read' | 'actioned'

interface Report {
  id: string
  title: string
  from: string
  dept: string
  date: string
  priority: Priority
  status: Status
  preview: string
}

const REPORTS: Report[] = [
  { id: 'rp01', title: 'Q2 Revenue Summary',          from: 'Marcus Webb',  dept: 'Finance',        date: 'Today',       priority: 'high',   status: 'unread',   preview: 'Total Q2 revenue £7.2M, +18% YoY. Three new enterprise accounts closed. Gross margin maintained at 63%.' },
  { id: 'rp02', title: 'Client NPS Results — Q2',      from: 'Rohan Mehta', dept: 'Client Success', date: 'Today',       priority: 'high',   status: 'unread',   preview: 'NPS score 74 (+13 pts). Enterprise segment leads at 81. Key driver: dedicated success manager model.' },
  { id: 'rp03', title: 'AI Agent Performance Report',  from: 'Open Claw',   dept: 'Open Claw AI',  date: 'Yesterday',   priority: 'medium', status: 'read',     preview: 'Cycle #47 complete. 7/9 tasks autonomous. 2 escalated. One loop incident resolved. Uptime 99.2%.' },
  { id: 'rp04', title: 'Sprint 14 Retrospective',      from: 'Lena Park',   dept: 'Product',        date: 'Yesterday',   priority: 'medium', status: 'read',     preview: 'Velocity +22%. 2 features to staging. Legal dependency identified for data export module.' },
  { id: 'rp05', title: 'Infrastructure Cost Analysis', from: 'Zara Osei',   dept: 'Engineering',   date: '2 days ago',  priority: 'high',   status: 'unread',   preview: 'Capex overage 18% above plan due to accelerated rack provisioning. Demand signal positive.' },
  { id: 'rp06', title: 'Atlas Dynamics Contract Review',from: 'Priya Nair',  dept: 'Legal',          date: '3 days ago',  priority: 'high',   status: 'actioned', preview: 'MSA reviewed. §7.4 data residency clause flagged. CEO waiver granted under UK-US data bridge.' },
  { id: 'rp07', title: 'Security Posture Assessment',  from: 'System',      dept: 'Security',       date: '5 days ago',  priority: 'low',    status: 'read',     preview: 'No active threats. Two minor vulnerabilities patched. SOC 2 audit prep on track for October.' },
]

const PRIORITY_VARIANT: Record<Priority, 'warning' | 'info' | 'muted'> = {
  high: 'warning', medium: 'info', low: 'muted',
}

const STATUS_VARIANT: Record<Status, 'warning' | 'info' | 'muted'> = {
  unread: 'warning', read: 'muted', actioned: 'info',
}

export default function ReportsPage() {
  const [selected, setSelected] = useState<Report | null>(null)
  const [deptFilter, setDeptFilter] = useState('all')

  const depts = ['all', ...Array.from(new Set(REPORTS.map(r => r.dept)))]
  const filtered = REPORTS.filter(r => deptFilter === 'all' || r.dept === deptFilter)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-display font-semibold text-nexus-text">Reports Inbox</h1>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Table */}
        <div className="xl:col-span-3">
          <Panel
            title={`${REPORTS.filter(r => r.status === 'unread').length} unread reports`}
            titleRight={
              <div className="flex gap-1 flex-wrap">
                {depts.map(d => (
                  <button
                    key={d}
                    onClick={() => setDeptFilter(d)}
                    className={`text-[11px] px-2 py-1 rounded-md transition-colors ${
                      deptFilter === d
                        ? 'bg-nexus-accent/20 text-nexus-accent'
                        : 'text-nexus-textMuted hover:text-nexus-text'
                    }`}
                  >{d === 'all' ? 'All' : d}</button>
                ))}
              </div>
            }
          >
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
                      <span className="text-[11px] text-nexus-textMuted/60 shrink-0">{r.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-nexus-textMuted">{r.dept}</span>
                      <Badge label={r.priority}   variant={PRIORITY_VARIANT[r.priority]} />
                      <Badge label={r.status}     variant={STATUS_VARIANT[r.status]} />
                    </div>
                  </div>
                  <ChevronRight size={13} className="text-nexus-textMuted shrink-0" />
                </button>
              ))}
            </div>
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
                    <p className="text-sm text-nexus-text">{selected.from}</p>
                  </div>
                  <div>
                    <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Dept</p>
                    <p className="text-sm text-nexus-text">{selected.dept}</p>
                  </div>
                  <div>
                    <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Date</p>
                    <p className="text-sm text-nexus-text">{selected.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Priority</p>
                    <Badge label={selected.priority} variant={PRIORITY_VARIANT[selected.priority]} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-2">Preview</p>
                  <p className="text-sm text-nexus-text leading-relaxed">{selected.preview}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button className="btn-primary text-xs px-4 py-2">Open Full Report</button>
                  <button className="btn-ghost text-xs px-4 py-2">Mark Actioned</button>
                </div>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
