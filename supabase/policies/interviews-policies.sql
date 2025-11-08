-- Row Level Security Policies for Interviews table

DROP POLICY IF EXISTS "Allow all operations on interviews" ON interviews;

-- Development policy: Allow all operations
CREATE POLICY "Allow all operations on interviews" 
  ON interviews 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Example production policies:
-- CREATE POLICY "Candidates can view interviews for their applications"
--   ON interviews
--   FOR SELECT
--   USING (
--     application_id IN (
--       SELECT a.id FROM applications a
--       JOIN candidates c ON c.id = a.candidate_id
--       WHERE c.user_id = auth.uid()::text
--     )
--   );
--
-- CREATE POLICY "HR can manage interviews for their company's applications"
--   ON interviews
--   FOR ALL
--   USING (
--     application_id IN (
--       SELECT a.id FROM applications a
--       JOIN job_postings jp ON jp.id = a.job_posting_id
--       JOIN companies c ON c.id = jp.company_id
--       WHERE c.id IN (
--         SELECT company_id FROM user_companies
--         WHERE user_id = auth.uid()
--       )
--     )
--   );

