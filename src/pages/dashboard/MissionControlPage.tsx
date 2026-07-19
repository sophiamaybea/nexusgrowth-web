import { useEffect, useState } from 'react'
import { KpiCard } from '../../components/ui/KpiCard'
import { Panel } from '../../components/ui/Panel'
import { DeptHealthCard } from '../../components/dashboard/DeptHealthCard'
import { ActivityItem } from '../../components/dashboard/ActivityItem'
import { RefreshCw } from 'lucide-react'
import { getDepartments, getKpis, getActivityFeed } from '../../services/dashboard'
import type { ComputedKpis, Department, ActivityEntry } from '../../types/dashboard'

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

export default function MissionControlPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [kpis, setKpis] = useState<ComputedKpis | null>(null)
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [depts, kpiData, feed] = await Promise.all([
        getDepartments(),
        getKpis(),
        getActivityFeed(),
      ])
      setDepartments(depts)
      setKpis(kpiData)
      setActivity(feed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleRefresh() {
    setRefreshing(true)
    try {
      await load()
    } finally {
      setRefreshing(false)
    }
  }

  const kpiItems = kpis
    ? [
        { label: 'Revenue MTD', value: formatCurrency(kpis.revenueMtd), trend: 12, status: 'healthy' as const },
        { label: 'Expenses MTD', value: formatCurrency(kpis.expensesMtd), trend: 5, status: 'healthy' as const },
        { label: 'Active Depts', value: String(kpis.activeDepartments), trend: 0, status: 'healthy' as const },
        { label: 'Transactions', value: String(kpis.transactionVolume), trend: 8, status: 'healthy' as const },
        { label: 'Cash Balance', value: formatCurrency(kpis.cashBalance), trend: kpis.cashBalance >= 0 ? 3 : -3, status: kpis.cashBalance >= 0 ? 'healthy' as const : 'warning' as const },
        { label: 'Dept Avg Score', value: `${departments.length > 0 ? Math.round(departments.reduce((s, d) => s + d.score, 0) / departments.length) : 0}%`, trend: 2, status: 'healthy' as const },
      ]
    : []

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-semibold text-nexus-text">Mission Control</h1>
          <p className="text-nexus-textMuted text-xs mt-0.5">Real-time operational overview</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-nexus-textMuted hover:text-nexus-text text-xs transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-nexus-danger/10 border border-nexus-danger/30 text-nexus-danger text-xs">
          {error}
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpiItems.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {/* Middle row: dept health + activity */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Dept health grid */}
        <Panel title="Department Health" className="xl:col-span-3">
          {loading ? (
            <div className="text-nexus-textMuted text-xs py-8 text-center">Loading departments...</div>
          ) : departments.length === 0 ? (
            <div className="text-nexus-textMuted text-xs py-8 text-center">No departments found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {departments.map((d) => (
                <DeptHealthCard key={d.id} dept={d} />
              ))}
            </div>
          )}
        </Panel>

        {/* Live activity */}
        <Panel
          title="Live Activity"
          className="xl:col-span-2"
          titleRight={
            <span className="flex items-center gap-1 text-[10px] text-nexus-success">
              <span className="status-dot healthy animate-pulse-slow" />
              Live
            </span>
          }
        >
          {loading ? (
            <div className="text-nexus-textMuted text-xs py-8 text-center">Loading activity...</div>
          ) : activity.length === 0 ? (
            <div className="text-nexus-textMuted text-xs py-8 text-center">No recent activity.</div>
          ) : (
            <div className="divide-y divide-nexus-border/30">
              {activity.map((e) => (
                <ActivityItem key={e.id} entry={e} />
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* Bottom: quick-action row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Panel title="Pending Approvals">
          <div className="text-nexus-textMuted text-xs py-4 text-center">No pending approvals.</div>
        </Panel>

        <Panel title="Safety Alerts">
          <div className="text-nexus-textMuted text-xs py-4 text-center">No active alerts.</div>
        </Panel>

        <Panel title="System Health">
          <div className="space-y-2">
            {[
              { name: 'API Gateway', ok: true },
              { name: 'Agent Runtime', ok: true },
              { name: 'Database', ok: true },
              { name: 'CDN', ok: true },
            ].map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <span className="text-xs text-nexus-textMuted">{s.name}</span>
                <span className={`status-dot ${s.ok ? 'healthy' : 'warning'}`} />
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}
