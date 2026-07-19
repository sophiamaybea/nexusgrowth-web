import { Panel } from '../../components/ui/Panel'
import { DeptHealthCard } from '../../components/dashboard/DeptHealthCard'
import { deptHealth } from '../../data/dashboardSample'

export default function DeptPerformancePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-display font-semibold text-nexus-text">Department Performance</h1>
      <Panel title="All Departments">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {deptHealth.map(d => <DeptHealthCard key={d.name} dept={d} />)}
        </div>
      </Panel>
    </div>
  )
}
