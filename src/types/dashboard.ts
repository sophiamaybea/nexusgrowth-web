export interface Department {
  id: string
  name: string
  status: 'healthy' | 'warning' | 'critical' | 'idle'
  score: number
  lead: string
  openTasks: number
  budget: number
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  description: string
  department_id: string | null
  amount: number
  type: 'revenue' | 'expense' | 'payroll'
  status: 'cleared' | 'pending' | 'documented' | 'flagged'
  date: string
  created_at: string
  updated_at: string
  department?: { name: string }
}

export interface ComputedKpis {
  revenueMtd: number
  expensesMtd: number
  netMargin: number
  cashBalance: number
  activeDepartments: number
  totalDepartments: number
  transactionVolume: number
}

export interface ActivityEntry {
  id: string
  time: string
  actor: string
  action: string
  target?: string
  type: 'agent' | 'system' | 'human' | 'alert'
}
