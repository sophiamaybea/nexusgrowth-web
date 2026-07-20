export type Priority = 'high' | 'medium' | 'low'
export type ActionType = 'code-merge' | 'budget' | 'contract' | 'deployment' | 'policy'
export type DecisionState = 'pending' | 'approved' | 'rejected'
export type Risk = 'low' | 'medium' | 'high'

export interface Approval {
  id: string
  reference: string
  title: string
  action_type: ActionType
  requester: string
  dept: string
  priority: Priority
  risk: Risk
  reason: string
  owner: string
  state: DecisionState
  feedback: string | null
  decided_by: string | null
  decided_at: string | null
  created_at: string
  updated_at: string
}

export interface AuditLogEntry {
  id: string
  entity_type: string
  entity_id: string
  action: 'created' | 'approved' | 'rejected'
  actor_id: string | null
  actor_name: string | null
  details: string | null
  created_at: string
}
