type Variant = 'success' | 'warning' | 'danger' | 'info' | 'muted'

const variants: Record<Variant, string> = {
  success: 'bg-nexus-success/15 text-nexus-success border-nexus-success/30',
  warning: 'bg-nexus-warning/15 text-nexus-warning border-nexus-warning/30',
  danger:  'bg-nexus-danger/15  text-nexus-danger  border-nexus-danger/30',
  info:    'bg-nexus-info/15    text-nexus-info    border-nexus-info/30',
  muted:   'bg-nexus-muted/40   text-nexus-textMuted border-nexus-border',
}

export function Badge({ label, variant = 'muted' }: { label: string; variant?: Variant }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${variants[variant]}`}>
      {label}
    </span>
  )
}
