import { NavLink } from 'react-router-dom'
import { Check } from 'lucide-react'

const PLANS = [
  { name:'Foundation', price:'£4,500', period:'/mo', features:['AI strategy advisory','1 department','Quarterly reporting','Dedicated agent'], highlight: false },
  { name:'Growth',     price:'£12,000',period:'/mo', features:['All Foundation features','3 departments','Real-time dashboard','Priority support','Monthly exec review'], highlight: true },
  { name:'Enterprise', price:'Custom', period:'',    features:['Unlimited departments','Custom AI build','On-site deployment','Dedicated CTO','SLA guarantee'], highlight: false },
]

export default function PricingPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24 space-y-12">
      <div className="text-center">
        <p className="text-nexus-textMuted text-xs uppercase tracking-widest mb-3">Transparent pricing</p>
        <h1 className="font-display text-4xl font-bold text-nexus-text mb-4">Investment</h1>
        <p className="text-nexus-textMuted max-w-xl mx-auto">Clear, value-aligned pricing for organisations serious about compound growth.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map(p=>(
          <div key={p.name} className={`glass-panel p-8 flex flex-col gap-6 ${p.highlight ? 'border-nexus-accent/50 shadow-accent' : ''}`}>
            <div>
              <h2 className="font-display text-xl font-semibold text-nexus-text">{p.name}</h2>
              <div className="flex items-end gap-1 mt-2">
                <span className="text-3xl font-bold text-nexus-text">{p.price}</span>
                <span className="text-nexus-textMuted text-sm mb-1">{p.period}</span>
              </div>
            </div>
            <ul className="space-y-2 flex-1">
              {p.features.map(f=>(
                <li key={f} className="flex items-center gap-2 text-sm text-nexus-textMuted">
                  <Check size={13} className="text-nexus-success shrink-0" />{f}
                </li>
              ))}
            </ul>
            <NavLink to="/contact" className={p.highlight ? 'btn-gold text-center' : 'btn-ghost text-center'}>
              Get Started
            </NavLink>
          </div>
        ))}
      </div>
    </div>
  )
}
