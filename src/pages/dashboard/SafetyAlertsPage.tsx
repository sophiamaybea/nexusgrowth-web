import { Panel } from '../../components/ui/Panel'
import { Badge } from '../../components/ui/Badge'

export default function SafetyAlertsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-display font-semibold text-nexus-text">Safety Alerts</h1>
      <Panel title="Active Alerts">
        <div className="space-y-3">
          {[{ msg:'Finance budget variance +18% above plan', sev:'warning' as const },
            { msg:'Staging deployment pending CEO sign-off',  sev:'info' as const }].map((a,i)=>(
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-nexus-surface border border-nexus-border">
              <span className={`status-dot mt-1.5 ${a.sev}`} />
              <div>
                <p className="text-sm text-nexus-text">{a.msg}</p>
                <Badge label={a.sev.toUpperCase()} variant={a.sev} />
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
