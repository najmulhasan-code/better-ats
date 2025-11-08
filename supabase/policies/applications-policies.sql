-- Row Level Security Policies for Applications table

DROP POLICY IF EXISTS "Allow all operations on applications" ON applications;

-- Development policy: Allow all operations
CREATE POLICY "Allow all operations on applications" 
  ON applications 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Example production policies:
-- CREATE POLICY "Candidates can view their own applications"
--   ON applications
--   FOR SELECT
--   USING (
--     candidate_id IN (
--       SELECT id FROM candidates WHERE user_id = auth.uid()::text
--     )
--   );
--
-- CREATE POLICY "Candidates can create applications"
--   ON applications
--   FOR INSERT
--   WITH CHECK (
--     candidate_id IN (
--       SELECT id FROM candidates WHERE user_id = auth.uid()::text
--     )
--   );
--
-- CREATE POLICY "Company HR can view applications for their job postings"
--   ON applications
--   FOR SELECT
--   USING (
--     job_posting_id IN (
--       SELECT jp.id FROM job_postings jp
--       JOIN companies c ON c.id = jp.company_id
--       WHERE c.id IN (
--         SELECT company_id FROM user_companies
--         WHERE user_id = auth.uid()
--       )
--     )
--   );

