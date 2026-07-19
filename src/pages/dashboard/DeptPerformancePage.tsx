import { useState, useMemo } from 'react'
import { Panel } from '../../components/ui/Panel'
import { DeptHealthCard } from '../../components/dashboard/DeptHealthCard'
import { deptHealth } from '../../data/dashboardSample'
import type { DeptHealth } from '../../components/dashboard/DeptHealthCard'
import { Search, ArrowUpDown } from 'lucide-react'

type StatusFilter = 'all' | DeptHealth['status']
type SortKey = 'name' | 'score' | 'openTasks'

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Healthy', value: 'healthy' },
  { label: 'Attention', value: 'warning' },
  { label: 'Idle', value: 'idle' },
  { label: 'Critical', value: 'critical' },
]

export default function DeptPerformancePage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('score')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const filtered = useMemo(() => {
    let data = [...deptHealth]
    if (statusFilter !== 'all') data = data.filter(d => d.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      data = data.filter(d =>
        d.name.toLowerCase().includes(q) || d.lead.toLowerCase().includes(q)
      )
    }
    data.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return data
  }, [search, statusFilter, sortKey, sortDir])

  const avgScore = deptHealth.length
    ? Math.round(deptHealth.reduce((s, d) => s + d.score, 0) / deptHealth.length)
    : 0
  const totalTasks = deptHealth.reduce((s, d) => s + d.openTasks, 0)
  const healthyCount = deptHealth.filter(d => d.status === 'healthy').length
  const atRiskCount = deptHealth.filter(d => d.status === 'warning' || d.status === 'critical').length

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-display font-semibold text-nexus-text">Department Performance</h1>
        <p className="text-nexus-textMuted text-xs mt-0.5">Health scores, task load, and operational status across all departments</p>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Avg Health Score', value: `${avgScore}%`, color: avgScore >= 80 ? 'text-nexus-success' : 'text-nexus-warning' },
          { label: 'Total Open Tasks', value: String(totalTasks), color: 'text-nexus-text' },
          { label: 'Healthy Depts',    value: String(healthyCount), color: 'text-nexus-success' },
          { label: 'Needs Attention',  value: String(atRiskCount),  color: atRiskCount > 0 ? 'text-nexus-warning' : 'text-nexus-success' },
        ].map(m => (
          <div key={m.label} className="glass-panel p-4">
            <p className="text-nexus-textMuted text-[11px] mb-1">{m.label}</p>
            <p className={`text-2xl font-display font-semibold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-nexus-textMuted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search departments or leads…"
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-nexus-muted border border-nexus-border rounded-md text-nexus-text placeholder:text-nexus-textMuted focus:outline-none focus:border-nexus-accent"
          />
        </div>
        <div className="flex gap-1.5">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-nexus-accent text-white'
                  : 'bg-nexus-muted text-nexus-textMuted hover:text-nexus-text'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Department grid */}
        <Panel title={`Departments (${filtered.length})`} className="xl:col-span-2">
          {filtered.length === 0 ? (
            <p className="text-nexus-textMuted text-xs py-6 text-center">No departments match the current filters.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map(d => (
                <DeptHealthCard key={d.name} dept={d} />
              ))}
            </div>
          )}
        </Panel>

        {/* Score leaderboard */}
        <Panel title="Score Leaderboard">
          <div className="flex gap-2 mb-3">
            {(['score', 'openTasks', 'name'] as SortKey[]).map(k => (
              <button
                key={k}
                onClick={() => toggleSort(k)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-colors ${
                  sortKey === k
                    ? 'bg-nexus-accent/20 text-nexus-accent'
                    : 'bg-nexus-muted text-nexus-textMuted hover:text-nexus-text'
                }`}
              >
                <ArrowUpDown size={10} />
                {k === 'openTasks' ? 'Tasks' : k.charAt(0).toUpperCase() + k.slice(1)}
                {sortKey === k && <span className="text-[9px]">{sortDir === 'asc' ? '↑' : '↓'}</span>}
              </button>
            ))}
          </div>
          <div className="space-y-1">
            {[...deptHealth]
              .sort((a, b) => {
                const av = a[sortKey]; const bv = b[sortKey]
                const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number)
                return sortDir === 'asc' ? cmp : -cmp
              })
              .map((d, i) => (
                <div key={d.name} className="flex items-center gap-3 py-2 border-b border-nexus-border/40 last:border-0">
                  <span className="text-[11px] text-nexus-textMuted w-4 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-nexus-text truncate">{d.name}</p>
                    <p className="text-[10px] text-nexus-textMuted">{d.lead}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-semibold ${
                      d.status === 'healthy' ? 'text-nexus-success' :
                      d.status === 'warning' ? 'text-nexus-warning' :
                      d.status === 'critical' ? 'text-nexus-danger' :
                      'text-nexus-textMuted'
                    }`}>{d.score}</p>
                    <p className="text-[10px] text-nexus-textMuted">{d.openTasks}t</p>
                  </div>
                </div>
              ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}
