-- VOLTIX Systems Seed Data
-- Run this AFTER migration.sql and AFTER creating auth users in Supabase Dashboard
--
-- Steps:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add user" for each person below (use their email, auto-generate password)
-- 3. Copy each generated UUID
-- 4. Replace the placeholder UUIDs below
-- 5. Run this SQL in the SQL Editor

-- Admin (system account)
INSERT INTO users (id, email, full_name, role) VALUES
  ('8cb224d0-f6f1-4115-b3ca-13bfaa84fd6f', 'admin@voltix.com', 'VOLTIX Admin', 'admin');

-- 7 Founders
INSERT INTO users (id, email, full_name, role) VALUES
  ('35464b98-da2b-495f-9bf4-f03c060167f0', 'adem@voltix.com',    'Adem',    'founder'),
  ('6cf4f9c1-4c3d-487e-9da9-ef39412a8082', 'lotfi@voltix.com',   'Lotfi',   'founder'),
  ('600bc4a8-0ffe-4063-80c2-fd51eaaf597b', 'yasin@voltix.com',   'Yasin',   'founder'),
  ('caf7bac8-e5c9-4da6-a9db-e344d40db79e', 'lokmane@voltix.com', 'Lokmane', 'founder'),
  ('7b408fae-2602-46b4-ad18-e9a1f5f6be43', 'raouf@voltix.com',   'Raouf',   'founder'),
  ('2169c702-fdd7-4d6b-a97a-db3e92be1708', 'brahim@voltix.com',  'Brahim',  'founder'),
  ('69ec5431-1dc0-449e-a498-13f6ab6bb2fa', 'zaki@voltix.com',    'Zaki',    'founder');
