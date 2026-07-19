import { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { TruthBadge } from './TruthBadge'
import type { TruthStatus } from '../../lib/truthState'

interface KpiCardProps {
  label: string
  value: string
  unit?: string
  trend?: number      // percent change
  status?: 'healthy' | 'warning' | 'critical' | 'idle'
  icon?: ReactNode
  truthStatus?: TruthStatus
  evidence?: string
}

export function KpiCard({ label, value, unit, trend, status = 'idle', icon, truthStatus, evidence }: KpiCardProps) {
  const trendColor = trend === undefined ? '' : trend > 0 ? 'text-nexus-success' : trend < 0 ? 'text-nexus-danger' : 'text-nexus-textMuted'
  const TrendIcon = trend === undefined ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus

  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between">
        <span className="text-nexus-textMuted text-xs uppercase tracking-widest">{label}</span>
        <div className="flex items-center gap-2">
          {status && <span className={`status-dot ${status}`} />}
          {icon && <span className="text-nexus-textMuted">{icon}</span>}
        </div>
      </div>
      <div className="flex items-end gap-1.5 mt-2">
        <span className="text-2xl font-semibold text-nexus-text font-body tabular-nums">{value}</span>
        {unit && <span className="text-nexus-textMuted text-sm mb-0.5">{unit}</span>}
      </div>
      {truthStatus && (
        <div className="mt-1.5">
          <TruthBadge status={truthStatus} evidence={evidence} />
        </div>
      )}
      {TrendIcon && trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs mt-1 ${trendColor}`}>
          <TrendIcon size={12} />
          <span>{Math.abs(trend)}% vs last period</span>
        </div>
      )}
    </div>
  )
}
