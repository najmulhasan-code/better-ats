-- Better ATS - Supabase Setup (RLS, Triggers, Extensions)
-- 
-- IMPORTANT: This file does NOT create tables. Tables are created by Prisma.
-- 
-- Prerequisites:
-- 1. Run: npm run db:push (creates all tables from Prisma schema)
-- 2. Then run this SQL file in Supabase SQL Editor
--
-- This file sets up:
-- - Database extensions (UUID)
-- - Database triggers (updated_at timestamps)
-- - Row Level Security (RLS) policies

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. FUNCTIONS
-- ============================================================================

-- Create or replace the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at 
  BEFORE UPDATE ON companies
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_postings_updated_at ON job_postings;
CREATE TRIGGER update_job_postings_updated_at 
  BEFORE UPDATE ON job_postings
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_candidates_updated_at ON candidates;
CREATE TRIGGER update_candidates_updated_at 
  BEFORE UPDATE ON candidates
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at 
  BEFORE UPDATE ON applications
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_interviews_updated_at ON interviews;
CREATE TRIGGER update_interviews_updated_at 
  BEFORE UPDATE ON interviews
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. RLS POLICIES
-- ============================================================================

-- Companies policies
DROP POLICY IF EXISTS "Allow all operations on companies" ON companies;
CREATE POLICY "Allow all operations on companies" 
  ON companies 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Job postings policies
DROP POLICY IF EXISTS "Allow all operations on job_postings" ON job_postings;
CREATE POLICY "Allow all operations on job_postings" 
  ON job_postings 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Candidates policies
DROP POLICY IF EXISTS "Allow all operations on candidates" ON candidates;
CREATE POLICY "Allow all operations on candidates" 
  ON candidates 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Applications policies
DROP POLICY IF EXISTS "Allow all operations on applications" ON applications;
CREATE POLICY "Allow all operations on applications" 
  ON applications 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Interviews policies
DROP POLICY IF EXISTS "Allow all operations on interviews" ON interviews;
CREATE POLICY "Allow all operations on interviews" 
  ON interviews 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================

SELECT 'Supabase RLS, triggers, and extensions setup completed successfully!' AS status;

-- Next steps:
-- 1. Tables are already created by Prisma (npm run db:push)
-- 2. RLS policies, triggers, and extensions are now set up
-- 3. (Optional) Seed sample data: npm run db:seed
--    Or run: supabase/seeds/sample-data.sql in SQL Editor
