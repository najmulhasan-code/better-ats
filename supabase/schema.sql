-- Better ATS - Legacy SQL Schema
-- 
-- ⚠️ DEPRECATED: This file is kept for reference only.
-- 
-- RECOMMENDED APPROACH:
-- 1. Use Prisma schema (prisma/schema.prisma) as the source of truth for table structure
-- 2. Run: npm run db:push (to create tables from Prisma schema)
-- 3. Run: supabase/rls-policies.sql (for RLS policies and triggers)
-- 4. Run: supabase/seed-data.sql (optional, for sample data)
-- 
-- This file is maintained for backwards compatibility.
-- For new projects, use Prisma migrations instead.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

