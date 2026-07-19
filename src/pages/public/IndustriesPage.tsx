import { Panel } from '../../components/ui/Panel'

export default function IndustriesPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24 space-y-12">
      <div>
        <p className="text-nexus-textMuted text-xs uppercase tracking-widest mb-3">Where we operate</p>
        <h1 className="font-display text-4xl font-bold text-nexus-text">Industries</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {['Financial Services','Professional Services','Technology & SaaS','Healthcare & Life Sciences','Real Estate','Energy & Infrastructure'].map(ind=>(
          <Panel key={ind}><p className="font-medium text-nexus-text">{ind}</p></Panel>
        ))}
      </div>
    </div>
  )
}
