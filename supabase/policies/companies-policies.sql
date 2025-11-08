-- Row Level Security Policies for Companies table
-- For development: Allow all operations
-- For production: Restrict based on user roles and authentication

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on companies" ON companies;

-- Development policy: Allow all operations
-- TODO: Replace with production policies based on user roles
CREATE POLICY "Allow all operations on companies" 
  ON companies 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Example production policies (commented out):
-- CREATE POLICY "Users can view published companies"
--   ON companies
--   FOR SELECT
--   USING (true); -- Or add your auth logic here
--
-- CREATE POLICY "Admins can insert companies"
--   ON companies
--   FOR INSERT
--   WITH CHECK (auth.role() = 'admin');
--
-- CREATE POLICY "Admins can update companies"
--   ON companies
--   FOR UPDATE
--   USING (auth.role() = 'admin')
--   WITH CHECK (auth.role() = 'admin');
--
-- CREATE POLICY "Admins can delete companies"
--   ON companies
--   FOR DELETE
--   USING (auth.role() = 'admin');

