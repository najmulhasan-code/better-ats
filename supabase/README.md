# Supabase Database Files

This directory contains SQL files for Supabase-specific database features that Prisma doesn't handle.

## File Organization

```
supabase/
├── README.md                    # This file
├── schema.sql                   # Legacy schema (deprecated)
├── extensions/
│   └── uuid-extension.sql      # UUID extension setup
├── functions/
│   └── update-timestamp.sql    # Database functions (triggers, etc.)
├── policies/
│   ├── rls-enable.sql          # Enable RLS on all tables
│   ├── companies-policies.sql  # RLS policies for companies
│   ├── job-postings-policies.sql
│   ├── candidates-policies.sql
│   ├── applications-policies.sql
│   └── interviews-policies.sql
└── seeds/
    └── sample-data.sql         # Sample data for development
```

## Setup Order

1. **Extensions** - Run `extensions/uuid-extension.sql` first
2. **Functions** - Run `functions/update-timestamp.sql` for triggers
3. **Policies** - Run `policies/rls-enable.sql`, then individual policy files
4. **Seeds** - Run `seeds/sample-data.sql` last (optional)

## Quick Setup

Run all setup files in order:

```sql
-- 1. Extensions
\i extensions/uuid-extension.sql

-- 2. Functions
\i functions/update-timestamp.sql

-- 3. Policies
\i policies/rls-enable.sql
\i policies/companies-policies.sql
\i policies/job-postings-policies.sql
\i policies/candidates-policies.sql
\i policies/applications-policies.sql
\i policies/interviews-policies.sql

-- 4. Seeds (optional)
\i seeds/sample-data.sql
```

Or use the all-in-one file: `supabase/setup.sql` (if available)

## Notes

- These files should be run **after** Prisma creates the tables
- RLS policies are permissive by default (for development)
- Update policies for production based on your auth requirements
- Seeds are optional and only for development/testing

