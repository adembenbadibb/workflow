-- VOLTIX Systems Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('admin', 'founder', 'freelancer');
CREATE TYPE project_status AS ENUM ('pending', 'active', 'completed', 'cancelled');
CREATE TYPE savings_transaction_type AS ENUM ('deposit', 'withdrawal');
CREATE TYPE contact_status AS ENUM ('new', 'read', 'replied');

-- ============================================
-- USERS
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'freelancer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- PROJECTS
-- ============================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  client_name TEXT NOT NULL,
  client_email TEXT,
  status project_status NOT NULL DEFAULT 'pending',
  total_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- PROJECT MEMBERS
-- ============================================

CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_in_project TEXT NOT NULL DEFAULT 'member',
  UNIQUE(project_id, user_id)
);

-- ============================================
-- EARNINGS
-- ============================================

CREATE TABLE earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gross_amount DECIMAL(12, 2) NOT NULL,
  take_home DECIMAL(12, 2) NOT NULL,
  savings DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- SAVINGS FUND
-- ============================================

CREATE TABLE savings_fund (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  type savings_transaction_type NOT NULL DEFAULT 'deposit',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- CONTACT SUBMISSIONS
-- ============================================

CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status contact_status NOT NULL DEFAULT 'new'
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_earnings_user_id ON earnings(user_id);
CREATE INDEX idx_earnings_project_id ON earnings(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_savings_fund_user_id ON savings_fund(user_id);
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_fund ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS, so these policies are a secondary safety net.
-- The API route handlers use the service role key, so RLS doesn't block them.
-- These policies protect against direct Supabase client access.

-- Users: can read own profile
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Projects: founders see all, freelancers see only their projects
CREATE POLICY "Founders see all projects"
  ON projects FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'founder'))
  );

CREATE POLICY "Freelancers see own projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = projects.id AND user_id = auth.uid()
    )
  );

-- Earnings: users see own earnings
CREATE POLICY "Users see own earnings"
  ON earnings FOR SELECT
  USING (user_id = auth.uid());

-- Admin sees all earnings
CREATE POLICY "Admin sees all earnings"
  ON earnings FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
