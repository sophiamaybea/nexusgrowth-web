import { NavLink } from 'react-router-dom'
import { ArrowRight, Zap, Shield, Brain, TrendingUp } from 'lucide-react'

const SERVICES = [
  { icon: Brain,      title: 'AI Strategy',    desc: 'Machine-precision growth strategy built and executed by autonomous agents.' },
  { icon: TrendingUp, title: 'Scale Engine',   desc: 'Compounding growth infrastructure that accelerates with every iteration.' },
  { icon: Shield,     title: 'Risk Control',   desc: 'Real-time compliance, safety, and governance layer baked into every workflow.' },
  { icon: Zap,        title: 'Speed to Value', desc: 'From brief to execution in days, not quarters.' },
]

const STATS = [
  { value: '£180M+', label: 'Client pipeline generated' },
  { value: '47',     label: 'Active enterprise clients' },
  { value: '98%',    label: 'Client retention rate' },
  { value: '4.2×',   label: 'Average ROI multiplier' },
]

export default function HomePage() {
  return (
    <div className="relative">
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center bg-hero-gradient overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(108,99,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,1) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-nexus-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-nexus-gold/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-3xl">
            {/* Pre-headline badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-nexus-accent/30 bg-nexus-accent/10 mb-8">
              <span className="status-dot healthy animate-pulse-slow" />
              <span className="text-nexus-accentLt text-xs font-medium tracking-wide">Powered by Open Claw — Autonomous AI Agency</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl md:text-6xl xl:text-7xl font-bold leading-[1.06] text-nexus-text mb-6">
              Intelligent{' '}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #6C63FF 0%, #C9A84C 100%)' }}>
                Growth
              </span>
              <br />
              Infrastructure
            </h1>

            {/* Subheadline */}
            <p className="text-nexus-textMuted text-lg md:text-xl leading-relaxed mb-10 max-w-2xl">
              NexusGrowth deploys autonomous AI systems across your entire growth stack —
              strategy, execution, intelligence and governance — compounding performance
              at machine speed.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <NavLink to="/contact" className="btn-gold text-base px-8 py-3 flex items-center gap-2">
                Request Access <ArrowRight size={16} />
              </NavLink>
              <NavLink to="/services" className="btn-ghost text-base px-8 py-3">
                See How It Works
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────── */}
      <section className="border-y border-nexus-border bg-nexus-deep">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl md:text-4xl font-bold text-nexus-text mb-1">{s.value}</p>
              <p className="text-nexus-textMuted text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="mb-14">
          <p className="text-nexus-textMuted text-xs uppercase tracking-widest mb-3">What we do</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-nexus-text">The Growth Stack</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {SERVICES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-panel p-6 flex flex-col gap-4 group hover:border-nexus-accent/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-nexus-accent/10 border border-nexus-accent/20 flex items-center justify-center group-hover:bg-nexus-accent/20 transition-colors">
                <Icon size={18} className="text-nexus-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-nexus-text mb-2">{title}</h3>
                <p className="text-nexus-textMuted text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BAND ─────────────────────────────────────── */}
      <section className="border-t border-nexus-border bg-nexus-deep">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-nexus-text mb-4">
            Ready to compound your growth?
          </h2>
          <p className="text-nexus-textMuted text-lg mb-8 max-w-xl mx-auto">
            Join 47 enterprise clients already scaling with NexusGrowth.
          </p>
          <NavLink to="/contact" className="btn-gold text-base px-10 py-3.5 inline-flex items-center gap-2">
            Get Started <ArrowRight size={16} />
          </NavLink>
        </div>
      </section>
    </div>
  )
}
