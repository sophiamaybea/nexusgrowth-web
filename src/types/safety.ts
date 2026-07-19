export type Severity = 'critical' | 'warning' | 'info'
export type AckStatus = 'unacknowledged' | 'acknowledged' | 'escalated'
export type AlertSource = 'manual' | 'telegram' | 'audit'

export interface SafetyAlert {
  id: string
  title: string
  detail: string
  dept: string
  severity: Severity
  ack_status: AckStatus
  escalation_note: string | null
  source: AlertSource
  external_ref: string | null
  created_at: string
  updated_at: string
}

export type ControlScope = 'global' | 'department'
export type ControlStatus = 'active' | 'paused' | 'killed'

export interface DepartmentControl {
  id: string
  scope: ControlScope
  dept: string | null
  status: ControlStatus
  reason: string | null
  changed_by: string | null
  changed_at: string
}
