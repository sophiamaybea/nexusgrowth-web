import { supabase } from '../lib/supabaseClient'
import type { ChatMessage, ChatThread, NewMessage } from '../types/chat'

function mapThread(row: any): ChatThread {
  return {
    id: row.id,
    dept: row.dept,
    head: row.head,
    status: row.status,
    unreadCount: row.unread_count ?? 0,
    lastMessage: row.last_message ?? null,
    lastMessageAt: row.last_message_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapMessage(row: any): ChatMessage {
  return {
    id: row.id,
    threadId: row.thread_id,
    sender: row.sender,
    role: row.role,
    body: row.body,
    createdAt: row.created_at,
  }
}

export async function getThreads(): Promise<ChatThread[]> {
  const { data, error } = await supabase
    .from('chat_threads')
    .select('*')
    .order('last_message_at', { ascending: false, nullsFirst: false })

  if (error) throw error
  return (data || []).map(mapThread)
}

export async function getMessages(threadId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data || []).map(mapMessage)
}

export async function sendMessage(msg: NewMessage): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      thread_id: msg.threadId,
      sender: msg.sender,
      role: msg.role,
      body: msg.body,
    })
    .select()
    .single()

  if (error) throw error

  const threadUpdate: Record<string, unknown> = {
    last_message: msg.body,
    last_message_at: new Date().toISOString(),
  }
  if (msg.role === 'HEAD') {
    const { data: current, error: readError } = await supabase
      .from('chat_threads')
      .select('unread_count')
      .eq('id', msg.threadId)
      .single()
    if (readError) throw readError
    threadUpdate.unread_count = (current?.unread_count ?? 0) + 1
  }

  const { error: threadError } = await supabase
    .from('chat_threads')
    .update(threadUpdate)
    .eq('id', msg.threadId)

  if (threadError) throw threadError

  return mapMessage(data)
}

export async function markThreadRead(threadId: string): Promise<void> {
  const { error } = await supabase
    .from('chat_threads')
    .update({ unread_count: 0 })
    .eq('id', threadId)

  if (error) throw error
}

type MessageInsertHandler = (msg: ChatMessage) => void

export function subscribeToMessages(threadId: string, onInsert: MessageInsertHandler) {
  const channel = supabase
    .channel(`chat_messages:${threadId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `thread_id=eq.${threadId}`,
      },
      (payload) => onInsert(mapMessage(payload.new)),
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export function subscribeToThreads(onUpdate: (thread: ChatThread) => void) {
  const channel = supabase
    .channel('chat_threads')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chat_threads',
      },
      (payload) => {
        const row = payload.new as any
        if (row?.id) onUpdate(mapThread(row))
      },
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
