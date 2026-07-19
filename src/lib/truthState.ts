export type TruthStatus = 'DOCUMENTED' | 'INFERRED_FROM_COMPARABLES' | 'PROJECTION'

export interface TruthState {
  status: TruthStatus
  evidence: string
}

export interface TruthBadgeConfig {
  label: string
  short: string
  description: string
  className: string
  dotClassName: string
}

export const TRUTH_STATUSES: TruthStatus[] = [
  'DOCUMENTED',
  'INFERRED_FROM_COMPARABLES',
  'PROJECTION',
]

const TRUTH_BADGE_CONFIG: Record<TruthStatus, TruthBadgeConfig> = {
  DOCUMENTED: {
    label: 'Documented',
    short: 'DOC',
    description: 'Verified from primary source records (bank statements, signed contracts, ledger entries).',
    className: 'bg-nexus-success/15 text-nexus-success border-nexus-success/30',
    dotClassName: 'bg-nexus-success',
  },
  INFERRED_FROM_COMPARABLES: {
    label: 'Inferred',
    short: 'INF',
    description: 'Derived from comparable transactions, peer departments, or benchmark rates where direct records are unavailable.',
    className: 'bg-nexus-warning/15 text-nexus-warning border-nexus-warning/30',
    dotClassName: 'bg-nexus-warning',
  },
  PROJECTION: {
    label: 'Projection',
    short: 'PROJ',
    description: 'Forward-looking estimate based on models, forecasts, or planned commitments. Not yet realized.',
    className: 'bg-nexus-info/15 text-nexus-info border-nexus-info/30',
    dotClassName: 'bg-nexus-info',
  },
}

export function getTruthConfig(status: TruthStatus): TruthBadgeConfig {
  return TRUTH_BADGE_CONFIG[status]
}

export function truthLabel(status: TruthStatus): string {
  return TRUTH_BADGE_CONFIG[status].label
}

export function truthDescription(status: TruthStatus): string {
  return TRUTH_BADGE_CONFIG[status].description
}

export function isDocumented(state: TruthState): boolean {
  return state.status === 'DOCUMENTED'
}

export function isProjected(state: TruthState): boolean {
  return state.status === 'PROJECTION'
}

export function documented(evidence: string): TruthState {
  return { status: 'DOCUMENTED', evidence }
}

export function inferred(evidence: string): TruthState {
  return { status: 'INFERRED_FROM_COMPARABLES', evidence }
}

export function projection(evidence: string): TruthState {
  return { status: 'PROJECTION', evidence }
}

export function truthSummary(states: TruthState[]): Record<TruthStatus, number> {
  const summary: Record<TruthStatus, number> = {
    DOCUMENTED: 0,
    INFERRED_FROM_COMPARABLES: 0,
    PROJECTION: 0,
  }
  for (const s of states) summary[s.status] += 1
  return summary
}

export function highestUncertainty(states: TruthState[]): TruthStatus {
  const order: TruthStatus[] = ['DOCUMENTED', 'INFERRED_FROM_COMPARABLES', 'PROJECTION']
  let worst: TruthStatus = 'DOCUMENTED'
  for (const s of states) {
    if (order.indexOf(s.status) > order.indexOf(worst)) worst = s.status
  }
  return worst
}
