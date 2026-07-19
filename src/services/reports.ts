import { supabase } from '../lib/supabaseClient'
import type { Report, ReportSource } from '../types/reports'

const SOURCE_LABEL: Record<ReportSource, string> = {
  reflection_leader: 'Reflection Leader',
  teacher_agent: 'Teacher Agent',
  rd_daily: 'R&D Daily',
}

export function reportSourceLabel(source: ReportSource): string {
  return SOURCE_LABEL[source]
}

export async function getReports(): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map((row: any) => ({
    id: row.id,
    source: row.source,
    title: row.title,
    author: row.author,
    dept: row.dept,
    body: row.body,
    priority: row.priority,
    status: row.status,
    financial_summary: row.financial_summary ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }))
}

export async function updateReportStatus(id: string, status: Report['status']): Promise<Report> {
  const { data, error } = await supabase
    .from('reports')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return data
}
