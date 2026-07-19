import { Panel } from '../../components/ui/Panel'
import { KpiCard } from '../../components/ui/KpiCard'

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-display font-semibold text-nexus-text">Finance Overview</h1>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard label="Revenue MTD" value="£2.4M" trend={12} status="healthy" />
        <KpiCard label="Expenses MTD" value="£890K" trend={5} status="healthy" />
        <KpiCard label="Net Margin" value="62.9%" trend={3} status="healthy" />
        <KpiCard label="Cash Position" value="£4.1M" trend={-2} status="warning" />
      </div>
      <Panel title="Finance Detail — Coming Soon">
        <p className="text-nexus-textMuted text-sm">Full P&L, cash flow, and forecast modules are in development.</p>
      </Panel>
    </div>
  )
}
