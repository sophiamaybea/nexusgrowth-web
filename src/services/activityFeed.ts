import { supabase } from '../lib/supabaseClient'
import type { ActivityEntry } from '../types/dashboard'

interface MergedActivity extends ActivityEntry {
  source: 'audit' | 'chat'
  createdAt: number
}

function fromAudit(row: any): MergedActivity {
  return {
    id: row.id,
    source: 'audit',
    createdAt: new Date(row.created_at).getTime(),
    time: new Date(row.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    actor: row.actor || 'System',
    action: row.action || 'performed action',
    target: row.target,
    type: (row.type as ActivityEntry['type']) || 'system',
  }
}

function fromChat(row: any): MergedActivity {
  const role = row.role === 'CEO' ? 'human' : 'agent'
  const dept = row.thread?.dept
  return {
    id: `chat-${row.id}`,
    source: 'chat',
    createdAt: new Date(row.created_at).getTime(),
    time: new Date(row.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    actor: row.sender || (row.role === 'CEO' ? 'CEO' : 'Agent'),
    action: dept ? `messaged ${dept}` : 'messaged',
    target: row.body?.slice(0, 80),
    type: role,
  }
}

export async function getCombinedActivityFeed(limit = 40): Promise<MergedActivity[]> {
  const [auditRes, chatRes] = await Promise.all([
    supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit),
    supabase
      .from('chat_messages')
      .select('*, thread:chat_threads(dept)')
      .order('created_at', { ascending: false })
      .limit(limit),
  ])

  if (auditRes.error) throw auditRes.error
  if (chatRes.error) throw chatRes.error

  const audit = (auditRes.data || []).map(fromAudit)
  const chat = (chatRes.data || []).map(fromChat)

  return [...audit, ...chat]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit)
}
