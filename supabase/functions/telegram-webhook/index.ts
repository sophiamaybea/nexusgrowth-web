// Supabase Edge Function: telegram-webhook
// Receives Telegram updates (or a webhook POST) and inserts a safety alert.
//
// Deploy:
//   supabase functions deploy telegram-webhook
//   supabase secrets set TELEGRAM_BOT_TOKEN=... TELEGRAM_WEBHOOK_SECRET=...
//
// Telegram sends POST /telegram-webhook with a Message object. We also accept a
// non-Telegram JSON body { "dept", "severity", "title", "detail", "secret" } for
// server-to-server escalations. The `secret` must match TELEGRAM_WEBHOOK_SECRET.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TELEGRAM_API = 'https://api.telegram.org'

interface IncomingMessage {
  message?: {
    text?: string
    chat?: { id?: number }
    from?: { username?: string }
  }
}

interface EscalationBody {
  dept?: string
  severity?: 'critical' | 'warning' | 'info'
  title?: string
  detail?: string
  secret?: string
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function mapTelegramText(text: string): { title: string; detail: string; severity: 'critical' | 'warning' | 'info'; dept: string } {
  // Support "+critical/+warning/+info" prefix tags.
  let severity: 'critical' | 'warning' | 'info' = 'warning'
  let body = text
  const match = text.match(/^\+(critical|warning|info)\b/i)
  if (match) {
    severity = match[1].toLowerCase() as 'critical' | 'warning' | 'info'
    body = text.slice(match[0].length).trim()
  }
  return {
    title: body.slice(0, 120) || 'Telegram escalation',
    detail: body,
    severity,
    dept: 'Telegram',
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, 405)
  }

  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
  const webhookSecret = Deno.env.get('TELEGRAM_WEBHOOK_SECRET')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!botToken || !supabaseUrl || !supabaseServiceKey) {
    return json({ ok: false, error: 'Server misconfigured' }, 500)
  }

  let payload: IncomingMessage | EscalationBody
  try {
    payload = await req.json()
  } catch {
    return json({ ok: false, error: 'Invalid JSON body' }, 400)
  }

  let dept = 'Telegram'
  let severity: 'critical' | 'warning' | 'info' = 'warning'
  let title = 'Telegram escalation'
  let detail = ''

  // Raw Telegram update
  if ('message' in payload && payload.message) {
    const text = payload.message.text ?? ''
    const parsed = mapTelegramText(text)
    dept = parsed.dept
    severity = parsed.severity
    title = parsed.title
    detail = parsed.detail
  } else {
    const body = payload as EscalationBody
    if (webhookSecret && body.secret !== webhookSecret) {
      return json({ ok: false, error: 'Unauthorized' }, 401)
    }
    dept = body.dept ?? 'Telegram'
    severity = body.severity ?? 'warning'
    title = body.title ?? 'Telegram escalation'
    detail = body.detail ?? ''
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  })

  const { data, error } = await supabase
    .from('safety_alerts')
    .insert({
      title,
      detail,
      dept,
      severity,
      ack_status: 'unacknowledged',
      source: 'telegram',
    })
    .select('id')
    .single()

  if (error) {
    return json({ ok: false, error: error.message }, 500)
  }

  // Optionally acknowledge receipt to the Telegram chat.
  const chatId = (payload as IncomingMessage).message?.chat?.id
  if (chatId) {
    await fetch(`${TELEGRAM_API}/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: `✅ Alert received: ${title}` }),
    }).catch(() => {})
  }

  return json({ ok: true, id: data?.id ?? null })
})
