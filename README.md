# Better ATS

> AI-Native Applicant Tracking System

## About

Better ATS reimagines recruiting with AI at its core.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Prisma** - Type-safe database ORM
- **Supabase** - Backend as a Service (Authentication, Real-time, Storage)
- **Tailwind CSS** - Utility-first CSS framework

## Architecture

This project uses **both Prisma and Supabase** in a complementary way:

### Prisma (Database ORM)
- Type-safe database queries
- Complex relationships and joins
- Database migrations
- Type generation from schema

### Supabase Client (Backend Services)
- User authentication
- Real-time subscriptions
- File storage
- Row Level Security (RLS) policies

**Both tools work together on the same PostgreSQL database without duplication.**

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your credentials from **Settings → API**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon/Public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Set Up Database Schema

1. Push Prisma schema to database:
   ```bash
   npm run db:push
   ```
   This creates all tables, indexes, and relationships from `prisma/schema.prisma`

2. Set up RLS policies and triggers:
   - Go to Supabase **SQL Editor**
   - Copy and paste the contents of `supabase/setup.sql`
   - This sets up RLS policies, triggers, and extensions
   - Run the SQL script

3. (Optional) Seed sample data:
   ```bash
   npm run db:seed
   ```
   Or run SQL: `supabase/seeds/sample-data.sql` in Supabase SQL Editor

**Important:** Prisma is the **only** way to manage your database schema. All table changes must be made in `prisma/schema.prisma` and then pushed to the database using `npm run db:push`.

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase Configuration (for Auth, Storage, Real-time)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Prisma Database Connection (for type-safe queries)
# IMPORTANT: Use DIRECT connection with SSL (port 5432)
# Get from: Supabase Settings → Database → Connection string → URI
# Format: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
DATABASE_URL=postgresql://postgres:your_password@db.your-project.supabase.co:5432/postgres?sslmode=require
```

**Getting the Database URL:**
1. Go to Supabase Dashboard → **Settings** → **Database**
2. Scroll to **Connection string**
3. Select **URI** (not "Session mode" or "Transaction mode")
4. Copy the connection string (should have port `5432`)
5. Replace `[YOUR-PASSWORD]` with your actual database password
6. **Add `?sslmode=require` at the end** (required for Supabase)

**Note:** If your password has special characters, URL-encode them:
- `@` → `%40`, `#` → `%23`, `%` → `%25`, `&` → `%26`

### 5. Generate Prisma Client

```bash
npm run db:generate
```

### 6. (Optional) Seed Database

```bash
npm run db:seed
```

### 7. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage Examples

### Using Prisma (Database Queries)

```typescript
import { prisma } from '@/lib/prisma';

// Get companies with job postings
const companies = await prisma.company.findMany({
  include: {
    jobPostings: {
      where: { status: 'published' },
    },
  },
});

// Create a new candidate
const candidate = await prisma.candidate.create({
  data: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  },
});
```

### Using Supabase (Authentication)

```typescript
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

### Using Supabase (Real-time)

```typescript
'use client';
import { createClient } from '@/lib/supabase/client';
import { useEffect } from 'react';

const supabase = createClient();

useEffect(() => {
  const channel = supabase
    .channel('applications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'applications',
      },
      (payload) => {
        console.log('New application!', payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

### Using Both Together

```typescript
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// 1. Authenticate with Supabase
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

if (!user) throw new Error('Unauthorized');

// 2. Query with Prisma (type-safe)
const applications = await prisma.application.findMany({
  where: {
    candidate: {
      email: user.email,
    },
  },
  include: {
    jobPosting: {
      include: {
        company: true,
      },
    },
  },
});
```

## Available Scripts

```bash
# Development
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database (development)
npm run db:migrate   # Create and apply migration
npm run db:migrate:deploy  # Deploy migrations (production)
npm run db:migrate:status  # Check migration status
npm run db:migrate:reset   # Reset database (dev only)
npm run db:studio    # Open Prisma Studio (visual DB browser)
npm run db:seed      # Seed database with sample data
npm run db:format    # Format Prisma schema
npm run db:validate  # Validate Prisma schema
npm run db:introspect # Introspect existing database
```

## Troubleshooting

### "Can't reach database server"

**Solution:** Make sure your `DATABASE_URL` includes SSL:

```env
# ✅ Correct
DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres?sslmode=require

# ❌ Wrong (missing SSL)
DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres
```

### "Environment variable not found: DATABASE_URL"

**Solution:** Create a `.env.local` file in the project root with your `DATABASE_URL`.

### "PrismaClient is not configured"

**Solution:**
1. Make sure `DATABASE_URL` is set in `.env.local`
2. Run `npm run db:generate`
3. Restart your Next.js dev server

### Connection Issues

1. **Verify connection string format:**
   - Use port `5432` (direct connection)
   - Add `?sslmode=require` at the end
   - Don't use `?pgbouncer=true` (that's for pooling)

2. **Check your password:**
   - Verify in Supabase Dashboard → Settings → Database
   - URL-encode special characters

3. **Check network restrictions:**
   - Go to Supabase Dashboard → Settings → Database
   - Ensure your IP is allowed

4. **Test connection:**
   - Try connecting via Supabase SQL Editor
   - If that works, the issue is with your connection string format

## Project Structure

```
lib/
  ├── prisma.ts              # Prisma client singleton (with extensions & middleware)
  ├── prisma/
  │   ├── extensions.ts      # Prisma client extensions
  │   ├── middleware.ts      # Prisma middleware
  │   ├── types.ts           # Type exports and helpers
  │   ├── query-helpers.ts   # Query utilities (pagination, search)
  │   ├── transactions.ts    # Transaction helpers
  │   ├── errors.ts          # Error handling
  │   ├── test-utils.ts      # Testing utilities
  │   └── index.ts           # Prisma module exports
  ├── repositories/          # Repository pattern
  │   ├── base.repository.ts
  │   ├── company.repository.ts
  │   ├── job-posting.repository.ts
  │   ├── candidate.repository.ts
  │   ├── application.repository.ts
  │   ├── interview.repository.ts
  │   └── index.ts
  ├── services/              # Service layer
  │   └── application.service.ts
  ├── db.ts                  # Helper functions using both
  └── supabase/
      ├── client.ts          # Browser Supabase client
      └── server.ts          # Server Supabase client

app/
  ├── api/
  │   └── applications/      # API routes (use Prisma + Supabase auth)
  ├── dashboard/            # Dashboard pages
  └── ...

prisma/
  ├── schema.prisma         # Database schema (source of truth for tables)
  └── seed.ts              # Seed script (uses Prisma)

supabase/
  ├── README.md            # Supabase setup documentation
  ├── setup.sql            # Complete setup script (RLS, triggers, extensions)
  ├── extensions/          # Database extensions (UUID)
  │   └── uuid-extension.sql
  ├── functions/           # Database functions (triggers)
  │   └── update-timestamp.sql
  ├── policies/            # RLS policies (one file per table)
  │   ├── rls-enable.sql
  │   ├── companies-policies.sql
  │   ├── job-postings-policies.sql
  │   ├── candidates-policies.sql
  │   ├── applications-policies.sql
  │   └── interviews-policies.sql
  └── seeds/               # Sample data (optional)
      └── sample-data.sql
```

## Schema Management

**Prisma Schema (`prisma/schema.prisma`)** is the **only source of truth** for:
- Table structure
- Columns and data types
- Relationships and foreign keys
- Indexes
- Enums

**Supabase SQL Files** are used **only** for Supabase-specific features:
- `supabase/extensions/` - Database extensions (UUID) - Run once
- `supabase/functions/` - Database functions (triggers) - Set up once
- `supabase/policies/` - Row Level Security policies - Configure as needed
- `supabase/seeds/` - Sample data (optional)
- `supabase/setup.sql` - Complete setup script (all-in-one)

**Important:** 
- ❌ **Do NOT** create tables using SQL - Use Prisma only
- ✅ **Do** use SQL for RLS policies, triggers, and extensions (Prisma doesn't handle these)

**Workflow:**
1. Modify `prisma/schema.prisma` for any table/column changes
2. Run `npm run db:generate` to regenerate Prisma Client types
3. Run `npm run db:push` to sync schema changes to database (development)
4. Run `npm run db:migrate` for production migrations
5. Update `supabase/policies/*.sql` files only if RLS policies need changes
6. Run updated SQL files in Supabase SQL Editor (only for RLS/triggers)

## Advanced Prisma Features

This project includes advanced Prisma features:

- **Client Extensions**: Custom methods and computed fields
- **Middleware**: Logging, validation, and audit trails
- **Type Safety**: Comprehensive TypeScript types
- **Query Helpers**: Pagination, search, and aggregation utilities
- **Transactions**: Atomic operations and batch processing
- **Error Handling**: Custom error types and handlers
- **Repository Pattern**: Data access layer with business logic
- **Service Layer**: Business logic abstraction
- **Testing Utilities**: Test helpers and factories

See [docs/PRISMA-FEATURES.md](./docs/PRISMA-FEATURES.md) for complete documentation.

### Quick Example

```typescript
import { prisma } from '@/lib/prisma';
import { applicationRepository } from '@/lib/repositories';
import { createPaginatedQuery } from '@/lib/prisma/query-helpers';

// Use extended methods
const candidate = await prisma.candidate.findUnique({ where: { id: '...' } });
const fullName = candidate.fullName; // Computed field

// Use repository pattern
const applications = await applicationRepository.getByStatus('APPLIED');

// Use pagination helper
const result = await createPaginatedQuery(prisma.application, {
  page: 1,
  pageSize: 10,
  where: { status: 'APPLIED' },
});
```

## Best Practices

1. **Schema Changes:** Always modify `prisma/schema.prisma`, then push to database
2. **Server-Side:** Use Prisma for database queries in Server Components and API Routes
3. **Client-Side:** Use API Routes (which use Prisma) for data fetching, Supabase Client for real-time
4. **Authentication:** Always check auth with Supabase before Prisma queries
5. **Type Safety:** Prisma generates types automatically - use them throughout your app
6. **Use Repositories:** Prefer repositories over direct Prisma calls for better organization
7. **Use Transactions:** Use transactions for multi-step operations
8. **Error Handling:** Use error handling utilities for consistent error responses

## License

MIT
