import { useState, useEffect, useCallback } from 'react'
import { Panel } from '../../components/ui/Panel'
import { Badge } from '../../components/ui/Badge'
import { CheckCircle2, XCircle, ChevronRight, Plus } from 'lucide-react'
import {
  listApprovals,
  createApproval,
  decideApproval,
  type ApprovalRow,
  type CreateApprovalInput,
  type ActionType,
  type Priority,
  type Risk,
  type DecisionState,
} from '../../services/approvals'

const ACTION_TYPE_OPTIONS: ActionType[] = ['code-merge', 'budget', 'contract', 'deployment', 'policy']
const PRIORITY_OPTIONS: Priority[] = ['high', 'medium', 'low']
const RISK_OPTIONS: Risk[] = ['low', 'medium', 'high']

const ACTION_LABEL: Record<ActionType, string> = {
  'code-merge': 'Code Merge', budget: 'Budget', contract: 'Contract',
  deployment: 'Deploy', policy: 'Policy',
}

const PRIORITY_VARIANT: Record<Priority, 'warning' | 'info' | 'muted'> = {
  high: 'warning', medium: 'info', low: 'muted',
}

export default function ApprovalsPage() {
  const [items, setItems] = useState<ApprovalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<ApprovalRow | null>(null)
  const [feedback, setFeedback] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState<ActionType>('code-merge')
  const [newPriority, setNewPriority] = useState<Priority>('medium')
  const [newRisk, setNewRisk] = useState<Risk>('medium')
  const [newReason, setNewReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [decisionError, setDecisionError] = useState<string | null>(null)

  const pendingCount = items.filter(i => i.state === 'pending').length

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const rows = await listApprovals()
      setItems(rows)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load approvals')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleDecide(id: number, decision: 'approved' | 'rejected') {
    setDecisionError(null)
    try {
      await decideApproval(id, decision, feedback.trim() || undefined)
      setItems(prev => prev.map(i => i.id === id ? { ...i, state: decision, feedback: feedback.trim() || (decision === 'approved' ? 'Approved by CEO.' : 'Rejected by CEO.') } : i))
      if (selected?.id === id) {
        setSelected(prev => prev ? { ...prev, state: decision, feedback: feedback.trim() || (decision === 'approved' ? 'Approved by CEO.' : 'Rejected by CEO.') } : null)
      }
      setFeedback('')
    } catch (e) {
      setDecisionError(e instanceof Error ? e.message : 'Decision failed')
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const input: CreateApprovalInput = {
        title: newTitle,
        actionType: newType,
        requester: 'CEO',
        dept: 'Executive',
        priority: newPriority,
        risk: newRisk,
        reason: newReason,
        owner: 'CEO',
      }
      const row = await createApproval(input)
      setItems(prev => [...prev, row])
      setShowCreate(false)
      setNewTitle('')
      setNewReason('')
      setNewType('code-merge')
      setNewPriority('medium')
      setNewRisk('medium')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create approval')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-semibold text-nexus-text">Approvals Queue</h1>
        <button
          onClick={() => { setShowCreate(true); setSelected(null) }}
          className="btn-primary text-xs px-3 py-2 flex items-center gap-1.5"
        >
          <Plus size={14} /> New Approval
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-nexus-danger/30 bg-nexus-danger/5 text-sm text-nexus-danger">{error}</div>
      )}

      {showCreate && (
        <Panel title="New Approval">
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Title</label>
              <input
                required
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-3 py-2 text-sm text-nexus-text focus:outline-none focus:border-nexus-accent/50"
                placeholder="e.g., Budget variance — Infrastructure"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Type</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value as ActionType)}
                  className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-3 py-2 text-sm text-nexus-text focus:outline-none focus:border-nexus-accent/50"
                >
                  {ACTION_TYPE_OPTIONS.map(t => <option key={t} value={t}>{ACTION_LABEL[t]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={e => setNewPriority(e.target.value as Priority)}
                  className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-3 py-2 text-sm text-nexus-text focus:outline-none focus:border-nexus-accent/50"
                >
                  {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Risk</label>
                <select
                  value={newRisk}
                  onChange={e => setNewRisk(e.target.value as Risk)}
                  className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-3 py-2 text-sm text-nexus-text focus:outline-none focus:border-nexus-accent/50"
                >
                  {RISK_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Reason</label>
              <textarea
                required
                value={newReason}
                onChange={e => setNewReason(e.target.value)}
                rows={3}
                className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-3 py-2 text-sm text-nexus-text focus:outline-none focus:border-nexus-accent/50 resize-none"
                placeholder="Why does this need approval?"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={submitting} className="btn-primary text-xs px-4 py-2 flex-1 disabled:opacity-50">
                {submitting ? 'Creating…' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost text-xs px-4 py-2 flex-1">Cancel</button>
            </div>
          </form>
        </Panel>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3">
          <Panel title={`${pendingCount} pending approval${pendingCount !== 1 ? 's' : ''}`}>
            {loading ? (
              <p className="text-nexus-textMuted text-sm text-center py-8">Loading approvals…</p>
            ) : items.length === 0 ? (
              <p className="text-nexus-textMuted text-sm text-center py-8">No approvals yet. Create one to get started.</p>
            ) : (
              <div className="space-y-2">
                {items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setSelected(item); setDecisionError(null) }}
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
                    <span className="text-[11px] font-mono text-nexus-textMuted w-16 shrink-0">{item.reference}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-nexus-text truncate">{item.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] text-nexus-textMuted">{item.requester} · {new Date(item.created_at).toLocaleDateString()}</span>
                        <Badge label={ACTION_LABEL[item.action_type]} variant="muted" />
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
            )}
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
                  <p className="text-[11px] font-mono text-nexus-textMuted mt-0.5">{selected.reference}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Type</p>
                    <Badge label={ACTION_LABEL[selected.action_type]} variant="muted" />
                  </div>
                  <div>
                    <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Risk</p>
                    <Badge label={selected.risk} variant={selected.risk === 'high' ? 'warning' : selected.risk === 'medium' ? 'info' : 'muted'} />
                  </div>
                  <div>
                    <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Priority</p>
                    <Badge label={selected.priority} variant={PRIORITY_VARIANT[selected.priority]} />
                  </div>
                  <div>
                    <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">State</p>
                    <span className="text-sm text-nexus-text capitalize">{selected.state}</span>
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
                    {decisionError && (
                      <div className="p-2 rounded-lg border border-nexus-danger/30 bg-nexus-danger/5 text-xs text-nexus-danger">{decisionError}</div>
                    )}
                    <div>
                      <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1.5">CEO Note (optional)</p>
                      <textarea
                        rows={2}
                        value={feedback}
                        onChange={e => { setFeedback(e.target.value); setDecisionError(null) }}
                        placeholder="Add a note before deciding…"
                        className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-3 py-2
                                   text-sm text-nexus-text placeholder:text-nexus-textMuted/50
                                   focus:outline-none focus:border-nexus-accent/50 transition-colors resize-none"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => handleDecide(selected.id, 'approved')} className="btn-primary text-xs px-4 py-2 flex-1">Approve</button>
                      <button onClick={() => handleDecide(selected.id, 'rejected')} className="btn-ghost text-xs px-4 py-2 flex-1">Reject</button>
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