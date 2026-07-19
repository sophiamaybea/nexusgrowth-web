import { supabase } from '../lib/supabaseClient'
import type { DepartmentControl, ControlStatus } from '../types/safety'

const GLOBAL_ID = 'global'
const DEPT_PREFIX = 'dept:'

function toControl(row: any): DepartmentControl {
  return {
    id: row.id,
    scope: row.scope,
    dept: row.dept ?? null,
    status: row.status,
    reason: row.reason ?? null,
    changed_by: row.changed_by ?? null,
    changed_at: row.changed_at,
  }
}

export async function fetchControls(): Promise<{
  global: DepartmentControl
  departments: DepartmentControl[]
}> {
  const { data, error } = await supabase
    .from('department_controls')
    .select('*')
    .order('id', { ascending: true })

  if (error) throw error

  const rows = (data ?? []).map(toControl)
  const global = rows.find(c => c.scope === 'global')
  const departments = rows.filter(c => c.scope === 'department')

  if (!global) {
    throw new Error('Global control state is missing. Run the latest database migration.')
  }

  return { global, departments }
}

async function applyControl(
  id: string,
  status: ControlStatus,
  changedBy: string | null,
  reason?: string
): Promise<DepartmentControl> {
  const { data, error } = await supabase
    .from('department_controls')
    .update({
      status,
      reason: reason ?? null,
      changed_by: changedBy,
      changed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return toControl(data)
}

export async function setGlobalControl(
  status: ControlStatus,
  changedBy: string | null,
  reason?: string
): Promise<DepartmentControl> {
  return applyControl(GLOBAL_ID, status, changedBy, reason)
}

export async function setDepartmentControl(
  dept: string,
  status: ControlStatus,
  changedBy: string | null,
  reason?: string
): Promise<DepartmentControl> {
  return applyControl(`${DEPT_PREFIX}${dept}`, status, changedBy, reason)
}
