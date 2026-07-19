import { useState } from 'react'
import { Panel } from '../../components/ui/Panel'
import { KpiCard } from '../../components/ui/KpiCard'
import { Badge } from '../../components/ui/Badge'
import { TruthBadge } from '../../components/ui/TruthBadge'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { TruthStatus } from '../../lib/truthState'

type TxCategory = 'all' | 'revenue' | 'expense' | 'payroll'

type Tx = {
  id: string
  date: string
  desc: string
  dept: string
  amount: string
  type: TxCategory
  status: 'cleared' | 'pending'
  truth: TruthStatus
  evidence: string
}

const TRANSACTIONS: Tx[] = [
  { id: 'tx01', date: '18 Jul', desc: 'Atlas Dynamics — retainer',      dept: 'Client Success', amount: '+£48,000', type: 'revenue' as TxCategory,  status: 'cleared', truth: 'DOCUMENTED',               evidence: 'Bank statement ref ST-2025-0818-ATL' },
  { id: 'tx02', date: '17 Jul', desc: 'AWS infrastructure — rack Q3',   dept: 'Engineering',    amount: '-£22,400', type: 'expense' as TxCategory,  status: 'cleared', truth: 'DOCUMENTED',               evidence: 'AWS invoice INV-7741' },
  { id: 'tx03', date: '17 Jul', desc: 'Payroll — July cycle',           dept: 'Finance',        amount: '-£214,000',type: 'payroll' as TxCategory,  status: 'cleared', truth: 'DOCUMENTED',               evidence: 'HMRC RTI submission Jul' },
  { id: 'tx04', date: '16 Jul', desc: 'Meridian Capital — milestone',   dept: 'Finance',        amount: '+£120,000',type: 'revenue' as TxCategory,  status: 'cleared', truth: 'DOCUMENTED',               evidence: 'Signed milestone acceptance MS-12' },
  { id: 'tx05', date: '15 Jul', desc: 'Legal retainer — Priya Nair LLP',dept: 'Legal',          amount: '-£8,500',  type: 'expense' as TxCategory,  status: 'cleared', truth: 'DOCUMENTED',               evidence: 'Engagement letter EL-229' },
  { id: 'tx06', date: '14 Jul', desc: 'SaaS tooling — Figma, Linear',   dept: 'Product',        amount: '-£1,240',  type: 'expense' as TxCategory,  status: 'cleared', truth: 'INFERRED_FROM_COMPARABLES', evidence: 'Benchmarked against 3 peer SaaS stacks' },
  { id: 'tx07', date: '13 Jul', desc: 'Greenfield Corp — project fee',  dept: 'Client Success', amount: '+£75,000', type: 'revenue' as TxCategory,  status: 'pending', truth: 'DOCUMENTED',               evidence: 'Contract CL-884 pending signature' },
]

const TREASURY = [
  { label: 'Operating Reserve',    pct: 38, color: 'bg-nexus-accent' },
  { label: 'Growth Investment',     pct: 28, color: 'bg-nexus-success' },
  { label: 'Payroll Float',         pct: 20, color: 'bg-nexus-warning' },
  { label: 'Emergency Buffer',      pct: 14, color: 'bg-nexus-textMuted' },
]

export default function FinancePage() {
  const [txFilter, setTxFilter] = useState<TxCategory>('all')

  const filteredTx = TRANSACTIONS.filter(t => txFilter === 'all' || t.type === txFilter)

  const TREASURY_TRUTH: TruthStatus = 'INFERRED_FROM_COMPARABLES'
  const SPEND_TRUTH: TruthStatus = 'INFERRED_FROM_COMPARABLES'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-semibold text-nexus-text">Finance Overview</h1>
        <span className="text-[11px] text-nexus-textMuted bg-nexus-surface border border-nexus-border rounded px-2 py-1">MOCK DATA — demo values</span>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard label="Revenue MTD"   value="£2.4M"  trend={12}  status="healthy" truthStatus="DOCUMENTED"               evidence="Sum of cleared revenue Jul" />
        <KpiCard label="Expenses MTD"  value="£890K"  trend={5}   status="healthy" truthStatus="DOCUMENTED"               evidence="Sum of cleared expenses Jul" />
        <KpiCard label="Net Margin"    value="62.9%"  trend={3}   status="healthy" truthStatus="DOCUMENTED"               evidence="Computed from documented revenue/expense" />
        <KpiCard label="Cash Position" value="£4.1M"  trend={-2}  status="warning" truthStatus="INFERRED_FROM_COMPARABLES" evidence="Bank balance extrapolated from last statement + cleared flows" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Transactions */}
        <div className="xl:col-span-2">
          <Panel
            title="Recent Transactions"
            titleRight={
              <div className="flex gap-1.5">
                {(['all','revenue','expense','payroll'] as TxCategory[]).map(c => (
                  <button
                    key={c}
                    onClick={() => setTxFilter(c)}
                    className={`text-[11px] px-2.5 py-1 rounded-md capitalize transition-colors ${
                      txFilter === c
                        ? 'bg-nexus-accent/20 text-nexus-accent'
                        : 'text-nexus-textMuted hover:text-nexus-text'
                    }`}
                  >{c}</button>
                ))}
              </div>
            }
          >
            <div className="space-y-2">
              {filteredTx.map(tx => (
                <div key={tx.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-nexus-surface border border-nexus-border">
                   <div>
                    <p className="text-sm text-nexus-text">{tx.desc}</p>
                    <p className="text-[11px] text-nexus-textMuted">{tx.dept} · {tx.date}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {tx.status === 'pending' && <Badge label="pending" variant="warning" />}
                    <span className={`text-sm font-mono font-medium ${
                      tx.amount.startsWith('+') ? 'text-nexus-success' : 'text-nexus-danger'
                    }`}>{tx.amount}</span>
                    <TruthBadge status={tx.truth} evidence={tx.evidence} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Treasury */}
        <div className="space-y-4">
          <Panel title="Treasury Allocation">
            <div className="space-y-3">
              {TREASURY.map(t => (
                <div key={t.label}>
                  <div className="flex justify-between mb-1 items-center">
                    <span className="text-[11px] text-nexus-textMuted">{t.label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-nexus-text font-medium">{t.pct}%</span>
                      <TruthBadge status={TREASURY_TRUTH} evidence="Allocation modelled from treasury policy" />
                    </div>
                  </div>
                  <div className="h-1.5 bg-nexus-muted rounded-full overflow-hidden">
                    <div className={`h-full ${t.color} rounded-full`} style={{ width: `${t.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Projected Revenue">
            <div className="space-y-2">
              {[
                { period: 'Aug 2025',  value: '£2.7M', dir: 'up' },
                { period: 'Sep 2025',  value: '£3.0M', dir: 'up' },
                { period: 'Q4 2025',   value: '£9.6M', dir: 'up' },
              ].map(r => (
                <div key={r.period} className="flex items-center justify-between p-2 rounded bg-nexus-surface border border-nexus-border">
                  <span className="text-[11px] text-nexus-textMuted">{r.period}</span>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={11} className="text-nexus-success" />
                    <span className="text-sm text-nexus-text font-medium">{r.value}</span>
                    <TruthBadge status="PROJECTION" evidence="Forecast model based on pipeline" />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Spend Controls">
            <div className="space-y-2">
              {[
                { dept: 'Engineering', used: 74, limit: 100 },
                { dept: 'Marketing',   used: 42, limit: 60 },
                { dept: 'Legal',       used: 18, limit: 25 },
              ].map(s => (
                <div key={s.dept}>
                  <div className="flex justify-between mb-1 items-center">
                    <span className="text-[11px] text-nexus-textMuted">{s.dept}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-medium ${
                        s.used / s.limit > 0.8 ? 'text-nexus-warning' : 'text-nexus-text'
                      }`}>£{s.used}K / £{s.limit}K</span>
                      <TruthBadge status={SPEND_TRUTH} evidence="Spend extrapolated from partial month actuals" />
                    </div>
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
          </Panel>
        </div>
      </div>
    </div>
  )
}
