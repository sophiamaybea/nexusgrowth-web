import { Outlet, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { to: '/services',     label: 'Services' },
  { to: '/industries',   label: 'Industries' },
  { to: '/case-studies', label: 'Case Studies' },
  { to: '/pricing',      label: 'Pricing' },
  { to: '/about',        label: 'About' },
  { to: '/contact',      label: 'Contact' },
]

export default function PublicLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-nexus-black">
      {/* Top navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-nexus-border/60 bg-nexus-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-md bg-nexus-accent/20 border border-nexus-accent/40 flex items-center justify-center">
              <span className="text-nexus-accent font-display font-bold text-sm">N</span>
            </div>
            <span className="font-display font-semibold text-nexus-text tracking-wide text-lg">
              Nexus<span className="text-nexus-accent">Growth</span>
            </span>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV.map(n => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <NavLink to="/dashboard" className="text-nexus-textMuted hover:text-nexus-text text-sm transition-colors">
              Dashboard
            </NavLink>
            <NavLink to="/contact" className="btn-gold text-sm px-4 py-2">
              Get Started
            </NavLink>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-nexus-textMuted hover:text-nexus-text"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile nav */}
        {open && (
          <div className="md:hidden border-t border-nexus-border bg-nexus-surface px-6 py-4 flex flex-col gap-4">
            {NAV.map(n => (
              <NavLink
                key={n.to}
                to={n.to}
                className="nav-link"
                onClick={() => setOpen(false)}
              >
                {n.label}
              </NavLink>
            ))}
            <NavLink to="/contact" className="btn-gold text-sm text-center" onClick={() => setOpen(false)}>
              Get Started
            </NavLink>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-nexus-border bg-nexus-deep mt-24">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <span className="font-display font-semibold text-nexus-text text-lg">
              Nexus<span className="text-nexus-accent">Growth</span>
            </span>
            <p className="text-nexus-textMuted text-sm mt-3 leading-relaxed">
              Intelligent growth infrastructure for enterprise.
            </p>
          </div>
          {[['Services', ['Strategy','Execution','Intelligence','Automation']],
            ['Company', ['About','Case Studies','Pricing','Contact']],
            ['Legal', ['Privacy','Terms','Security','Compliance']]].map(([title, links]) => (
            <div key={title as string}>
              <p className="text-nexus-textMuted text-xs uppercase tracking-widest mb-4">{title as string}</p>
              <ul className="space-y-2">
                {(links as string[]).map(l => (
                  <li key={l}>
                    <span className="text-nexus-textMuted hover:text-nexus-text text-sm cursor-pointer transition-colors">{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-nexus-border px-6 py-4 max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-nexus-textMuted text-xs">© 2024 NexusGrowth. All rights reserved.</span>
          <span className="text-nexus-textMuted text-xs">Built by Open Claw</span>
        </div>
      </footer>
    </div>
  )
}
