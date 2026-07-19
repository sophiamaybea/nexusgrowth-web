import { useEffect, useState } from 'react'
import { Panel } from '../../components/ui/Panel'
import { TruthBadge } from '../../components/ui/TruthBadge'
import { DeptHealthCard } from '../../components/dashboard/DeptHealthCard'
import { getDepartments } from '../../services/dashboard'
import type { Department } from '../../types/dashboard'

function formatCurrency(value: number): string {
  const formatted = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(value))
  return `£${formatted}`
}

export default function DeptPerformancePage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await getDepartments()
        setDepartments(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load departments')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalBudget = departments.reduce((sum, d) => sum + Number(d.budget ?? 0), 0)
  const totalEarned = departments.reduce((sum, d) => sum + Number(d.earned ?? 0), 0)
  const overallPct = totalBudget > 0 ? Math.round((totalEarned / totalBudget) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-semibold text-nexus-text">Department Performance</h1>
        <span className="text-[11px] text-nexus-textMuted flex items-center gap-1.5">
          All figures <TruthBadge tier="verified" />
        </span>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-nexus-danger/10 border border-nexus-danger/30 text-nexus-danger text-xs">
          {error}
        </div>
      )}

      {/* Portfolio budget vs earned */}
      <Panel title="Portfolio Budget vs Earned">
        {loading ? (
          <div className="text-nexus-textMuted text-sm py-8 text-center">Loading departments…</div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] text-nexus-textMuted uppercase tracking-wider mb-1">Total Budget</p>
                <p className="text-lg font-mono font-semibold text-nexus-text">{formatCurrency(totalBudget)}</p>
              </div>
              <div>
                <p className="text-[10px] text-nexus-textMuted uppercase tracking-wider mb-1">Total Earned</p>
                <p className="text-lg font-mono font-semibold text-nexus-success">{formatCurrency(totalEarned)}</p>
              </div>
              <div>
                <p className="text-[10px] text-nexus-textMuted uppercase tracking-wider mb-1">Realised</p>
                <p className="text-lg font-mono font-semibold text-nexus-text">{overallPct}%</p>
              </div>
            </div>
            <div className="w-full h-2.5 bg-nexus-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${overallPct >= 90 ? 'bg-nexus-success' : overallPct >= 60 ? 'bg-nexus-warning' : 'bg-nexus-danger'}`}
                style={{ width: `${Math.min(100, overallPct)}%` }}
              />
            </div>
          </div>
        )}
      </Panel>

      <Panel title="All Departments">
        {loading ? (
          <div className="text-nexus-textMuted text-sm py-8 text-center">Loading departments…</div>
        ) : departments.length === 0 ? (
          <div className="text-nexus-textMuted text-sm py-8 text-center">No departments found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {departments.map(d => <DeptHealthCard key={d.id} dept={d} />)}
          </div>
        )}
      </Panel>
    </div>
  )
}
