import { supabase } from '../lib/supabaseClient'
import { logActivity } from './auditLog'
import type { Reflection, ReflectionState } from '../types/reports'

export async function getReflections(): Promise<Reflection[]> {
  const { data, error } = await supabase
    .from('reflections')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map((row: any) => ({
    id: row.id,
    title: row.title,
    summary: row.summary,
    category: row.category,
    dept: row.dept,
    state: row.state,
    recurring: row.recurring,
    financial_impact: Number(row.financial_impact ?? 0),
    financial_verified: row.financial_verified,
    created_by: row.created_by ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }))
}

async function setState(id: string, state: ReflectionState, actor: string, action: string): Promise<void> {
  const { error } = await supabase
    .from('reflections')
    .update({ state, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error

  await logActivity({
    actor,
    action,
    target: id,
    type: 'human',
    details: `reflection:${state}`,
  })
}

export function promoteReflection(id: string, actor: string): Promise<void> {
  return setState(id, 'promoted', actor, 'promoted reflection')
}

export function killReflection(id: string, actor: string): Promise<void> {
  return setState(id, 'killed', actor, 'killed reflection')
}

export function openReflection(id: string, actor: string): Promise<void> {
  return setState(id, 'open', actor, 'reopened reflection')
}
