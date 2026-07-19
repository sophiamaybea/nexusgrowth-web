export type ChatStatus = 'online' | 'idle' | 'offline'

export interface ChatThread {
  id: string
  dept: string
  head: string
  status: ChatStatus
  unreadCount: number
  lastMessage?: string | null
  lastMessageAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  threadId: string
  sender: string
  role: 'CEO' | 'HEAD'
  body: string
  createdAt: string
}

export interface NewMessage {
  threadId: string
  sender: string
  role: 'CEO' | 'HEAD'
  body: string
}

export function formatChatTime(value: string | number | Date): string {
  const d = new Date(value)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) {
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return d.toLocaleDateString('en-GB', { weekday: 'short' })
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}
