-- Row Level Security Policies for Candidates table

DROP POLICY IF EXISTS "Allow all operations on candidates" ON candidates;

-- Development policy: Allow all operations
CREATE POLICY "Allow all operations on candidates" 
  ON candidates 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Example production policies:
-- CREATE POLICY "Candidates can view their own profile"
--   ON candidates
--   FOR SELECT
--   USING (auth.uid()::text = user_id);
--
-- CREATE POLICY "HR can view all candidates"
--   ON candidates
--   FOR SELECT
--   USING (auth.role() = 'hr' OR auth.role() = 'admin');
--
-- CREATE POLICY "Candidates can update their own profile"
--   ON candidates
--   FOR UPDATE
--   USING (auth.uid()::text = user_id)
--   WITH CHECK (auth.uid()::text = user_id);

