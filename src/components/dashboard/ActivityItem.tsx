import { Badge } from '../ui/Badge'

export interface ActivityEntry {
  id: string
  time: string
  actor: string
  action: string
  target?: string
  type: 'agent' | 'system' | 'human' | 'alert'
}

const typeColor = {
  agent:  'info',
  system: 'muted',
  human:  'success',
  alert:  'warning',
} as const

export function ActivityItem({ entry }: { entry: ActivityEntry }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-nexus-border/50 last:border-0">
      <span className="text-nexus-textMuted text-[11px] font-mono w-14 shrink-0 pt-0.5">{entry.time}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge label={entry.type.toUpperCase()} variant={typeColor[entry.type]} />
          <span className="text-nexus-text text-xs font-medium">{entry.actor}</span>
          <span className="text-nexus-textMuted text-xs">{entry.action}</span>
          {entry.target && (
            <span className="text-nexus-accent text-xs truncate">{entry.target}</span>
          )}
        </div>
      </div>
    </div>
  )
}
