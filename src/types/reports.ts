export type ReportSource = 'reflection_leader' | 'teacher_agent' | 'rd_daily'
export type ReportStatus = 'unread' | 'read' | 'actioned'
export type ReportPriority = 'high' | 'medium' | 'low'

export interface ReportFinancialSummary {
  spend?: number
  gap_value?: number
  overage?: number
  verified?: boolean
}

export interface Report {
  id: string
  source: ReportSource
  title: string
  author: string
  dept: string
  body: string
  priority: ReportPriority
  status: ReportStatus
  financial_summary: ReportFinancialSummary | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type ReflectionCategory = 'lesson' | 'issue' | 'decision'
export type ReflectionState = 'open' | 'promoted' | 'killed'

export interface Reflection {
  id: string
  title: string
  summary: string
  category: ReflectionCategory
  dept: string
  state: ReflectionState
  recurring: boolean
  financial_impact: number
  financial_verified: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}
