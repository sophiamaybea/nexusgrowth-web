-- Chat schema for persistent department-head messaging
-- Threads represent a 1:1 conversation between the CEO and a department head.
-- Messages persist forever and are delivered live via Supabase Realtime.

CREATE TABLE IF NOT EXISTS chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dept TEXT NOT NULL,
  head TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'online' CHECK (status IN ('online','idle','offline')),
  unread_count INTEGER NOT NULL DEFAULT 0 CHECK (unread_count >= 0),
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('CEO','HEAD')),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id ON chat_messages(thread_id, created_at);

-- Enable realtime so onInsert pushes new messages to subscribed clients.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE chat_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Row Level Security: this is a single-tenant CEO dashboard.
-- All authenticated users may read every thread/message, and insert messages.
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_threads_read" ON chat_threads
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "chat_threads_insert" ON chat_threads
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "chat_threads_update" ON chat_threads
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "chat_messages_read" ON chat_messages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "chat_messages_insert" ON chat_messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Seed threads (mirrors the original dashboard departments/conversations)
INSERT INTO chat_threads (dept, head, status, last_message, last_message_at) VALUES
  ('Finance',        'Marcus Webb',   'online',  'Budget variance report is ready for review.',       now() - interval '2 hours'),
  ('Product',        'Lena Park',     'online',  'Sprint 14 velocity is up 22% over last cycle.',     now() - interval '11 hours'),
  ('Client Success', 'Rohan Mehta',   'idle',    'NPS jumped to 74 — client Atlas Dynamics thrilled.', now() - interval '1 day'),
  ('Engineering',    'Zara Osei',     'online',  'Staging deploy queued. Needs your sign-off.',       now() - interval '1 day'),
  ('Open Claw AI',   'Agent Network', 'online',  'Autonomous cycle complete. 7 tasks closed.',        now() - interval '12 hours'),
  ('Legal',          'Priya Nair',    'offline', 'Atlas contract reviewed. Minor clause flagged.',    now() - interval '4 days')
ON CONFLICT DO NOTHING;

-- Seed an opening message for each thread so the chat is never empty.
INSERT INTO chat_messages (thread_id, sender, role, body, created_at)
SELECT t.id, t.head, 'HEAD',
       'Good morning. The June budget variance report is ready — Finance is running 18% above plan on infrastructure spend.',
       now() - interval '2 hours'
FROM chat_threads t WHERE t.dept = 'Finance'
ON CONFLICT DO NOTHING;

INSERT INTO chat_messages (thread_id, sender, role, body, created_at)
SELECT t.id, t.head, 'HEAD', 'Sprint 14 wrapped. Velocity up 22%. Two flagship features shipped to staging.', now() - interval '11 hours'
FROM chat_threads t WHERE t.dept = 'Product'
ON CONFLICT DO NOTHING;

INSERT INTO chat_messages (thread_id, sender, role, body, created_at)
SELECT t.id, t.head, 'HEAD', 'Q2 NPS results are in. Overall score: 74 — up from 61 last quarter. Atlas Dynamics gave a 10/10.', now() - interval '1 day'
FROM chat_threads t WHERE t.dept = 'Client Success'
ON CONFLICT DO NOTHING;

INSERT INTO chat_messages (thread_id, sender, role, body, created_at)
SELECT t.id, t.head, 'HEAD', 'Staging environment is fully validated. Ready to promote to production. Awaiting CEO sign-off.', now() - interval '1 day'
FROM chat_threads t WHERE t.dept = 'Engineering'
ON CONFLICT DO NOTHING;

INSERT INTO chat_messages (thread_id, sender, role, body, created_at)
SELECT t.id, t.head, 'HEAD', 'Autonomous cycle #47 complete. 7 tasks closed, 2 escalated to CEO inbox, 0 errors.', now() - interval '12 hours'
FROM chat_threads t WHERE t.dept = 'Open Claw AI'
ON CONFLICT DO NOTHING;

INSERT INTO chat_messages (thread_id, sender, role, body, created_at)
SELECT t.id, t.head, 'HEAD', 'Atlas Dynamics MSA reviewed. One clause in §7.4 re data residency needs your attention before execution.', now() - interval '4 days'
FROM chat_threads t WHERE t.dept = 'Legal'
ON CONFLICT DO NOTHING;

-- Initialise unread counts from seeded head messages.
UPDATE chat_threads
SET unread_count = (
  SELECT count(*) FROM chat_messages m
  WHERE m.thread_id = chat_threads.id AND m.role = 'HEAD'
);
