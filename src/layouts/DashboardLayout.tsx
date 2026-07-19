import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, TrendingUp, DollarSign, Activity,
  CheckSquare, ShieldAlert, FileText, MessageSquare,
  Brain, ExternalLink, Bell, Settings, LogOut
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'

const SIDEBAR = [
  { to: '/dashboard',            label: 'Mission Control',  icon: LayoutDashboard, end: true },
  { to: '/dashboard/performance',label: 'Dept Performance', icon: TrendingUp },
  { to: '/dashboard/finance',    label: 'Finance Overview', icon: DollarSign },
  { to: '/dashboard/activity',   label: 'Activity Feed',    icon: Activity },
  { to: '/dashboard/approvals',  label: 'Approvals Queue',  icon: CheckSquare },
  { to: '/dashboard/safety',     label: 'Safety Alerts',    icon: ShieldAlert },
  { to: '/dashboard/reports',    label: 'Reports Inbox',    icon: FileText },
  { to: '/dashboard/chat',       label: 'Dept Head Chat',   icon: MessageSquare },
  { to: '/dashboard/reflection', label: 'Reflection',       icon: Brain },
]

function getUserDisplayName(user: User | null): string {
  if (!user) return 'CEO'
  const meta = user.user_metadata
  return meta?.full_name || meta?.name || user.email?.split('@')[0] || 'CEO'
}

function getUserRole(user: User | null): string {
  if (!user) return 'CEO'
  const meta = user.user_metadata
  return meta?.role || 'CEO'
}

export default function DashboardLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const displayName = getUserDisplayName(user)
  const displayRole = getUserRole(user)

  function handleSignOut() {
    signOut()
    navigate('/sign-in', { replace: true })
  }

  return (
    <div className="flex h-screen bg-nexus-black overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-nexus-border bg-nexus-deep">
        {/* Wordmark */}
        <div className="h-14 flex items-center px-5 border-b border-nexus-border">
          <span className="font-display font-semibold text-nexus-text">
            Nexus<span className="text-nexus-accent">Growth</span>
          </span>
          <span className="ml-2 text-[10px] text-nexus-textMuted uppercase tracking-widest bg-nexus-muted px-1.5 py-0.5 rounded">{displayRole}</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {SIDEBAR.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-nexus-accent/15 text-nexus-text border border-nexus-accent/20'
                    : 'text-nexus-textMuted hover:text-nexus-text hover:bg-nexus-surface'
                }`
              }
            >
              <Icon size={15} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom bar */}
        <div className="border-t border-nexus-border p-3 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-nexus-accent/20 flex items-center justify-center">
            <span className="text-nexus-accent text-xs font-semibold">
              {displayName[0]?.toUpperCase() ?? 'C'}
            </span>
          </div>
          <span className="text-nexus-textMuted text-xs flex-1 truncate">{displayName}</span>
          <button onClick={handleSignOut} title="Sign out">
            <LogOut size={13} className="text-nexus-textMuted hover:text-nexus-text cursor-pointer transition-colors" />
          </button>
          <Settings size={14} className="text-nexus-textMuted hover:text-nexus-text cursor-pointer transition-colors" />
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-nexus-border bg-nexus-deep">
          <SystemStatus />
          <div className="flex items-center gap-4">
            <NavLink to="/" className="flex items-center gap-1.5 text-nexus-textMuted hover:text-nexus-text text-xs transition-colors">
              <ExternalLink size={12} />
              Public Site
            </NavLink>
            <button className="relative text-nexus-textMuted hover:text-nexus-text">
              <Bell size={16} />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-nexus-danger rounded-full" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function SystemStatus() {
  const statuses = [
    { label: 'Systems',  status: 'healthy' as const },
    { label: 'Agents',   status: 'healthy' as const },
    { label: 'Finance',  status: 'warning' as const },
    { label: 'Security', status: 'healthy' as const },
  ]
  return (
    <div className="flex items-center gap-4">
      {statuses.map(s => (
        <div key={s.label} className="flex items-center gap-1.5">
          <span className={`status-dot ${s.status}`} />
          <span className="text-nexus-textMuted text-xs">{s.label}</span>
        </div>
      ))}
    </div>
  )
}
