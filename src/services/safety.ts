import { supabase } from '../lib/supabaseClient'
import type { SafetyAlert, AckStatus, AlertSource, Severity } from '../types/safety'

export async function fetchSafetyAlerts(limit = 100): Promise<SafetyAlert[]> {
  // Pull risk events from audit_log (type = 'alert') plus the dedicated safety_alerts table.
  const [alertsRes, auditRes] = await Promise.all([
    supabase
      .from('safety_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit),
    supabase
      .from('audit_log')
      .select('id, actor, action, target, details, created_at')
      .eq('type', 'alert')
      .order('created_at', { ascending: false })
      .limit(limit),
  ])

  if (alertsRes.error) throw alertsRes.error
  if (auditRes.error) throw auditRes.error

  const fromTable: SafetyAlert[] = (alertsRes.data ?? []).map((row: any) => ({
    id: row.id,
    title: row.title,
    detail: row.detail,
    dept: row.dept,
    severity: row.severity,
    ack_status: row.ack_status,
    escalation_note: row.escalation_note,
    source: row.source,
    external_ref: row.external_ref,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }))

  const fromAudit: SafetyAlert[] = (auditRes.data ?? []).map((row: any) => ({
    id: `audit_${row.id}`,
    title: row.target || row.action || 'Risk event',
    detail: row.details || `${row.actor || 'System'} — ${row.action}`,
    dept: row.actor || 'System',
    severity: 'critical',
    ack_status: 'unacknowledged' as AckStatus,
    escalation_note: null,
    source: 'audit' as AlertSource,
    external_ref: null,
    created_at: row.created_at,
    updated_at: row.created_at,
  }))

  const rank = (s: Severity) => (s === 'critical' ? 0 : s === 'warning' ? 1 : 2)
  return [...fromTable, ...fromAudit].sort((a, b) => {
    const r = rank(a.severity) - rank(b.severity)
    if (r !== 0) return r
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

export async function setAlertStatus(
  id: string,
  status: AckStatus,
  escalationNote?: string
): Promise<SafetyAlert | null> {
  // Audit-sourced alerts are read-only snapshots of past risk events.
  if (id.startsWith('audit_')) return null

  const { data, error } = await supabase
    .from('safety_alerts')
    .update({
      ack_status: status,
      escalation_note: escalationNote ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function acknowledgeAlert(id: string): Promise<SafetyAlert | null> {
  return setAlertStatus(id, 'acknowledged')
}

export async function escalateAlert(id: string, note?: string): Promise<SafetyAlert | null> {
  return setAlertStatus(id, 'escalated', note ?? 'Escalated to CEO inbox.')
}
