-- ============================================================
-- Reports inbox + Reflection (gap-discovery) + dept earned metrics
-- ============================================================

-- Augment departments with an "earned" figure so the performance
-- page can show budget vs earned (a truth-verifiable financial metric).
ALTER TABLE departments ADD COLUMN IF NOT EXISTS earned DECIMAL(12,2) DEFAULT 0;

-- Reports inbox. Three report producers map to the source column:
--   reflection_leader | teacher_agent | rd_daily
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL CHECK (source IN ('reflection_leader','teacher_agent','rd_daily')),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  dept TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread','read','actioned')),
  financial_summary JSONB,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reflection / gap-discovery initiatives. Promoted items are surfaced
-- as lessons; killed items are retired but retained for audit.
CREATE TABLE IF NOT EXISTS reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'issue' CHECK (category IN ('lesson','issue','decision')),
  dept TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'open' CHECK (state IN ('open','promoted','killed')),
  recurring BOOLEAN NOT NULL DEFAULT false,
  financial_impact DECIMAL(12,2) DEFAULT 0,
  financial_verified BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optional free-text column on the original audit_log shape so CEO
-- actions (promote/kill, etc.) carry context. Safe to add even if the
-- approvals migration is not applied.
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS details TEXT;

CREATE INDEX IF NOT EXISTS idx_reports_source ON reports(source);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reflections_state ON reflections(state);
CREATE INDEX IF NOT EXISTS idx_reflections_created_at ON reflections(created_at DESC);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;

-- The original audit_log RLS policies are created in earlier migrations;
-- ensure insert is allowed for authenticated users regardless.
DROP POLICY IF EXISTS "Authenticated users can insert audit_log" ON audit_log;
CREATE POLICY "Authenticated users can insert audit_log" ON audit_log
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "departments_read" ON departments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "reports_read" ON reports
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "reports_insert" ON reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND created_by = auth.uid());
CREATE POLICY "reports_update" ON reports
  FOR UPDATE USING (auth.role() = 'authenticated' AND (created_by = auth.uid() OR created_by IS NULL));

CREATE POLICY "reflections_read" ON reflections
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "reflections_insert" ON reflections
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND created_by = auth.uid());
CREATE POLICY "reflections_update" ON reflections
  FOR UPDATE USING (auth.role() = 'authenticated' AND (created_by = auth.uid() OR created_by IS NULL));

-- Seed departments with budget vs earned.
UPDATE departments SET budget = 240000, earned = 198000 WHERE name = 'Strategy & Growth';
UPDATE departments SET budget = 180000, earned = 176500 WHERE name = 'Client Success';
UPDATE departments SET budget = 420000, earned = 388000 WHERE name = 'Finance & Ops';
UPDATE departments SET budget = 510000, earned = 502000 WHERE name = 'Technology';
UPDATE departments SET budget = 150000, earned = 147300 WHERE name = 'Intelligence (AI)';
UPDATE departments SET budget = 90000,  earned = 12000  WHERE name = 'Compliance & Legal';

-- Seed reports across the three producers.
INSERT INTO reports (source, title, author, dept, priority, status, body, financial_summary, created_by) VALUES
  ('rd_daily',       'R&D Daily — Model Inference Cost Spike', 'R&D Daily Bot', 'Technology',        'high',   'unread',   'Inference spend up 14% day-over-day driven by the new evaluator chain. Recommend throttling low-priority evals.', '{"spend": 14200, "verified": true}', NULL),
  ('teacher_agent',   'Teacher Agent — Onboarding Playbook Drift', 'Teacher Agent', 'Client Success', 'medium', 'unread',   'Detected three onboarding scripts diverging from the approved playbook. Proposed remediation attached.', NULL, NULL),
  ('reflection_leader','Reflection Leader — Weekly Gap Scan', 'Reflection Leader', 'Strategy & Growth', 'high', 'unread',   'Identified a recurring gap between forecasted and realised onboarding capacity. Recommends a capacity buffer.', '{"gap_value": 38000, "verified": true}', NULL),
  ('rd_daily',       'R&D Daily — Vector Store Latency', 'R&D Daily Bot', 'Technology',        'low',    'read',     'p95 latency back within SLA after shard rebalance. No action required.', NULL, NULL),
  ('teacher_agent',   'Teacher Agent — Competency Decay Alert', 'Teacher Agent', 'Product',       'medium', 'read',     'Module 7 competency scores dropped 6 pts week-over-week. Suggest refresher content.', NULL, NULL),
  ('reflection_leader','Reflection Leader — Margin Pressure Note', 'Reflection Leader', 'Finance & Ops', 'high', 'actioned', 'Infrastructure overage tracking 18% above plan; flagged for CFO review.', '{"overage": 76000, "verified": true}', NULL)
ON CONFLICT DO NOTHING;

-- Seed reflection / gap-discovery initiatives.
INSERT INTO reflections (title, summary, category, dept, state, recurring, financial_impact, financial_verified, created_by) VALUES
  ('Infrastructure spend acceleration', 'Capex overage of 18% attributed to accelerated rack provisioning. Positive indicator — demand ahead of forecast.', 'lesson', 'Finance', 'promoted', false, 76000, true, NULL),
  ('Client onboarding delay pattern', 'Third successive onboarding delayed by legal review bottleneck. SLA breach risk if unresolved by Q3.', 'issue', 'Client Success', 'open', true, 38000, true, NULL),
  ('Agent task loop detected', 'Open Claw agent entered a retry loop on task #203. Root cause: ambiguous success criteria. Resolved via tighter spec.', 'issue', 'Intelligence (AI)', 'open', true, 0, false, NULL),
  ('NPS upswing — client segment analysis', 'Enterprise NPS rose 13 points. SMB segment flat. Suggests differentiated support investment strategy needed.', 'lesson', 'Client Success', 'promoted', false, 0, false, NULL),
  ('Budget forecast drift', 'Finance forecasts have drifted >10% vs actuals for three consecutive months. Model recalibration overdue.', 'issue', 'Finance', 'open', true, 54000, true, NULL)
ON CONFLICT DO NOTHING;
