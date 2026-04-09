-- TeamFlow: Dynamic Growth Model
-- Run this in Supabase SQL Editor to set up your database

-- ============================================
-- TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  value numeric,
  closer_id uuid REFERENCES members(id),
  status text NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'talked', 'dealed', 'convinced', 'done')),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS deal_workers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id),
  share numeric NOT NULL DEFAULT 1.0,
  UNIQUE(deal_id, member_id)
);

CREATE TABLE IF NOT EXISTS point_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id),
  deal_id uuid REFERENCES deals(id) ON DELETE SET NULL,
  points numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('finder', 'worker', 'decay')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cash_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  member_id uuid REFERENCES members(id),
  amount numeric NOT NULL,
  bucket text NOT NULL CHECK (bucket IN ('treasury', 'worker', 'closer')),
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_closer ON deals(closer_id);
CREATE INDEX IF NOT EXISTS idx_deal_workers_deal ON deal_workers(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_workers_member ON deal_workers(member_id);
CREATE INDEX IF NOT EXISTS idx_point_ledger_member ON point_ledger(member_id);
CREATE INDEX IF NOT EXISTS idx_point_ledger_type ON point_ledger(type);
CREATE INDEX IF NOT EXISTS idx_cash_transactions_deal ON cash_transactions(deal_id);
CREATE INDEX IF NOT EXISTS idx_cash_transactions_member ON cash_transactions(member_id);

-- ============================================
-- VIEW: member_equity
-- ============================================

CREATE OR REPLACE VIEW member_equity AS
WITH point_totals AS (
  SELECT
    m.id AS member_id,
    m.name,
    COALESCE(SUM(pl.points), 0) AS total_points
  FROM members m
  LEFT JOIN point_ledger pl ON pl.member_id = m.id
  GROUP BY m.id, m.name
),
grand AS (
  SELECT SUM(total_points) AS grand_total FROM point_totals
),
member_count AS (
  SELECT COUNT(*) AS cnt FROM members
)
-- Equity = 30% base (equal for all) + 70% performance (by points)
-- When no points exist yet, everyone gets equal share (100/N)
SELECT
  pt.member_id,
  pt.name,
  pt.total_points,
  CASE
    WHEN g.grand_total = 0 THEN ROUND(100.0 / mc.cnt, 2)
    ELSE ROUND(
      (30.0 / mc.cnt) + (70.0 * pt.total_points / g.grand_total),
      2
    )
  END AS equity_pct
FROM point_totals pt, grand g, member_count mc;

-- ============================================
-- SEED: 7 team members (0 points each)
-- ============================================

INSERT INTO members (name) VALUES
  ('Adem'),
  ('Lokmane'),
  ('Lotfi'),
  ('Zaki'),
  ('Raouf'),
  ('Brahim'),
  ('Yasin')
ON CONFLICT (name) DO NOTHING;
