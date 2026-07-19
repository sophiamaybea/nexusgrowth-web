import { useState } from 'react'
import { Panel } from '../../components/ui/Panel'
import { Badge } from '../../components/ui/Badge'
import { Search } from 'lucide-react'

type Category = 'all' | 'lesson' | 'issue' | 'decision'

interface ReflectionEntry {
  id: string
  date: string
  title: string
  summary: string
  category: 'lesson' | 'issue' | 'decision'
  promoted?: boolean
  recurring?: boolean
  dept: string
}

const ENTRIES: ReflectionEntry[] = [
  { id: 'r1',  date: '18 Jul 2025', title: 'Infrastructure spend acceleration',       summary: 'Capex overage of 18% attributed to accelerated rack provisioning. Positive indicator — demand ahead of forecast.',          category: 'lesson',   promoted: true,  recurring: false, dept: 'Finance' },
  { id: 'r2',  date: '15 Jul 2025', title: 'Sprint velocity correlation',             summary: 'Velocity gains track directly with reduced meeting load. Implement async stand-up permanently.',                            category: 'lesson',   promoted: true,  recurring: false, dept: 'Product' },
  { id: 'r3',  date: '12 Jul 2025', title: 'Client onboarding delay pattern',         summary: 'Third successive onboarding delayed by legal review bottleneck. SLA breach risk if unresolved by Q3.',                    category: 'issue',    promoted: false, recurring: true,  dept: 'Client Success' },
  { id: 'r4',  date: '10 Jul 2025', title: 'Approved: Staging → Production deploy',   summary: 'CEO authorised production deployment of sprint 13 build. Rollback plan confirmed with Zara.',                             category: 'decision', promoted: false, recurring: false, dept: 'Engineering' },
  { id: 'r5',  date: '08 Jul 2025', title: 'Agent task loop detected',                summary: 'Open Claw agent entered a retry loop on task #203. Root cause: ambiguous success criteria. Resolved via tighter spec.',   category: 'issue',    promoted: false, recurring: true,  dept: 'Open Claw AI' },
  { id: 'r6',  date: '05 Jul 2025', title: 'NPS upswing — client segment analysis',   summary: 'Enterprise NPS rose 13 points. SMB segment flat. Suggests differentiated support investment strategy needed.',           category: 'lesson',   promoted: true,  recurring: false, dept: 'Client Success' },
  { id: 'r7',  date: '02 Jul 2025', title: 'Approved: Legal clause waiver on §7.4',   summary: 'Data residency clause waived for Atlas Dynamics under UK-US data bridge framework. Logged for compliance review.',        category: 'decision', promoted: false, recurring: false, dept: 'Legal' },
  { id: 'r8',  date: '28 Jun 2025', title: 'Recurring: Budget forecast drift',        summary: 'Finance forecasts have drifted >10% vs actuals for three consecutive months. Model recalibration overdue.',               category: 'issue',    promoted: false, recurring: true,  dept: 'Finance' },
]

const CAT_COLORS: Record<string, 'warning' | 'info' | 'muted'> = {
  lesson:   'info',
  issue:    'warning',
  decision: 'muted',
}

export default function ReflectionPage() {
  const [query, setQuery]   = useState('')
  const [filter, setFilter] = useState<Category>('all')

  const filtered = ENTRIES.filter(e => {
    const matchCat = filter === 'all' || e.category === filter
    const q = query.toLowerCase()
    const matchQ = !q || e.title.toLowerCase().includes(q) || e.summary.toLowerCase().includes(q) || e.dept.toLowerCase().includes(q)
    return matchCat && matchQ
  })

  const promoted = ENTRIES.filter(e => e.promoted)
  const recurring = ENTRIES.filter(e => e.recurring)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-display font-semibold text-nexus-text">Reflection / Memory</h1>

      {/* Promoted lessons */}
      <Panel title="Promoted Lessons">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {promoted.map(e => (
            <div key={e.id} className="p-3 rounded-lg bg-nexus-accent/5 border border-nexus-accent/20">
              <p className="text-[11px] text-nexus-accent font-medium uppercase tracking-wider mb-1">{e.dept}</p>
              <p className="text-sm text-nexus-text font-medium mb-1">{e.title}</p>
              <p className="text-[11px] text-nexus-textMuted leading-relaxed">{e.summary}</p>
            </div>
          ))}
        </div>
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
                  <p className="text-[11px] text-nexus-textMuted">{e.dept} · {e.date}</p>
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
            {(['all','lesson','issue','decision'] as Category[]).map(c => (
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
        <div className="space-y-2">
          {filtered.length === 0 && (
            <p className="text-nexus-textMuted text-sm text-center py-6">No entries match your filter.</p>
          )}
          {filtered.map(e => (
            <div key={e.id} className="flex items-start gap-4 p-3 rounded-lg bg-nexus-surface border border-nexus-border">
              <div className="shrink-0 pt-0.5">
                <Badge label={e.category} variant={CAT_COLORS[e.category]} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className="text-sm text-nexus-text font-medium truncate">{e.title}</p>
                  <span className="text-[11px] text-nexus-textMuted shrink-0">{e.date}</span>
                </div>
                <p className="text-[11px] text-nexus-textMuted leading-relaxed">{e.summary}</p>
                <p className="text-[10px] text-nexus-textMuted/60 mt-1">{e.dept}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
