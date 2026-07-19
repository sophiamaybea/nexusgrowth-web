CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL,
  title TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('code-merge', 'budget', 'contract', 'deployment', 'policy')),
  requester TEXT NOT NULL,
  dept TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  risk TEXT NOT NULL DEFAULT 'medium' CHECK (risk IN ('low', 'medium', 'high')),
  reason TEXT NOT NULL,
  owner TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'pending' CHECK (state IN ('pending', 'approved', 'rejected')),
  feedback TEXT,
  decided_by TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL DEFAULT 'approval',
  entity_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'approved', 'rejected')),
  actor_id TEXT,
  actor_name TEXT,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_approvals_state ON approvals(state);
CREATE INDEX idx_approvals_created_at ON approvals(created_at DESC);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read approvals" ON approvals
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert approvals" ON approvals
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update approvals" ON approvals
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read audit_log" ON audit_log
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert audit_log" ON audit_log
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
