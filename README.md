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

**Recommended Approach (Using Prisma):**

1. Push Prisma schema to database:
   ```bash
   npm run db:push
   ```
   This creates all tables, indexes, and relationships from `prisma/schema.prisma`

2. Set up RLS policies and triggers:
   - Go to Supabase **SQL Editor**
   - Copy and paste the contents of `supabase/setup.sql` (runs all setup files)
   - Or run individual files from `supabase/` folder in order:
     - `extensions/uuid-extension.sql`
     - `functions/update-timestamp.sql`
     - `policies/rls-enable.sql`
     - `policies/*-policies.sql` (all policy files)

3. (Optional) Seed sample data:
   - Use Prisma seed: `npm run db:seed`
   - Or run SQL: `supabase/seeds/sample-data.sql` in Supabase SQL Editor

**Alternative Approach (Using SQL):**
If you prefer to use SQL directly, you can use `supabase/schema.sql` (legacy file).

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
npm run db:push      # Push schema to database
npm run db:migrate   # Create and apply migration
npm run db:studio    # Open Prisma Studio (visual DB browser)
npm run db:seed      # Seed database with sample data
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
  ├── prisma.ts              # Prisma client singleton
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
  ├── setup.sql            # Complete setup script (runs all files)
  ├── schema.sql           # Legacy SQL schema (deprecated)
  ├── extensions/          # Database extensions
  │   └── uuid-extension.sql
  ├── functions/           # Database functions
  │   └── update-timestamp.sql
  ├── policies/            # RLS policies (one file per table)
  │   ├── rls-enable.sql
  │   ├── companies-policies.sql
  │   ├── job-postings-policies.sql
  │   ├── candidates-policies.sql
  │   ├── applications-policies.sql
  │   └── interviews-policies.sql
  └── seeds/               # Sample data
      └── sample-data.sql
```

## Schema Management

**Prisma Schema (`prisma/schema.prisma`)** is the **source of truth** for:
- Table structure
- Columns and data types
- Relationships and foreign keys
- Indexes

**Supabase SQL Files** are used for:
- `supabase/extensions/` - Database extensions (UUID)
- `supabase/functions/` - Database functions (triggers)
- `supabase/policies/` - Row Level Security policies (one file per table)
- `supabase/seeds/` - Sample data (optional)
- `supabase/setup.sql` - Complete setup script (all-in-one)

**Workflow:**
1. Modify `prisma/schema.prisma` for table changes
2. Run `npm run db:generate` to regenerate types
3. Run `npm run db:push` to sync changes to database (development)
4. Run `npm run db:migrate` for production migrations
5. Update `supabase/policies/*.sql` files if RLS policies need changes
6. Run updated SQL files in Supabase SQL Editor

## Best Practices

1. **Schema Changes:** Always modify `prisma/schema.prisma`, then push to database
2. **Server-Side:** Use Prisma for database queries in Server Components and API Routes
3. **Client-Side:** Use API Routes (which use Prisma) for data fetching, Supabase Client for real-time
4. **Authentication:** Always check auth with Supabase before Prisma queries
5. **Type Safety:** Prisma generates types automatically - use them throughout your app

## License

MIT
