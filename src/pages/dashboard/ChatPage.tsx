import { useState, useRef, useEffect } from 'react'
import { Panel } from '../../components/ui/Panel'
import { Send, Circle } from 'lucide-react'

type Status = 'online' | 'idle' | 'offline'

interface Thread {
  id: string
  dept: string
  head: string
  status: Status
  lastMsg: string
  lastTime: string
  unread: number
}

interface Message {
  id: string
  sender: string
  role: 'CEO' | 'HEAD'
  body: string
  time: string
}

const THREADS: Thread[] = [
  { id: 't1', dept: 'Finance',        head: 'Marcus Webb',    status: 'online',  lastMsg: 'Budget variance report is ready for review.',       lastTime: '09:42', unread: 2 },
  { id: 't2', dept: 'Product',        head: 'Lena Park',      status: 'online',  lastMsg: 'Sprint 14 velocity is up 22% over last cycle.',     lastTime: '08:15', unread: 0 },
  { id: 't3', dept: 'Client Success', head: 'Rohan Mehta',    status: 'idle',    lastMsg: 'NPS jumped to 74 — client Atlas Dynamics thrilled.', lastTime: 'Yesterday', unread: 1 },
  { id: 't4', dept: 'Engineering',    head: 'Zara Osei',      status: 'online',  lastMsg: 'Staging deploy queued. Needs your sign-off.',       lastTime: 'Yesterday', unread: 1 },
  { id: 't5', dept: 'Open Claw AI',   head: 'Agent Network',  status: 'online',  lastMsg: 'Autonomous cycle complete. 7 tasks closed.',        lastTime: '07:58', unread: 0 },
  { id: 't6', dept: 'Legal',          head: 'Priya Nair',     status: 'offline', lastMsg: 'Atlas contract reviewed. Minor clause flagged.',     lastTime: 'Mon',   unread: 0 },
]

const MESSAGES: Record<string, Message[]> = {
  t1: [
    { id: 'm1', sender: 'Marcus Webb',   role: 'HEAD', body: 'Good morning. The June budget variance report is ready — Finance is running 18% above plan on infrastructure spend.', time: '09:38' },
    { id: 'm2', sender: 'Marcus Webb',   role: 'HEAD', body: 'I have flagged three line items that account for 80% of the overage. Recommend we review before end of week.', time: '09:40' },
    { id: 'm3', sender: 'You',           role: 'CEO',  body: 'Thanks Marcus. Is the overage capex or opex? I need the split before I approve any mitigation budget.', time: '09:41' },
    { id: 'm4', sender: 'Marcus Webb',   role: 'HEAD', body: 'Primarily capex — the new data centre rack provisioning accelerated ahead of schedule. Opex is actually 2% under.', time: '09:42' },
  ],
  t2: [
    { id: 'm1', sender: 'Lena Park',  role: 'HEAD', body: 'Sprint 14 wrapped. Velocity up 22%. Two flagship features shipped to staging.', time: '08:15' },
    { id: 'm2', sender: 'You',        role: 'CEO',  body: 'Great work. Any blockers going into Sprint 15?', time: '08:17' },
    { id: 'm3', sender: 'Lena Park',  role: 'HEAD', body: 'One dependency on Legal sign-off for the data export feature. Priya is across it.', time: '08:18' },
  ],
  t3: [
    { id: 'm1', sender: 'Rohan Mehta', role: 'HEAD', body: 'Q2 NPS results are in. Overall score: 74 — up from 61 last quarter. Atlas Dynamics gave a 10/10.', time: 'Yesterday 16:30' },
    { id: 'm2', sender: 'You',         role: 'CEO',  body: 'Excellent. Send the full breakdown with segment analysis to my board pack.', time: 'Yesterday 16:45' },
  ],
  t4: [
    { id: 'm1', sender: 'Zara Osei',  role: 'HEAD', body: 'Staging environment is fully validated. Ready to promote to production.', time: 'Yesterday 14:10' },
    { id: 'm2', sender: 'Zara Osei',  role: 'HEAD', body: 'Awaiting CEO sign-off as per deployment protocol.', time: 'Yesterday 14:11' },
  ],
  t5: [
    { id: 'm1', sender: 'Agent Network', role: 'HEAD', body: 'Autonomous cycle #47 complete. 7 tasks closed, 2 escalated to CEO inbox, 0 errors.', time: '07:58' },
    { id: 'm2', sender: 'You',           role: 'CEO',  body: 'Acknowledged. Pull the escalation summaries into today\'s briefing.', time: '08:02' },
  ],
  t6: [
    { id: 'm1', sender: 'Priya Nair',  role: 'HEAD', body: 'Atlas Dynamics MSA reviewed. One clause in §7.4 re data residency needs your attention before execution.', time: 'Mon 11:20' },
  ],
}

const STATUS_COLOR: Record<Status, string> = {
  online:  'bg-nexus-success',
  idle:    'bg-nexus-warning',
  offline: 'bg-nexus-textMuted',
}

export default function ChatPage() {
  const [activeId, setActiveId]   = useState<string>('t1')
  const [draft, setDraft]         = useState('')
  const [localMsgs, setLocalMsgs] = useState<Record<string, Message[]>>(MESSAGES)
  const endRef = useRef<HTMLDivElement>(null)

  const active  = THREADS.find(t => t.id === activeId)!
  const msgs    = localMsgs[activeId] ?? []

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeId, msgs.length])

  function sendMessage() {
    if (!draft.trim()) return
    const msg: Message = {
      id:     `local_${Date.now()}`,
      sender: 'You',
      role:   'CEO',
      body:   draft.trim(),
      time:   new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    }
    setLocalMsgs(prev => ({ ...prev, [activeId]: [...(prev[activeId] ?? []), msg] }))
    setDraft('')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-display font-semibold text-nexus-text">Department Head Chat</h1>

      <div className="flex gap-4 h-[calc(100vh-11rem)]">
        {/* Thread list */}
        <div className="w-64 shrink-0 glass-panel flex flex-col overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-nexus-border">
            <p className="text-[11px] text-nexus-textMuted uppercase tracking-widest">Channels</p>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {THREADS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveId(t.id)}
                className={`w-full text-left px-4 py-3 transition-all border-l-2 ${
                  t.id === activeId
                    ? 'bg-nexus-accent/10 border-nexus-accent'
                    : 'border-transparent hover:bg-nexus-surface'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-nexus-text text-sm font-medium">{t.dept}</span>
                  <div className="flex items-center gap-1.5">
                    {t.unread > 0 && (
                      <span className="text-[10px] bg-nexus-accent text-white rounded-full px-1.5 py-0.5 font-semibold">{t.unread}</span>
                    )}
                    <Circle size={7} className={`${STATUS_COLOR[t.status]} rounded-full fill-current`} />
                  </div>
                </div>
                <p className="text-[11px] text-nexus-textMuted truncate">{t.head}</p>
                <p className="text-[11px] text-nexus-textMuted/70 truncate mt-0.5">{t.lastMsg}</p>
                <p className="text-[10px] text-nexus-textMuted/50 mt-0.5 text-right">{t.lastTime}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Active thread */}
        <div className="flex-1 glass-panel flex flex-col overflow-hidden">
          {/* Thread header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-nexus-border shrink-0">
            <div>
              <p className="text-nexus-text text-sm font-semibold">{active.dept}</p>
              <p className="text-[11px] text-nexus-textMuted">{active.head}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Circle size={7} className={`${STATUS_COLOR[active.status]} rounded-full fill-current`} />
              <span className="text-[11px] text-nexus-textMuted capitalize">{active.status}</span>
            </div>
          </div>

          {/* Message stream */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {msgs.map(m => (
              <div key={m.id} className={`flex ${m.role === 'CEO' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${
                  m.role === 'CEO'
                    ? 'bg-nexus-accent/15 border border-nexus-accent/20'
                    : 'bg-nexus-surface border border-nexus-border'
                } rounded-xl px-4 py-2.5`}>
                  <p className="text-[11px] text-nexus-textMuted mb-1">
                    {m.sender} · {m.time}
                  </p>
                  <p className="text-sm text-nexus-text leading-relaxed">{m.body}</p>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Composer */}
          <div className="shrink-0 border-t border-nexus-border px-4 py-3">
            <div className="flex items-center gap-2">
              <input
                className="flex-1 bg-nexus-surface border border-nexus-border rounded-lg px-4 py-2.5
                           text-sm text-nexus-text placeholder:text-nexus-textMuted/50
                           focus:outline-none focus:border-nexus-accent/50 transition-colors"
                placeholder={`Message ${active.dept}…`}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              />
              <button
                onClick={sendMessage}
                disabled={!draft.trim()}
                className="btn-primary px-3 py-2.5 flex items-center justify-center disabled:opacity-40"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
