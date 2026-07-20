import { useState, useEffect, useCallback } from 'react'
import { Panel } from '../../components/ui/Panel'
import { Badge } from '../../components/ui/Badge'
import { CheckCircle2, XCircle, Plus, ChevronRight } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import type { Approval, DecisionState, AuditLogEntry, ActionType, Priority, Risk } from '../../types/approval'
import { fetchApprovals, createApproval, decideApproval, writeAuditLog, countApprovalsByActionType, setApprovalReference } from '../../services/approvals'
import { fetchAuditLog } from '../../services/auditLog'

const PRIORITY_VARIANT: Record<Priority, 'warning' | 'info' | 'muted'> = {
  high: 'warning', medium: 'info', low: 'muted',
}

const ACTION_LABEL: Record<ActionType, string> = {
  'code-merge': 'Code Merge', budget: 'Budget', contract: 'Contract',
  deployment: 'Deploy', policy: 'Policy',
}

function referencePrefix(actionType: ActionType): string {
  switch (actionType) {
    case 'code-merge': return 'PR'
    case 'budget': return 'BUD'
    case 'contract': return 'CNT'
    case 'deployment': return 'DEP'
    case 'policy': return 'POL'
  }
}

function generateReference(actionType: ActionType, count: number): string {
  const pad = String(count).padStart(2, '0')
  return `${referencePrefix(actionType)}-${pad}`
}

interface NewApprovalForm {
  title: string
  actionType: ActionType
  requester: string
  dept: string
  priority: Priority
  risk: Risk
  reason: string
  owner: string
}

const EMPTY_FORM: NewApprovalForm = {
  title: '',
  actionType: 'code-merge',
  requester: '',
  dept: '',
  priority: 'medium',
  risk: 'medium',
  reason: '',
  owner: '',
}

export default function ApprovalsPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Approval | null>(null)
  const [feedback, setFeedback] = useState('')
  const [filter, setFilter] = useState<DecisionState | 'all'>('all')
  const [showNewForm, setShowNewForm] = useState(false)
  const [newForm, setNewForm] = useState<NewApprovalForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [deciding, setDeciding] = useState(false)
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([])
  const [showAudit, setShowAudit] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const actorName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'CEO'
  const actorId = user?.id ?? null

  const loadApprovals = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = filter === 'all'
        ? await fetchApprovals()
        : await fetchApprovals(filter)
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load approvals')
    } finally {
      setLoading(false)
    }
  }, [filter])

  const loadAuditLog = useCallback(async () => {
    try {
      const data = await fetchAuditLog(20)
      setAuditLog(data)
    } catch {
      // non-critical
    }
  }, [])

  useEffect(() => {
    loadApprovals()
  }, [loadApprovals])

  useEffect(() => {
    if (showAudit) loadAuditLog()
  }, [showAudit, loadAuditLog])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const approval = await createApproval({
        title: newForm.title,
        actionType: newForm.actionType,
        requester: newForm.requester,
        dept: newForm.dept,
        priority: newForm.priority,
        risk: newForm.risk,
        reason: newForm.reason,
        owner: newForm.owner,
      })

      const counts = await countApprovalsByActionType(newForm.actionType)
      const ref = generateReference(newForm.actionType, counts)
      await setApprovalReference(approval.id, ref)

      await writeAuditLog({
        entityType: 'approval',
        entityId: approval.id,
        action: 'created',
        actorId,
        actorName,
        details: `Created approval "${approval.title}"`,
      })

      setNewForm(EMPTY_FORM)
      setShowNewForm(false)
      loadApprovals()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create approval')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDecide(decision: 'approved' | 'rejected') {
    if (!selected || deciding) return
    setDeciding(true)
    setError(null)
    try {
      const updated = await decideApproval(selected.id, decision, feedback.trim() || null, actorId, actorName)
      await writeAuditLog({
        entityType: 'approval',
        entityId: updated.id,
        action: decision,
        actorId,
        actorName,
        details: feedback.trim() || (decision === 'approved' ? 'Approved by CEO.' : 'Rejected by CEO.'),
      })
      setItems(prev => prev.map(i => i.id === updated.id ? updated : i))
      setSelected(updated)
      setFeedback('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Decision failed')
    } finally {
      setDeciding(false)
    }
  }

  const filteredItems = items
  const pendingCount = items.filter(i => i.state === 'pending').length
  const approvedCount = items.filter(i => i.state === 'approved').length
  const rejectedCount = items.filter(i => i.state === 'rejected').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-semibold text-nexus-text">Approvals Queue</h1>
        <button
          onClick={() => { setShowNewForm(true); setError(null) }}
          className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
        >
          <Plus size={13} /> New Approval
        </button>
      </div>

      {error && (
        <div className="text-xs text-nexus-danger bg-nexus-danger/10 border border-nexus-danger/20 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
              filter === s
                ? 'bg-nexus-accent/15 border-nexus-accent/30 text-nexus-text'
                : 'bg-nexus-surface border-nexus-border text-nexus-textMuted hover:text-nexus-text'
            }`}
          >
            {s === 'all' ? 'All' : s === 'pending' ? `Pending (${pendingCount})` : s === 'approved' ? `Approved (${approvedCount})` : `Rejected (${rejectedCount})`}
          </button>
        ))}
        <button
          onClick={() => setShowAudit(v => !v)}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-all ml-auto ${
            showAudit
              ? 'bg-nexus-accent/15 border-nexus-accent/30 text-nexus-text'
              : 'bg-nexus-surface border-nexus-border text-nexus-textMuted hover:text-nexus-text'
          }`}
        >
          {showAudit ? 'Hide Audit Log' : 'Show Audit Log'}
        </button>
      </div>

      {showAudit && (
        <Panel title="Recent Audit Log">
          {auditLog.length === 0 ? (
            <p className="text-nexus-textMuted text-sm text-center py-4">No audit entries yet.</p>
          ) : (
            <div className="space-y-2">
              {auditLog.map(entry => (
                <div key={entry.id} className="flex items-center gap-3 p-3 rounded-lg bg-nexus-surface border border-nexus-border">
                  <Badge
                    label={entry.action}
                    variant={entry.action === 'approved' ? 'success' : entry.action === 'rejected' ? 'danger' : 'info'}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-nexus-text truncate">{entry.details}</p>
                    <p className="text-[11px] text-nexus-textMuted">{entry.actor_name} · {new Date(entry.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3">
          <Panel title={`${pendingCount} pending approval${pendingCount !== 1 ? 's' : ''}`}>
            {loading ? (
              <div className="py-8 text-center text-nexus-textMuted text-sm">Loading approvals…</div>
            ) : filteredItems.length === 0 ? (
              <div className="py-8 text-center text-nexus-textMuted text-sm">
                {filter === 'all' ? 'No approvals found. Create one to get started.' : `No ${filter} approvals.`}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setSelected(item); setFeedback('') }}
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
                    <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Owner</p>
                    <p className="text-sm text-nexus-text">{selected.owner}</p>
                  </div>
                  <div>
                    <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Priority</p>
                    <Badge label={selected.priority} variant={PRIORITY_VARIANT[selected.priority]} />
                  </div>
                  <div>
                    <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Requester</p>
                    <p className="text-sm text-nexus-text">{selected.requester}</p>
                  </div>
                  <div>
                    <p className="text-xs text-nexus-textMuted uppercase tracking-wider mb-1">Department</p>
                    <p className="text-sm text-nexus-text">{selected.dept}</p>
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
                    <p className="text-[11px] text-nexus-textMuted">{selected.feedback || (selected.state === 'approved' ? 'Approved by CEO.' : 'Rejected by CEO.')}</p>
                    {selected.decided_by && (
                      <p className="text-[11px] text-nexus-textMuted mt-1">By {selected.decided_by} · {selected.decided_at ? new Date(selected.decided_at).toLocaleString() : ''}</p>
                    )}
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
                      <button
                        onClick={() => handleDecide('approved')}
                        disabled={deciding}
                        className="btn-primary text-xs px-4 py-2 flex-1 disabled:opacity-50"
                      >
                        {deciding ? 'Processing…' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleDecide('rejected')}
                        disabled={deciding}
                        className="btn-ghost text-xs px-4 py-2 flex-1 disabled:opacity-50"
                      >
                        {deciding ? 'Processing…' : 'Reject'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </Panel>
        </div>
      </div>

      {showNewForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Panel title="New Approval" className="w-full max-w-lg">
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs text-nexus-textMuted uppercase tracking-wider mb-1.5">Title</label>
                <input
                  type="text"
                  required
                  value={newForm.title}
                  onChange={e => setNewForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-3 py-2 text-sm text-nexus-text placeholder:text-nexus-textMuted/50 focus:outline-none focus:border-nexus-accent/50"
                  placeholder="Short description of the request"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-nexus-textMuted uppercase tracking-wider mb-1.5">Action Type</label>
                  <select
                    value={newForm.actionType}
                    onChange={e => setNewForm(f => ({ ...f, actionType: e.target.value as ActionType }))}
                    className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-3 py-2 text-sm text-nexus-text focus:outline-none focus:border-nexus-accent/50"
                  >
                    <option value="code-merge">Code Merge</option>
                    <option value="budget">Budget</option>
                    <option value="contract">Contract</option>
                    <option value="deployment">Deployment</option>
                    <option value="policy">Policy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-nexus-textMuted uppercase tracking-wider mb-1.5">Priority</label>
                  <select
                    value={newForm.priority}
                    onChange={e => setNewForm(f => ({ ...f, priority: e.target.value as Priority }))}
                    className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-3 py-2 text-sm text-nexus-text focus:outline-none focus:border-nexus-accent/50"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-nexus-textMuted uppercase tracking-wider mb-1.5">Requester</label>
                  <input
                    type="text"
                    required
                    value={newForm.requester}
                    onChange={e => setNewForm(f => ({ ...f, requester: e.target.value }))}
                    className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-3 py-2 text-sm text-nexus-text placeholder:text-nexus-textMuted/50 focus:outline-none focus:border-nexus-accent/50"
                    placeholder="Who is requesting"
                  />
                </div>
                <div>
                  <label className="block text-xs text-nexus-textMuted uppercase tracking-wider mb-1.5">Department</label>
                  <input
                    type="text"
                    required
                    value={newForm.dept}
                    onChange={e => setNewForm(f => ({ ...f, dept: e.target.value }))}
                    className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-3 py-2 text-sm text-nexus-text placeholder:text-nexus-textMuted/50 focus:outline-none focus:border-nexus-accent/50"
                    placeholder="Department"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-nexus-textMuted uppercase tracking-wider mb-1.5">Owner</label>
                  <input
                    type="text"
                    required
                    value={newForm.owner}
                    onChange={e => setNewForm(f => ({ ...f, owner: e.target.value }))}
                    className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-3 py-2 text-sm text-nexus-text placeholder:text-nexus-textMuted/50 focus:outline-none focus:border-nexus-accent/50"
                    placeholder="Accountable person"
                  />
                </div>
                <div>
                  <label className="block text-xs text-nexus-textMuted uppercase tracking-wider mb-1.5">Risk</label>
                  <select
                    value={newForm.risk}
                    onChange={e => setNewForm(f => ({ ...f, risk: e.target.value as Risk }))}
                    className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-3 py-2 text-sm text-nexus-text focus:outline-none focus:border-nexus-accent/50"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-nexus-textMuted uppercase tracking-wider mb-1.5">Reason</label>
                <textarea
                  required
                  rows={3}
                  value={newForm.reason}
                  onChange={e => setNewForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="Why does this need approval?"
                  className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-3 py-2 text-sm text-nexus-text placeholder:text-nexus-textMuted/50 focus:outline-none focus:border-nexus-accent/50 transition-colors resize-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={submitting} className="btn-primary text-xs px-4 py-2 flex-1 disabled:opacity-50">
                  {submitting ? 'Creating…' : 'Create Approval'}
                </button>
                <button type="button" onClick={() => { setShowNewForm(false); setError(null) }} className="btn-ghost text-xs px-4 py-2 flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </Panel>
        </div>
      )}
    </div>
  )
}
