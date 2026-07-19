import { useState, useEffect, useCallback } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, TrendingUp, DollarSign, Activity,
  CheckSquare, ShieldAlert, FileText, MessageSquare,
  Brain, ExternalLink, Bell, Settings, LogOut,
  PauseCircle, StopCircle, PlayCircle, ShieldOff, AlertOctagon
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { useReAuth } from '../hooks/useReAuth'
import { ReAuthModal } from '../components/ReAuthModal'
import {
  fetchControls,
  setGlobalControl,
  setDepartmentControl,
} from '../services/overrides'
import type { DepartmentControl, ControlStatus } from '../types/safety'

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

const statusStyle: Record<ControlStatus, { label: string; dot: string; text: string }> = {
  active: { label: 'ACTIVE',     dot: 'bg-nexus-success', text: 'text-nexus-success' },
  paused: { label: 'PAUSED',     dot: 'bg-nexus-warning', text: 'text-nexus-warning' },
  killed: { label: 'HALTED',     dot: 'bg-nexus-danger',  text: 'text-nexus-danger' },
}

export default function DashboardLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const displayName = getUserDisplayName(user)
  const displayRole = getUserRole(user)

  const [controls, setControls] = useState<{ global: DepartmentControl; departments: DepartmentControl[] } | null>(null)
  const [controlsError, setControlsError] = useState<string | null>(null)
  const [controlLoading, setControlLoading] = useState(true)
  const [pendingAction, setPendingAction] = useState<{
    scope: 'global' | 'department'
    dept?: string
    status: ControlStatus
    reason: string
  } | null>(null)
  const [busy, setBusy] = useState(false)

  const reauth = useReAuth()

  const loadControls = useCallback(async () => {
    setControlLoading(true)
    setControlsError(null)
    try {
      const data = await fetchControls()
      setControls(data)
    } catch (err) {
      setControlsError(err instanceof Error ? err.message : 'Failed to load controls')
    } finally {
      setControlLoading(false)
    }
  }, [])

  useEffect(() => {
    loadControls()
  }, [loadControls])

  function handleSignOut() {
    signOut()
    navigate('/sign-in', { replace: true })
  }

  // Irreversible actions (pause/kill) require re-auth before applying.
  function requestOverride(scope: 'global' | 'department', status: ControlStatus, dept?: string) {
    if (status === 'active') return
    setPendingAction({ scope, status, dept, reason: '' })
  }

  async function confirmOverride(email: string, password: string) {
    if (!pendingAction) return false
    const ok = await reauth.handleReAuth(email, password)
    if (!ok) return false

    setBusy(true)
    try {
      const actorName = displayName
      let updated: DepartmentControl
      if (pendingAction.scope === 'global') {
        updated = await setGlobalControl(pendingAction.status, actorName, pendingAction.reason)
        setControls(prev => (prev ? { ...prev, global: updated } : prev))
      } else if (pendingAction.dept) {
        updated = await setDepartmentControl(pendingAction.dept, pendingAction.status, actorName, pendingAction.reason)
        setControls(prev =>
          prev
            ? { ...prev, departments: prev.departments.map(d => (d.dept === updated.dept ? updated : d)) }
            : prev
        )
      }
      setPendingAction(null)
      return true
    } catch (err) {
      setControlsError(err instanceof Error ? err.message : 'Override failed')
      return false
    } finally {
      setBusy(false)
    }
  }

  function resume(scope: 'global' | 'department', dept?: string) {
    setBusy(true)
    const actorName = displayName
    ;(scope === 'global'
      ? setGlobalControl('active', actorName)
      : setDepartmentControl(dept!, 'active', actorName)
    )
      .then(updated => {
        setControls(prev => {
          if (!prev) return prev
          if (scope === 'global') return { ...prev, global: updated }
          return { ...prev, departments: prev.departments.map(d => (d.dept === updated.dept ? updated : d)) }
        })
      })
      .catch(err => setControlsError(err instanceof Error ? err.message : 'Resume failed'))
      .finally(() => setBusy(false))
  }

  return (
    <div className="flex h-screen bg-nexus-black overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-nexus-border bg-nexus-deep">
        <div className="h-14 flex items-center px-5 border-b border-nexus-border">
          <span className="font-display font-semibold text-nexus-text">
            Nexus<span className="text-nexus-accent">Growth</span>
          </span>
          <span className="ml-2 text-[10px] text-nexus-textMuted uppercase tracking-widest bg-nexus-muted px-1.5 py-0.5 rounded">{displayRole}</span>
        </div>

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

        {/* CEO override controls */}
        <OverrideBar
          controls={controls}
          loading={controlLoading}
          error={controlsError}
          busy={busy}
          onRequestOverride={requestOverride}
          onResume={resume}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      <ReAuthModal
        isOpen={reauth.isReAuthModalOpen}
        onClose={reauth.closeReAuthModal}
        onConfirm={confirmOverride}
        title="CEO override — re-authentication"
        message={
          pendingAction
            ? `Applying a ${pendingAction.status === 'killed' ? 'global kill' : 'pause'} requires you to re-confirm your identity.`
            : 'This irreversible action requires you to re-confirm your identity.'
        }
      />
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

function OverrideBar({
  controls,
  loading,
  error,
  busy,
  onRequestOverride,
  onResume,
}: {
  controls: { global: DepartmentControl; departments: DepartmentControl[] } | null
  loading: boolean
  error: string | null
  busy: boolean
  onRequestOverride: (scope: 'global' | 'department', status: ControlStatus, dept?: string) => void
  onResume: (scope: 'global' | 'department', dept?: string) => void
}) {
  const globalStatus: ControlStatus = controls?.global.status ?? 'active'
  const g = statusStyle[globalStatus]

  return (
    <div className="shrink-0 border-b border-nexus-border bg-nexus-panel/60 px-6 py-3">
      {error && (
        <p className="text-[11px] text-nexus-danger mb-2">{error}</p>
      )}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Global controls */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-nexus-textMuted">Global</span>
          <span className={`flex items-center gap-1.5 text-[11px] font-semibold ${g.text}`}>
            <span className={`w-2 h-2 rounded-full ${g.dot}`} />
            {g.label}
          </span>
          <div className="flex items-center gap-1.5">
            {globalStatus === 'active' ? (
              <>
                <button
                  disabled={busy || loading}
                  onClick={() => onRequestOverride('global', 'paused')}
                  className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border border-nexus-warning/40 text-nexus-warning hover:bg-nexus-warning/10 disabled:opacity-40 transition-colors"
                >
                  <PauseCircle size={12} /> Pause All
                </button>
                <button
                  disabled={busy || loading}
                  onClick={() => onRequestOverride('global', 'killed')}
                  className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border border-nexus-danger/40 text-nexus-danger hover:bg-nexus-danger/10 disabled:opacity-40 transition-colors"
                >
                  <StopCircle size={12} /> Global Kill
                </button>
              </>
            ) : (
              <button
                disabled={busy}
                onClick={() => onResume('global')}
                className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border border-nexus-success/40 text-nexus-success hover:bg-nexus-success/10 disabled:opacity-40 transition-colors"
              >
                <PlayCircle size={12} /> Resume All
              </button>
            )}
          </div>
        </div>

        <span className="h-5 w-px bg-nexus-border" />

        {/* Per-department controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] uppercase tracking-wider text-nexus-textMuted">Departments</span>
          {loading ? (
            <span className="text-[11px] text-nexus-textMuted">loading…</span>
          ) : (
            (controls?.departments ?? []).map(d => {
              const s = statusStyle[d.status]
              return (
                <div
                  key={d.id}
                  className="flex items-center gap-1.5 pl-1.5 border-l border-nexus-border"
                >
                  <span className="text-[11px] text-nexus-textMuted">{d.dept}</span>
                  <span className={`flex items-center gap-1 text-[10px] font-semibold ${s.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                  {d.status === 'active' ? (
                    <div className="flex items-center gap-0.5">
                      <button
                        disabled={busy}
                        onClick={() => onRequestOverride('department', 'paused', d.dept!)}
                        title={`Pause ${d.dept}`}
                        className="text-nexus-warning hover:bg-nexus-warning/10 rounded p-0.5 disabled:opacity-40 transition-colors"
                      >
                        <PauseCircle size={12} />
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => onRequestOverride('department', 'killed', d.dept!)}
                        title={`Kill ${d.dept}`}
                        className="text-nexus-danger hover:bg-nexus-danger/10 rounded p-0.5 disabled:opacity-40 transition-colors"
                      >
                        <StopCircle size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      disabled={busy}
                      onClick={() => onResume('department', d.dept!)}
                      title={`Resume ${d.dept}`}
                      className="text-nexus-success hover:bg-nexus-success/10 rounded p-0.5 disabled:opacity-40 transition-colors"
                    >
                      <PlayCircle size={12} />
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>

        {globalStatus !== 'active' && (
          <span className="ml-auto flex items-center gap-1.5 text-[11px] text-nexus-danger animate-pulse-slow">
            <AlertOctagon size={13} />
            {globalStatus === 'killed' ? 'ALL OPERATIONS HALTED' : 'ALL OPERATIONS PAUSED'}
            <ShieldOff size={13} />
          </span>
        )}
      </div>
    </div>
  )
}
