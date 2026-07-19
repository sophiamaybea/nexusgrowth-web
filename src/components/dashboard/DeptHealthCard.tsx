import { TruthBadge } from '../ui/TruthBadge'
import type { Department } from '../../types/dashboard'

const statusLabel = {
  healthy:  { text: 'Healthy',  color: 'text-nexus-success' },
  warning:  { text: 'Attention',color: 'text-nexus-warning' },
  critical: { text: 'Critical', color: 'text-nexus-danger' },
  idle:     { text: 'Idle',     color: 'text-nexus-textMuted' },
}

function formatCurrency(value: number): string {
  const formatted = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(value))
  return `£${formatted}`
}

export function DeptHealthCard({ dept }: { dept: Department }) {
  const s = statusLabel[dept.status]
  const barW = `${dept.score}%`
  const barColor = dept.status === 'healthy' ? 'bg-nexus-success' : dept.status === 'warning' ? 'bg-nexus-warning' : dept.status === 'critical' ? 'bg-nexus-danger' : 'bg-nexus-textMuted'

  const budget = Number(dept.budget ?? 0)
  const earned = Number(dept.earned ?? 0)
  const earnedPct = budget > 0 ? Math.min(100, Math.round((earned / budget) * 100)) : 0
  const variance = earned - budget

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

      {/* Budget vs Earned */}
      <div className="pt-2 border-t border-nexus-border/60 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-nexus-textMuted uppercase tracking-wider">Budget vs Earned</p>
          <TruthBadge tier="verified" showLabel={false} />
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-nexus-textMuted">Budget</span>
          <span className="font-mono text-nexus-text">{formatCurrency(budget)}</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-nexus-textMuted">Earned</span>
          <span className="font-mono text-nexus-success">{formatCurrency(earned)}</span>
        </div>
        <div className="w-full h-2 bg-nexus-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${earnedPct >= 90 ? 'bg-nexus-success' : earnedPct >= 60 ? 'bg-nexus-warning' : 'bg-nexus-danger'}`}
            style={{ width: `${earnedPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-nexus-textMuted">{earnedPct}% realised</span>
          <span className={variance >= 0 ? 'text-nexus-success' : 'text-nexus-danger'}>
            {variance >= 0 ? '+' : '−'}{formatCurrency(Math.abs(variance))} vs budget
          </span>
        </div>
      </div>
    </div>
  )
}
