import { Panel } from '../../components/ui/Panel'
import { Badge } from '../../components/ui/Badge'

const items = [
  { id: 'PR-42',  title: 'feat: KPI dashboard wiring',      requester: 'Open Claw',  priority: 'high' as const,   age: '2h' },
  { id: 'BUD-07', title: 'Budget variance — Infrastructure', requester: 'Finance',    priority: 'medium' as const, age: '4h' },
  { id: 'CNT-03', title: 'New client contract: Atlas Dyn.',  requester: 'Marcus',     priority: 'high' as const,   age: '1d' },
  { id: 'DEP-12', title: 'Staging → Production deploy',      requester: 'System',     priority: 'low' as const,    age: '6h' },
]

export default function ApprovalsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-display font-semibold text-nexus-text">Approvals Queue</h1>
      <Panel title={`${items.length} pending approvals`}>
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-nexus-surface border border-nexus-border">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-nexus-textMuted">{item.id}</span>
                <div>
                  <p className="text-sm text-nexus-text">{item.title}</p>
                  <p className="text-[11px] text-nexus-textMuted">by {item.requester} · {item.age} ago</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge label={item.priority} variant={item.priority === 'high' ? 'warning' : item.priority === 'medium' ? 'info' : 'muted'} />
                <button className="btn-primary text-xs px-3 py-1.5">Review</button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
