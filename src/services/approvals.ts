import { supabase } from '../lib/supabaseClient'
import type { Approval, DecisionState, AuditLogEntry, ActionType, Priority, Risk } from '../types/approval'

export async function fetchApprovals(filterState?: DecisionState): Promise<Approval[]> {
  let query = supabase
    .from('approvals')
    .select('*')
    .order('created_at', { ascending: false })

  if (filterState) {
    query = query.eq('state', filterState)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function createApproval(input: {
  title: string
  actionType: ActionType
  requester: string
  dept: string
  priority: Priority
  risk: Risk
  reason: string
  owner: string
}): Promise<Approval> {
  const { data, error } = await supabase
    .from('approvals')
    .insert({
      title: input.title,
      action_type: input.actionType,
      requester: input.requester,
      dept: input.dept,
      priority: input.priority,
      risk: input.risk,
      reason: input.reason,
      owner: input.owner,
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function decideApproval(
  id: string,
  decision: DecisionState,
  feedback: string | null,
  actorId?: string | null,
  actorName?: string | null
): Promise<Approval> {
  const { data, error } = await supabase
    .from('approvals')
    .update({
      state: decision,
      feedback,
      decided_by: actorName ?? null,
      decided_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function writeAuditLog(entry: {
  entityType: string
  entityId: string
  action: 'created' | 'approved' | 'rejected'
  actorId?: string | null
  actorName?: string | null
  details?: string | null
}): Promise<AuditLogEntry> {
  const { data, error } = await supabase
    .from('audit_log')
    .insert({
      entity_type: entry.entityType,
      entity_id: entry.entityId,
      action: entry.action,
      actor_id: entry.actorId ?? null,
      actor_name: entry.actorName ?? null,
      details: entry.details ?? null,
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}
