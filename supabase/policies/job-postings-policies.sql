-- Row Level Security Policies for Job Postings table

DROP POLICY IF EXISTS "Allow all operations on job_postings" ON job_postings;

-- Development policy: Allow all operations
CREATE POLICY "Allow all operations on job_postings" 
  ON job_postings 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Example production policies:
-- CREATE POLICY "Anyone can view published job postings"
--   ON job_postings
--   FOR SELECT
--   USING (status = 'PUBLISHED');
--
-- CREATE POLICY "Company admins can manage their job postings"
--   ON job_postings
--   FOR ALL
--   USING (
--     EXISTS (
--       SELECT 1 FROM companies
--       WHERE companies.id = job_postings.company_id
--       AND companies.id IN (
--         SELECT company_id FROM user_companies
--         WHERE user_id = auth.uid()
--       )
--     )
--   );

