import { useState } from 'react'
import { Panel } from '../../components/ui/Panel'
import { Badge } from '../../components/ui/Badge'
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react'

type Priority = 'high' | 'medium' | 'low'
type ActionType = 'code-merge' | 'budget' | 'contract' | 'deployment' | 'policy'
type DecisionState = 'pending' | 'approved' | 'rejected'

interface ApprovalItem {
  id: string
  title: string
  actionType: ActionType
  requester: string
  dept: string
  priority: Priority
  age: string
  risk: 'low' | 'medium' | 'high'
  reason: string
  owner: string
  state: DecisionState
  feedback?: string
}

const INITIAL_ITEMS: ApprovalItem[] = [
  { id: 'PR-42',  title: 'feat: KPI dashboard wiring',       actionType: 'code-merge',  requester: 'Open Claw',  dept: 'Engineering',    priority: 'high',   age: '2h',  risk: 'low',    reason: 'Wires live KPI data into Mission Control. Non-breaking, feature-flagged.',              owner: 'Zara Osei', state: 'pending' },
  { id: 'BUD-07', title: 'Budget variance — Infrastructure', actionType: 'budget',      requester: 'Marcus Webb', dept: 'Finance',        priority: 'medium', age: '4h',  risk: 'medium', reason: 'Infrastructure spend at 118% of monthly plan. Capex-driven, demand-positive.',          owner: 'Marcus Webb', state: 'pending' },
  { id: 'CNT-03', title: 'New client contract: Atlas Dyn.', actionType: 'contract',    requester: 'Marcus Webb', dept: 'Legal',          priority: 'high',   age: '1d',  risk: 'medium', reason: 'Atlas Dynamics MSA execution ready. §7.4 waiver confirmed.',                          owner: 'Priya Nair', state: 'pending' },
  { id: 'DEP-12', title: 'Staging → Production deploy',     actionType: 'deployment',  requester: 'System',      dept: 'Engineering',    priority: 'medium', age: '6h',  risk: 'low',    reason: 'Sprint 14 build fully validated. Rollback plan confirmed with engineering.',           owner: 'Zara Osei', state: 'pending' },
  { id: 'POL-04', title: 'Async stand-up policy change',    actionType: 'policy',      requester: 'Lena Park',   dept: 'Product',        priority: 'low',    age: '2d',  risk: 'low',    reason: 'Velocity data supports removing sync stand-up. Proposes async Loom-based format.',    owner: 'Lena Park', state: 'pending' },
]

const PRIORITY_VARIANT: Record<Priority, 'warning' | 'info' | 'muted'> = {
  high: 'warning', medium: 'info', low: 'muted',
}

const ACTION_LABEL: Record<ActionType, string> = {
  'code-merge': 'Code Merge', budget: 'Budget', contract: 'Contract',
  deployment: 'Deploy', policy: 'Policy',
}

export default function ApprovalsPage() {
  const [items, setItems]         = useState<ApprovalItem[]>(INITIAL_ITEMS)
  const [selected, setSelected]   = useState<ApprovalItem | null>(null)
  const [feedback, setFeedback]   = useState('')

  const pendingCount = items.filter(i => i.state === 'pending').length

  function decide(id: string, decision: 'approved' | 'rejected') {
    const note = feedback.trim() || (decision === 'approved' ? 'Approved by CEO.' : 'Rejected by CEO.')
    setItems(prev => prev.map(i => i.id === id ? { ...i, state: decision, feedback: note } : i))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, state: decision, feedback: note } : null)
    setFeedback('')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-display font-semibold text-nexus-text">Approvals Queue</h1>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3">
          <Panel title={`${pendingCount} pending approval${pendingCount !== 1 ? 's' : ''}`}>
            <div className="space-y-2">
              {items.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    selected?.id === item.id
                      ? 'bg-nexus-accent/10 border-nexus-accent/30'
                      : item.state === 'approved'
                        ? 'bg-nexus-success/5 border-nexus-success/20 opacity-70'
                        : item.state === 'rejected'
                          ? 'bg-nexus-danger/5 border-nexus-danger/20 opacity-70'
                          : 'bg-nexus-surface border-nexus-border hover:border-nexus-textMuted/30'
                  }`}
                >
                  <span className="text-[11px] font-mono text-nexus-textMuted w-16 shrink-0">{item.id}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-nexus-text truncate">{item.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] text-nexus-textMuted">{item.requester} · {item.age} ago</span>
                      <Badge label={ACTION_LABEL[item.actionType]} variant="muted" />
                      <Badge label={item.priority} variant={PRIORITY_VARIANT[item.priority]} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.state === 'approved'  && <CheckCircle2 size={14} className="text-nexus-success" />}
                    {item.state === 'rejected'  && <XCircle      size={14} className="text-nexus-danger" />}
                    {item.state === 'pending'   && <ChevronRight size={13} className="text-nexus-textMuted" />}
                  </div>
                </button>
              ))}
            </div>
          </Panel>
        </div>

        <div className="xl:col-span-2">
          <Panel title={selected ? 'Decision Card' : 'Select an item'}>
            {!selected ? (
              <p className="text-nexus-textMuted text-sm text-center py-8">Select an item from the queue to review and decide.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Request</p>
                  <p className="text-nexus-text font-medium">{selected.title}</p>
                  <p className="text-[11px] font-mono text-nexus-textMuted mt-0.5">{selected.id}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Type</p>
                    <Badge label={ACTION_LABEL[selected.actionType]} variant="muted" />
                  </div>
                  <div>
                    <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Risk</p>
                    <Badge label={selected.risk} variant={selected.risk === 'high' ? 'warning' : selected.risk === 'medium' ? 'info' : 'muted'} />
                  </div>
                  <div>
                    <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Owner</p>
                    <p className="text-sm text-nexus-text">{selected.owner}</p>
                  </div>
                  <div>
                    <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Priority</p>
                    <Badge label={selected.priority} variant={PRIORITY_VARIANT[selected.priority]} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Reason</p>
                  <p className="text-sm text-nexus-text leading-relaxed">{selected.reason}</p>
                </div>
                {selected.state !== 'pending' ? (
                  <div className={`p-3 rounded-lg border ${
                    selected.state === 'approved'
                      ? 'bg-nexus-success/5 border-nexus-success/20'
                      : 'bg-nexus-danger/5 border-nexus-danger/20'
                  }`}>
                    <p className={`text-sm font-medium capitalize mb-0.5 ${
                      selected.state === 'approved' ? 'text-nexus-success' : 'text-nexus-danger'
                    }`}>{selected.state}</p>
                    <p className="text-[11px] text-nexus-textMuted">{selected.feedback}</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1.5">CEO Note (optional)</p>
                      <textarea
                        rows={2}
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                        placeholder="Add a note before deciding…"
                        className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-3 py-2
                                   text-sm text-nexus-text placeholder:text-nexus-textMuted/50
                                   focus:outline-none focus:border-nexus-accent/50 transition-colors resize-none"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => decide(selected.id, 'approved')} className="btn-primary text-xs px-4 py-2 flex-1">Approve</button>
                      <button onClick={() => decide(selected.id, 'rejected')} className="btn-ghost text-xs px-4 py-2 flex-1">Reject</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
