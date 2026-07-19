import { supabase } from '../lib/supabase'
import type { Department, Transaction, ComputedKpis, ActivityEntry } from '../types/dashboard'

type DepartmentRow = {
  id: string
  name: string
  status: Department['status']
  score: number
  lead: string
  open_tasks: number
  budget: number
  created_at: string
  updated_at: string
}

type TransactionRow = {
  id: string
  description: string
  department_id: string | null
  amount: number | string
  type: Transaction['type']
  status: Transaction['status']
  date: string
  created_at: string
  updated_at: string
  department?: { name: string } | null
}

type AuditLogRow = {
  id: string
  actor: string | null
  action: string
  target: string | null
  type: ActivityEntry['type']
  created_at: string
}

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === 'number') return value
  if (value === null || value === undefined) return 0
  return Number(value)
}

function formatCurrency(value: number): string {
  const abs = Math.abs(value)
  const formatted = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(abs)
  return value < 0 ? `-£${formatted.slice(1)}` : `£${formatted}`
}

export async function getDepartments(): Promise<Department[]> {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return (data || []).map((row: DepartmentRow): Department => ({
    id: row.id,
    name: row.name,
    status: row.status,
    score: row.score,
    lead: row.lead,
    openTasks: row.open_tasks,
    budget: toNumber(row.budget),
    created_at: row.created_at,
    updated_at: row.updated_at,
  }))
}

export async function getTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, department:departments(name)')
    .order('date', { ascending: false })

  if (error) throw error
  return (data || []).map((row: TransactionRow): Transaction => ({
    id: row.id,
    description: row.description,
    department_id: row.department_id,
    amount: toNumber(row.amount),
    type: row.type,
    status: row.status,
    date: row.date,
    created_at: row.created_at,
    updated_at: row.updated_at,
    department: row.department ?? undefined,
  }))
}

export async function getKpis(): Promise<ComputedKpis> {
  const [txRes, deptRes] = await Promise.all([
    supabase.from('transactions').select('amount, type, status, date'),
    supabase.from('departments').select('*'),
  ])

  if (txRes.error) throw txRes.error
  if (deptRes.error) throw deptRes.error

  const transactions = (txRes.data || []) as TransactionRow[]
  const departments = (deptRes.data || []) as DepartmentRow[]

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const mtdTx = transactions.filter((t) => {
    const d = new Date(t.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  const revenueMtd = mtdTx
    .filter((t) => t.type === 'revenue')
    .reduce((sum, t) => sum + toNumber(t.amount), 0)

  const expensesMtd = mtdTx
    .filter((t) => t.type === 'expense' || t.type === 'payroll')
    .reduce((sum, t) => sum + Math.abs(toNumber(t.amount)), 0)

  const documentedRevenue = transactions
    .filter((t) => t.type === 'revenue' && t.status === 'documented')
    .reduce((sum, t) => sum + toNumber(t.amount), 0)

  const documentedExpenses = transactions
    .filter((t) => (t.type === 'expense' || t.type === 'payroll') && t.status === 'documented')
    .reduce((sum, t) => sum + Math.abs(toNumber(t.amount)), 0)

  const cashBalance = documentedRevenue - documentedExpenses
  const netMargin = revenueMtd > 0 ? ((revenueMtd - expensesMtd) / revenueMtd) * 100 : 0

  return {
    revenueMtd,
    expensesMtd,
    netMargin,
    cashBalance,
    activeDepartments: departments.filter((d) => d.status !== 'idle').length,
    totalDepartments: departments.length,
    transactionVolume: transactions.length,
  }
}

export async function getActivityFeed(): Promise<ActivityEntry[]> {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw error

  if (!data || data.length === 0) {
    return []
  }

  return data.map((row: AuditLogRow): ActivityEntry => ({
    id: row.id,
    time: new Date(row.created_at).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    actor: row.actor || 'System',
    action: row.action || 'performed action',
    target: row.target ?? undefined,
    type: row.type || 'system',
  }))
}

export function getTransactionTruthBadge(status: Transaction['status']): {
  label: string
  variant: 'success' | 'warning' | 'danger' | 'info' | 'muted'
} {
  switch (status) {
    case 'documented':
      return { label: 'DOCUMENTED', variant: 'success' }
    case 'pending':
      return { label: 'PENDING', variant: 'warning' }
    case 'flagged':
      return { label: 'FLAGGED', variant: 'danger' }
    case 'cleared':
    default:
      return { label: 'CLEARED', variant: 'info' }
  }
}
