-- departments table
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy','warning','critical','idle')),
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  lead TEXT NOT NULL,
  open_tasks INTEGER NOT NULL DEFAULT 0,
  budget DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  department_id UUID REFERENCES departments(id),
  amount DECIMAL(12,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('revenue','expense','payroll')),
  status TEXT NOT NULL DEFAULT 'cleared' CHECK (status IN ('cleared','pending','documented','flagged')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- audit_log table for activity feed
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor TEXT,
  action TEXT NOT NULL,
  target TEXT,
  type TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('agent','system','human','alert')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed departments
INSERT INTO departments (name, status, score, lead, open_tasks) VALUES
  ('Strategy & Growth', 'healthy', 91, 'Aria', 4),
  ('Client Success', 'healthy', 87, 'Marcus', 7),
  ('Finance & Ops', 'warning', 63, 'Priya', 12),
  ('Technology', 'healthy', 95, 'Leon', 3),
  ('Intelligence (AI)', 'healthy', 98, 'Open Claw', 31),
  ('Compliance & Legal', 'idle', 50, 'Diana', 2)
ON CONFLICT (name) DO NOTHING;

-- Seed transactions
INSERT INTO transactions (description, amount, type, status, date) VALUES
  ('Atlas Dynamics — retainer', 48000, 'revenue', 'documented', '2025-07-18'),
  ('AWS infrastructure — rack Q3', -22400, 'expense', 'documented', '2025-07-17'),
  ('Payroll — July cycle', -214000, 'payroll', 'documented', '2025-07-17'),
  ('Meridian Capital — milestone', 120000, 'revenue', 'documented', '2025-07-16'),
  ('Legal retainer — Priya Nair LLP', -8500, 'expense', 'documented', '2025-07-15'),
  ('SaaS tooling — Figma, Linear', -1240, 'expense', 'cleared', '2025-07-14'),
  ('Greenfield Corp — project fee', 75000, 'revenue', 'pending', '2025-07-13')
ON CONFLICT DO NOTHING;

-- Seed audit_log
INSERT INTO audit_log (actor, action, target, type) VALUES
  ('Open Claw', 'committed branch', 'feature/finance-module', 'agent'),
  ('System', 'backup completed', 'nexusgrowth-web @ staging', 'system'),
  ('Marcus Chen', 'approved proposal', 'Client: Atlas Dynamics Q3', 'human'),
  ('Finance Dept', 'flagged variance', 'Budget line: Infrastructure', 'alert'),
  ('Open Claw', 'opened PR #42', 'feat: KPI dashboard wiring', 'agent'),
  ('System', 'auto-scaled agent pool', 'Intelligence department x3', 'system'),
  ('Aria Nakamura', 'updated strategy deck', 'NexusGrowth Q4 2024', 'human'),
  ('Open Claw', 'QA passed', 'nexusgrowth-task-engine v0.3', 'agent')
ON CONFLICT DO NOTHING;
