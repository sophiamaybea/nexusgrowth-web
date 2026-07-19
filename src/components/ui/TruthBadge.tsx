import { ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react'

export type TruthTier = 'verified' | 'partial' | 'unverified'

export interface TruthMeta {
  tier: TruthTier
  label: string
  variant: 'success' | 'warning' | 'muted'
  icon: typeof ShieldCheck
  hint: string
}

const TRUTH_META: Record<TruthTier, TruthMeta> = {
  verified: {
    tier: 'verified',
    label: 'VERIFIED',
    variant: 'success',
    icon: ShieldCheck,
    hint: 'Figure sourced from a reconciled, documented record.',
  },
  partial: {
    tier: 'partial',
    label: 'PARTIAL',
    variant: 'warning',
    icon: ShieldAlert,
    hint: 'Figure is provisional or only partially documented.',
  },
  unverified: {
    tier: 'unverified',
    label: 'UNVERIFIED',
    variant: 'muted',
    icon: ShieldQuestion,
    hint: 'Figure has not been reconciled against source records.',
  },
}

export function getTruthMeta(tier: TruthTier): TruthMeta {
  return TRUTH_META[tier]
}

export function TruthBadge({ tier, showLabel = true }: { tier: TruthTier; showLabel?: boolean }) {
  const meta = getTruthMeta(tier)
  const Icon = meta.icon
  return (
    <span
      title={meta.hint}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${{
        success: 'bg-nexus-success/15 text-nexus-success border-nexus-success/30',
        warning: 'bg-nexus-warning/15 text-nexus-warning border-nexus-warning/30',
        muted: 'bg-nexus-muted/40 text-nexus-textMuted border-nexus-border',
      }[meta.variant]}`}
    >
      <Icon size={11} className="shrink-0" />
      {showLabel && <span className="tracking-wider">{meta.label}</span>}
    </span>
  )
}
