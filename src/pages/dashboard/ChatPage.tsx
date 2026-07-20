import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Circle } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../auth/AuthContext'
import {
  getThreads,
  getMessages,
  sendMessage,
  markThreadRead,
  subscribeToMessages,
  subscribeToThreads,
} from '../../services/chat'
import { formatChatTime, type ChatThread, type ChatMessage } from '../../types/chat'

const STATUS_COLOR: Record<ChatThread['status'], string> = {
  online:  'bg-nexus-success',
  idle:    'bg-nexus-warning',
  offline: 'bg-nexus-textMuted',
}

const HEAD_REPLIES = [
  'Noted — I will action that and loop back shortly.',
  'Understood. Let me pull the figures and confirm.',
  'Good call. I will flag this with the team today.',
  'Acknowledged. I will have an update for you by EOD.',
  'Thanks — that aligns with what we are seeing on the ground.',
]

function pickReply(seed: number): string {
  return HEAD_REPLIES[seed % HEAD_REPLIES.length]
}

export default function ChatPage() {
  const { user } = useAuth()
  const ceoName = user?.email?.split('@')[0] || 'You'

  const [threads, setThreads]                   = useState<ChatThread[]>([])
  const [messagesByThread, setMessagesByThread] = useState<Record<string, ChatMessage[]>>({})
  const [activeId, setActiveId]                 = useState<string>('')
  const [draft, setDraft]                       = useState('')
  const [sending, setSending]                   = useState(false)
  const [loading, setLoading]                   = useState(true)
  const [error, setError]                       = useState<string | null>(null)

  const endRef = useRef<HTMLDivElement>(null)
  const replyTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const active = threads.find(t => t.id === activeId) ?? null
  const msgs = activeId ? messagesByThread[activeId] ?? [] : []

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeId, msgs.length])

  const upsertThread = useCallback((thread: ChatThread) => {
    setThreads(prev => {
      const exists = prev.some(t => t.id === thread.id)
      const next = exists ? prev.map(t => (t.id === thread.id ? thread : t)) : [thread, ...prev]
      return next.sort((a, b) => {
        const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
        const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
        return tb - ta
      })
    })
  }, [])

  const appendMessage = useCallback((msg: ChatMessage) => {
    setMessagesByThread(prev => {
      const list = prev[msg.threadId] ?? []
      if (list.some(m => m.id === msg.id)) return prev
      return { ...prev, [msg.threadId]: [...list, msg] }
    })
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const threadRows = await getThreads()
        const messageRows = await Promise.all(
          threadRows.map(t => getMessages(t.id).then(msgs => [t.id, msgs] as const)),
        )

        if (cancelled) return
        setThreads(threadRows)
        if (threadRows[0]) setActiveId(threadRows[0].id)
        const grouped: Record<string, ChatMessage[]> = {}
        messageRows.forEach(([id, msgs]) => {
          grouped[id] = msgs
        })
        setMessagesByThread(grouped)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load chat')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const unsubThreads = subscribeToThreads(upsertThread)
    return () => {
      unsubThreads()
    }
  }, [upsertThread])

  useEffect(() => {
    if (!activeId) return
    let unsub: () => void = () => {}
    let cancelled = false

    getMessages(activeId)
      .then(msgs => {
        if (!cancelled) setMessagesByThread(prev => ({ ...prev, [activeId]: msgs }))
      })
      .catch(() => {})

    unsub = subscribeToMessages(activeId, (msg) => {
      appendMessage(msg)
    })

    return () => {
      cancelled = true
      unsub()
    }
  }, [activeId, appendMessage])

  useEffect(() => {
    if (!activeId) return
    markThreadRead(activeId).catch(() => {})
    setThreads(prev => prev.map(t => (t.id === activeId ? { ...t, unreadCount: 0 } : t)))
  }, [activeId])

  useEffect(() => {
    return () => {
      Object.values(replyTimers.current).forEach(clearTimeout)
    }
  }, [])

  async function simulateHeadReply(thread: ChatThread) {
    const timer = setTimeout(async () => {
      try {
        const count = (messagesByThread[thread.id]?.length ?? 0) + 1
        await sendMessage({
          threadId: thread.id,
          sender: thread.head,
          role: 'HEAD',
          body: pickReply(count),
        })
      } catch {
        /* simulated reply failed silently */
      }
    }, 1400 + Math.random() * 1200)
    replyTimers.current[thread.id] = timer
  }

  async function handleSend() {
    if (!draft.trim() || !active || sending) return
    const body = draft.trim()
    setDraft('')

    const optimistic: ChatMessage = {
      id: `local_${Date.now()}`,
      threadId: active.id,
      sender: ceoName,
      role: 'CEO',
      body,
      createdAt: new Date().toISOString(),
    }
    setMessagesByThread(prev => ({
      ...prev,
      [active.id]: [...(prev[active.id] ?? []), optimistic],
    }))
    setThreads(prev =>
      prev
        .map(t => (t.id === active.id ? { ...t, lastMessage: body, lastMessageAt: optimistic.createdAt } : t))
        .sort((a, b) => {
          const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
          const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
          return tb - ta
        }),
    )

    setSending(true)
    try {
      await sendMessage({ threadId: active.id, sender: ceoName, role: 'CEO', body })
      await simulateHeadReply(active)
    } catch (e: any) {
      setError(e?.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-display font-semibold text-nexus-text">Department Head Chat</h1>
        <div className="glass-panel p-8 text-center text-nexus-textMuted text-sm">Loading conversations…</div>
      </div>
    )
  }

  if (error && threads.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-display font-semibold text-nexus-text">Department Head Chat</h1>
        <div className="glass-panel p-8 text-center text-nexus-danger text-sm">{error}</div>
      </div>
    )
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
            {threads.map(t => (
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
                    {t.unreadCount > 0 && (
                      <span className="text-[10px] bg-nexus-accent text-white rounded-full px-1.5 py-0.5 font-semibold">
                        {t.unreadCount}
                      </span>
                    )}
                    <Circle size={7} className={`${STATUS_COLOR[t.status]} rounded-full fill-current`} />
                  </div>
                </div>
                <p className="text-[11px] text-nexus-textMuted truncate">{t.head}</p>
                <p className="text-[11px] text-nexus-textMuted/70 truncate mt-0.5">{t.lastMessage || 'No messages yet'}</p>
                <p className="text-[10px] text-nexus-textMuted/50 mt-0.5 text-right">
                  {t.lastMessageAt ? formatChatTime(t.lastMessageAt) : ''}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Active thread */}
        <div className="flex-1 glass-panel flex flex-col overflow-hidden">
          {!active ? (
            <div className="flex-1 flex items-center justify-center text-nexus-textMuted text-sm">
              Select a channel to start messaging.
            </div>
          ) : (
            <>
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
                        {m.sender} · {formatChatTime(m.createdAt)}
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
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!draft.trim() || sending}
                    className="btn-primary px-3 py-2.5 flex items-center justify-center disabled:opacity-40"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
