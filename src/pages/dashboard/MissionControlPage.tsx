import { KpiCard } from '../../components/ui/KpiCard'
import { Panel } from '../../components/ui/Panel'
import { DeptHealthCard } from '../../components/dashboard/DeptHealthCard'
import { ActivityItem } from '../../components/dashboard/ActivityItem'
import { kpiData, deptHealth, activityFeed } from '../../data/dashboardSample'
import { RefreshCw } from 'lucide-react'

export default function MissionControlPage() {
  const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-semibold text-nexus-text">Mission Control</h1>
          <p className="text-nexus-textMuted text-xs mt-0.5">Real-time operational overview — {now}</p>
        </div>
        <button className="flex items-center gap-1.5 text-nexus-textMuted hover:text-nexus-text text-xs transition-colors">
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpiData.map(k => (
          <KpiCard key={k.label} {...k} truthStatus={k.truthStatus} evidence={k.evidence} />
        ))}
      </div>

      {/* Middle row: dept health + activity */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Dept health grid */}
        <Panel title="Department Health" className="xl:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {deptHealth.map(d => (
              <DeptHealthCard key={d.name} dept={d} />
            ))}
          </div>
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
          <div className="divide-y divide-nexus-border/30">
            {activityFeed.map(e => (
              <ActivityItem key={e.id} entry={e} />
            ))}
          </div>
        </Panel>
      </div>

      {/* Bottom: quick-action row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Panel title="Pending Approvals">
          <div className="space-y-2">
            {[{ title: 'PR #42 — KPI dashboard', by: 'Open Claw', age: '2h' },
              { title: 'Budget variance — Infra', by: 'Finance', age: '4h' },
              { title: 'New client contract',     by: 'Marcus',  age: '1d' }].map(a => (
              <div key={a.title} className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-nexus-text">{a.title}</p>
                  <p className="text-[11px] text-nexus-textMuted">by {a.by}</p>
                </div>
                <span className="text-[10px] text-nexus-textMuted">{a.age}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Safety Alerts">
          <div className="space-y-2">
            {[{ msg: 'Finance budget variance +18%', level: 'warning' as const },
              { msg: 'Staging deploy pending review', level: 'info' as const }].map(a => (
              <div key={a.msg} className="flex items-start gap-2">
                <span className={`status-dot mt-1.5 ${a.level === 'warning' ? 'warning' : 'idle'}`} />
                <span className="text-xs text-nexus-textMuted">{a.msg}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="System Health">
          <div className="space-y-2">
            {[{ name: 'API Gateway',     ok: true },
              { name: 'Agent Runtime',   ok: true },
              { name: 'Database',        ok: true },
              { name: 'CDN',             ok: true },
              { name: 'Finance Service', ok: false }].map(s => (
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
