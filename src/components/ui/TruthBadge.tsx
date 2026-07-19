import { getTruthConfig, truthDescription } from '../../lib/truthState'
import type { TruthStatus } from '../../lib/truthState'

interface TruthBadgeProps {
  status: TruthStatus
  evidence?: string
  size?: 'xs' | 'sm'
  showDot?: boolean
}

export function TruthBadge({ status, evidence, size = 'xs', showDot = true }: TruthBadgeProps) {
  const config = getTruthConfig(status)
  const title = evidence
    ? `${config.label} — ${truthDescription(status)}\nEvidence: ${evidence}`
    : `${config.label} — ${truthDescription(status)}`
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-[9px] px-1.5 py-0.5'

  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded border font-medium uppercase tracking-wide leading-none ${sizeClass} ${config.className}`}
    >
      {showDot && <span className={`inline-block w-1.5 h-1.5 rounded-full ${config.dotClassName}`} />}
      {config.short}
    </span>
  )
}
