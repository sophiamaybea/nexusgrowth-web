import { Panel } from '../../components/ui/Panel'

export default function ServicesPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24 space-y-12">
      <div>
        <p className="text-nexus-textMuted text-xs uppercase tracking-widest mb-3">What we offer</p>
        <h1 className="font-display text-4xl font-bold text-nexus-text">Services</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[['AI Strategy & Advisory','Deep growth strategy built on proprietary intelligence models.'],
          ['Autonomous Execution','Agent-powered campaigns, pipelines and operations.'],
          ['Intelligence Platform','Real-time insight layer across your entire business.'],
          ['Governance & Safety','Compliance, audit, and risk control baked in.']].map(([t,d])=>(
          <Panel key={t} title={t}><p className="text-nexus-textMuted text-sm">{d}</p></Panel>
        ))}
      </div>
    </div>
  )
}
