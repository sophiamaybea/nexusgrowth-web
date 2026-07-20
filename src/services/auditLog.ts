import { supabase } from '../lib/supabaseClient'
import type { AuditLogEntry } from '../types/approval'

export async function fetchAuditLog(limit = 50): Promise<AuditLogEntry[]> {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

export async function logActivity(entry: {
  actor: string
  action: string
  target?: string
  type: 'agent' | 'system' | 'human' | 'alert'
  details?: string
}): Promise<void> {
  const { error } = await supabase.from('audit_log').insert({
    actor: entry.actor,
    action: entry.action,
    target: entry.target ?? null,
    type: entry.type,
    details: entry.details ?? null,
  })
  if (error) throw error
}
