import { Panel } from '../../components/ui/Panel'

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-display font-semibold text-nexus-text">Reports Inbox</h1>
      <Panel title="Incoming Reports">
        <div className="space-y-2">
          {[{title:'Q3 Revenue Summary',   from:'Finance',   date:'Today'},
            {title:'Client NPS Results',   from:'Client Success', date:'Yesterday'},
            {title:'AI Agent Performance', from:'Open Claw', date:'2 days ago'}].map(r=>(
            <div key={r.title} className="flex items-center justify-between p-3 rounded-lg bg-nexus-surface border border-nexus-border">
              <div>
                <p className="text-sm text-nexus-text">{r.title}</p>
                <p className="text-[11px] text-nexus-textMuted">from {r.from} · {r.date}</p>
              </div>
              <button className="btn-ghost text-xs px-3 py-1.5">Open</button>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
