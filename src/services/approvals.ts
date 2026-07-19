import { supabase } from '../lib/supabaseClient'

export type ActionType = 'code-merge' | 'budget' | 'contract' | 'deployment' | 'policy'
export type Priority = 'high' | 'medium' | 'low'
export type Risk = 'low' | 'medium' | 'high'
export type DecisionState = 'pending' | 'approved' | 'rejected'

export interface ApprovalRow {
  id: number
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
  created_at: string
  updated_at: string
}

export interface CreateApprovalInput {
  title: string
  actionType: ActionType
  requester: string
  dept: string
  priority: Priority
  risk: Risk
  reason: string
  owner: string
}

const ACTION_PREFIX: Record<ActionType, string> = {
  'code-merge': 'CM',
  budget: 'BUD',
  contract: 'CNT',
  deployment: 'DEP',
  policy: 'POL',
}

export async function listApprovals(): Promise<ApprovalRow[]> {
  const { data, error } = await supabase
    .from('approvals')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createApproval(input: CreateApprovalInput): Promise<ApprovalRow> {
  const prefix = ACTION_PREFIX[input.actionType]
  const { count } = await supabase
    .from('approvals')
    .select('*', { count: 'exact', head: true })
    .eq('action_type', input.actionType)

  const seq = String((count ?? 0) + 1).padStart(3, '0')
  const reference = `${prefix}-${seq}`

  const { data, error } = await supabase
    .from('approvals')
    .insert({
      reference,
      title: input.title,
      action_type: input.actionType,
      requester: input.requester,
      dept: input.dept,
      priority: input.priority,
      risk: input.risk,
      reason: input.reason,
      owner: input.owner,
      state: 'pending',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Failed to create approval')

  await supabase.from('audit_log').insert({
    action: 'approval_created',
    entity_type: 'approval',
    entity_id: data.reference,
    actor: 'CEO',
    details: { reference, title: input.title },
  })

  return data as ApprovalRow
}

export async function decideApproval(
  id: number,
  decision: 'approved' | 'rejected',
  feedback?: string,
): Promise<void> {
  const note = feedback ?? (decision === 'approved' ? 'Approved by CEO.' : 'Rejected by CEO.')

  const { data, error } = await supabase
    .from('approvals')
    .update({
      state: decision,
      feedback: note,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('state', 'pending')
    .select('id')

  if (error) throw new Error(error.message)
  if (!data || data.length === 0) {
    throw new Error('Approval is no longer pending or does not exist.')
  }

  await supabase.from('audit_log').insert({
    action: `approval_${decision}`,
    entity_type: 'approval',
    entity_id: String(id),
    actor: 'CEO',
    details: { decision, feedback: note },
  })
}