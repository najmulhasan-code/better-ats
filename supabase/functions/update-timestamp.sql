-- Database Functions
-- Function to automatically update the updated_at timestamp

-- Create or replace the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
-- Note: These will be recreated if tables are dropped/recreated

-- Companies table
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at 
  BEFORE UPDATE ON companies
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Job postings table
DROP TRIGGER IF EXISTS update_job_postings_updated_at ON job_postings;
CREATE TRIGGER update_job_postings_updated_at 
  BEFORE UPDATE ON job_postings
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Candidates table
DROP TRIGGER IF EXISTS update_candidates_updated_at ON candidates;
CREATE TRIGGER update_candidates_updated_at 
  BEFORE UPDATE ON candidates
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Applications table
DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at 
  BEFORE UPDATE ON applications
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Interviews table
DROP TRIGGER IF EXISTS update_interviews_updated_at ON interviews;
CREATE TRIGGER update_interviews_updated_at 
  BEFORE UPDATE ON interviews
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

