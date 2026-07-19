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
