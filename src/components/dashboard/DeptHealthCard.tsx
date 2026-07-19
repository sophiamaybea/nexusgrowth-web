export interface DeptHealth {
  name: string
  status: 'healthy' | 'warning' | 'critical' | 'idle'
  score: number
  lead: string
  openTasks: number
}

const statusLabel = {
  healthy:  { text: 'Healthy',  color: 'text-nexus-success' },
  warning:  { text: 'Attention',color: 'text-nexus-warning' },
  critical: { text: 'Critical', color: 'text-nexus-danger' },
  idle:     { text: 'Idle',     color: 'text-nexus-textMuted' },
}

export function DeptHealthCard({ dept }: { dept: DeptHealth }) {
  const s = statusLabel[dept.status]
  const barW = `${dept.score}%`
  const barColor = dept.status === 'healthy' ? 'bg-nexus-success' : dept.status === 'warning' ? 'bg-nexus-warning' : dept.status === 'critical' ? 'bg-nexus-danger' : 'bg-nexus-textMuted'

  return (
    <div className="glass-panel p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-nexus-text text-sm font-medium">{dept.name}</span>
        <span className={`text-xs font-medium ${s.color}`}>{s.text}</span>
      </div>
      <div className="w-full h-1.5 bg-nexus-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: barW }} />
      </div>
      <div className="flex items-center justify-between text-[11px] text-nexus-textMuted">
        <span>Lead: {dept.lead}</span>
        <span>{dept.openTasks} open tasks</span>
      </div>
    </div>
  )
}
