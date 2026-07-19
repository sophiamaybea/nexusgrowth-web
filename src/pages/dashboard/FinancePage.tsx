import { useEffect, useState } from 'react'
import { Panel } from '../../components/ui/Panel'
import { KpiCard } from '../../components/ui/KpiCard'
import { Badge } from '../../components/ui/Badge'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { getTransactions, getKpis, getTransactionTruthBadge } from '../../services/dashboard'
import type { Transaction, ComputedKpis } from '../../types/dashboard'

type TxCategory = 'all' | 'revenue' | 'expense' | 'payroll'

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

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [kpis, setKpis] = useState<ComputedKpis | null>(null)
  const [txFilter, setTxFilter] = useState<TxCategory>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [txData, kpiData] = await Promise.all([
          getTransactions(),
          getKpis(),
        ])
        setTransactions(txData)
        setKpis(kpiData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredTx = transactions.filter((t) => txFilter === 'all' || t.type === txFilter)

  const treasuryAllocation = kpis
    ? [
        { label: 'Operating Reserve', pct: kpis.cashBalance > 0 ? 38 : 20, color: 'bg-nexus-accent' },
        { label: 'Growth Investment', pct: kpis.cashBalance > 0 ? 28 : 15, color: 'bg-nexus-success' },
        { label: 'Payroll Float', pct: 20, color: 'bg-nexus-warning' },
        { label: 'Emergency Buffer', pct: kpis.cashBalance > 0 ? 14 : 35, color: 'bg-nexus-textMuted' },
      ]
    : []

  const spendByDept = transactions
    .filter((t) => t.type === 'expense' || t.type === 'payroll')
    .reduce<Record<string, number>>((acc, t) => {
      const dept = t.department?.name || 'Unknown'
      acc[dept] = (acc[dept] || 0) + Math.abs(Number(t.amount))
      return acc
    }, {})

  const spendControls = Object.entries(spendByDept)
    .map(([dept, used]) => ({ dept, used: Math.round(used / 1000), limit: 100 }))
    .slice(0, 3)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-semibold text-nexus-text">Finance Overview</h1>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-nexus-danger/10 border border-nexus-danger/30 text-nexus-danger text-xs">
          {error}
        </div>
      )}

      {/* Cash Balance Hero */}
      {loading ? (
        <div className="p-8 rounded-xl bg-nexus-surface border border-nexus-border text-center">
          <span className="text-nexus-textMuted text-sm">Loading cash balance...</span>
        </div>
      ) : kpis && (
        <div className="p-6 rounded-xl bg-nexus-surface border border-nexus-border">
          <p className="text-nexus-textMuted text-xs uppercase tracking-widest mb-2">Real Cash Balance</p>
          <p className={`text-4xl font-semibold font-body tabular-nums ${kpis.cashBalance >= 0 ? 'text-nexus-text' : 'text-nexus-danger'}`}>
            {formatCurrency(kpis.cashBalance)}
          </p>
          <p className="text-nexus-textMuted text-xs mt-2">
            Sum of documented revenue minus documented expenses
          </p>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {kpis ? (
          <>
            <KpiCard label="Revenue MTD" value={formatCurrency(kpis.revenueMtd)} trend={12} status="healthy" />
            <KpiCard label="Expenses MTD" value={formatCurrency(kpis.expensesMtd)} trend={5} status="healthy" />
            <KpiCard label="Net Margin" value={`${kpis.netMargin.toFixed(1)}%`} trend={3} status="healthy" />
            <KpiCard label="Transaction Volume" value={String(kpis.transactionVolume)} trend={8} status="healthy" />
          </>
        ) : (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="kpi-card animate-pulse bg-nexus-muted/30" />
          ))
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Transactions */}
        <div className="xl:col-span-2">
          <Panel
            title="Recent Transactions"
            titleRight={
              <div className="flex gap-1.5">
                {(['all', 'revenue', 'expense', 'payroll'] as TxCategory[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setTxFilter(c)}
                    className={`text-[11px] px-2.5 py-1 rounded-md capitalize transition-colors ${
                      txFilter === c
                        ? 'bg-nexus-accent/20 text-nexus-accent'
                        : 'text-nexus-textMuted hover:text-nexus-text'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            }
          >
            {loading ? (
              <div className="text-nexus-textMuted text-xs py-8 text-center">Loading transactions...</div>
            ) : filteredTx.length === 0 ? (
              <div className="text-nexus-textMuted text-xs py-8 text-center">No transactions found.</div>
            ) : (
              <div className="space-y-2">
                {filteredTx.map((tx) => {
                  const truthBadge = getTransactionTruthBadge(tx.status)
                  return (
                    <div key={tx.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-nexus-surface border border-nexus-border">
                      <div>
                        <p className="text-sm text-nexus-text">{tx.description}</p>
                        <p className="text-[11px] text-nexus-textMuted">
                          {tx.department?.name || 'Unassigned'} · {tx.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge label={truthBadge.label} variant={truthBadge.variant} />
                        <span
                          className={`text-sm font-mono font-medium ${
                            tx.amount > 0 ? 'text-nexus-success' : 'text-nexus-danger'
                          }`}
                        >
                          {formatCurrency(tx.amount)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Panel>
        </div>

        {/* Side panels */}
        <div className="space-y-4">
          <Panel title="Treasury Allocation">
            {kpis ? (
              <div className="space-y-3">
                {treasuryAllocation.map((t) => (
                  <div key={t.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] text-nexus-textMuted">{t.label}</span>
                      <span className="text-[11px] text-nexus-text font-medium">{t.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-nexus-muted rounded-full overflow-hidden">
                      <div className={`h-full ${t.color} rounded-full`} style={{ width: `${t.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-nexus-textMuted text-xs py-4 text-center">Loading...</div>
            )}
          </Panel>

          <Panel title="Spend Controls">
            {spendControls.length === 0 ? (
              <div className="text-nexus-textMuted text-xs py-4 text-center">No spend data.</div>
            ) : (
              <div className="space-y-2">
                {spendControls.map((s) => (
                  <div key={s.dept}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] text-nexus-textMuted">{s.dept}</span>
                      <span className={`text-[11px] font-medium ${
                        s.used / s.limit > 0.8 ? 'text-nexus-warning' : 'text-nexus-text'
                      }`}>£{s.used}K / £{s.limit}K</span>
                    </div>
                    <div className="h-1.5 bg-nexus-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          s.used / s.limit > 0.8 ? 'bg-nexus-warning' : 'bg-nexus-accent'
                        }`}
                        style={{ width: `${(s.used / s.limit) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
