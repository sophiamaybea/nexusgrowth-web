import type { ActivityEntry } from '../components/dashboard/ActivityItem'
import type { DeptHealth } from '../components/dashboard/DeptHealthCard'
import type { TruthStatus } from '../lib/truthState'

export const kpiData = [
  { label: 'Revenue MTD',      value: '£2.4M',  trend: 12,   status: 'healthy'  as const, truthStatus: 'DOCUMENTED'               as TruthStatus, evidence: 'Sum of cleared revenue Jul' },
  { label: 'Active Clients',   value: '47',     trend: 6,    status: 'healthy'  as const, truthStatus: 'DOCUMENTED'               as TruthStatus, evidence: 'CRM active account count' },
  { label: 'Open Approvals',   value: '8',      trend: -3,   status: 'warning'  as const, truthStatus: 'DOCUMENTED'               as TruthStatus, evidence: 'Approvals queue table' },
  { label: 'Agent Tasks',      value: '124',    trend: 18,   status: 'healthy'  as const, truthStatus: 'DOCUMENTED'               as TruthStatus, evidence: 'Agent runtime task ledger' },
  { label: 'Safety Alerts',    value: '2',      trend: 0,    status: 'warning'  as const, truthStatus: 'DOCUMENTED'               as TruthStatus, evidence: 'Audit log risk events' },
  { label: 'Pipeline Value',   value: '£18.6M', trend: 22,   status: 'healthy'  as const, truthStatus: 'PROJECTION'              as TruthStatus, evidence: 'Weighted pipeline forecast' },
]

export const deptHealth: DeptHealth[] = [
  { name: 'Strategy & Growth',  status: 'healthy',  score: 91, lead: 'Aria',    openTasks: 4 },
  { name: 'Client Success',     status: 'healthy',  score: 87, lead: 'Marcus',  openTasks: 7 },
  { name: 'Finance & Ops',      status: 'warning',  score: 63, lead: 'Priya',   openTasks: 12 },
  { name: 'Technology',         status: 'healthy',  score: 95, lead: 'Leon',    openTasks: 3 },
  { name: 'Intelligence (AI)',  status: 'healthy',  score: 98, lead: 'Open Claw', openTasks: 31 },
  { name: 'Compliance & Legal', status: 'idle',     score: 50, lead: 'Diana',   openTasks: 2 },
]

export const activityFeed: ActivityEntry[] = [
  { id:'1', time:'14:37', actor:'Open Claw',      action:'committed branch',       target:'feature/finance-module',         type:'agent' },
  { id:'2', time:'14:29', actor:'System',         action:'backup completed',       target:'nexusgrowth-web @ staging',      type:'system' },
  { id:'3', time:'14:21', actor:'Marcus Chen',    action:'approved proposal',      target:'Client: Atlas Dynamics Q3',      type:'human' },
  { id:'4', time:'13:58', actor:'Finance Dept',   action:'flagged variance',       target:'Budget line: Infrastructure',    type:'alert' },
  { id:'5', time:'13:44', actor:'Open Claw',      action:'opened PR #42',          target:'feat: KPI dashboard wiring',     type:'agent' },
  { id:'6', time:'13:30', actor:'System',         action:'auto-scaled agent pool', target:'Intelligence department x3',     type:'system' },
  { id:'7', time:'12:55', actor:'Aria Nakamura',  action:'updated strategy deck',  target:'NexusGrowth Q4 2024',           type:'human' },
  { id:'8', time:'12:10', actor:'Open Claw',      action:'QA passed',              target:'nexusgrowth-task-engine v0.3',   type:'agent' },
]
