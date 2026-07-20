-- Safety alerts table (Telegram webhook + manual risk events)
CREATE TABLE IF NOT EXISTS safety_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  dept TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('critical', 'warning', 'info')),
  ack_status TEXT NOT NULL DEFAULT 'unacknowledged' CHECK (ack_status IN ('unacknowledged', 'acknowledged', 'escalated')),
  escalation_note TEXT,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'telegram', 'audit')),
  external_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_safety_alerts_created_at ON safety_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_ack_status ON safety_alerts(ack_status);

-- Department / global control state (CEO override: pause / kill)
CREATE TABLE IF NOT EXISTS department_controls (
  id TEXT PRIMARY KEY,
  scope TEXT NOT NULL CHECK (scope IN ('global', 'department')),
  dept TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'killed')),
  reason TEXT,
  changed_by TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed the global control row
INSERT INTO department_controls (id, scope, status)
VALUES ('global', 'global', 'active')
ON CONFLICT (id) DO NOTHING;

-- Seed one control row per existing department
INSERT INTO department_controls (id, scope, dept, status)
SELECT 'dept:' || name, 'department', name, 'active'
FROM departments
ON CONFLICT (id) DO NOTHING;

ALTER TABLE safety_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_controls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read safety_alerts" ON safety_alerts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert safety_alerts" ON safety_alerts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update safety_alerts" ON safety_alerts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read department_controls" ON department_controls
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update department_controls" ON department_controls
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert department_controls" ON department_controls
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
