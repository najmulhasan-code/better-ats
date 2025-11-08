# Better ATS - AI-Native Applicant Tracking System

An enterprise-grade, AI-powered applicant tracking system built for modern recruiting teams. Designed to compete with platforms like Lever and Greenhouse.

## 🚀 Project Overview

Better ATS is a production-ready, multi-tenant SaaS platform that helps companies streamline their hiring process with AI-powered candidate matching, automated workflows, and comprehensive analytics.

### Key Features

- **AI-Powered Candidate Matching**: Automatically score and rank candidates based on job requirements
- **Multi-Tenant Architecture**: Each company has isolated data and custom branding
- **Public Careers Pages**: Beautiful, branded job listing pages for each company
- **Advanced Analytics**: Real-time dashboards with hiring metrics and trends
- **Customizable Workflows**: Configure departments, locations, and job types
- **Production Database**: Supabase + Prisma for type-safe, scalable data management

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma (type-safe queries, migrations)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Real-time subscriptions
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Charts**: Recharts
- **AI**: Anthropic Claude API

## 🏗️ Architecture

### Database Stack (Prisma + Supabase)

This project uses **both Prisma and Supabase** in a complementary way:

**Prisma (Database ORM)**
- Type-safe database queries
- Complex relationships and joins
- Database migrations
- Automatic type generation

**Supabase (Backend Services)**
- User authentication
- Real-time subscriptions
- File storage
- Row Level Security (RLS) policies

**Both tools work together on the same PostgreSQL database without duplication.**

### Multi-Tenancy

Each company has a unique slug for their careers page:
- `/jobs/demo-company` - Demo Company careers
- `/jobs/techstart` - TechStart Inc careers

## 📁 Project Structure

For detailed information about the project structure, naming conventions, and development guidelines, see **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)**.

### Quick Overview

```
better-ats/
├── app/                    # Next.js App Router
│   ├── dashboard/          # Protected dashboard (jobs, candidates, settings)
│   ├── jobs/               # Public careers pages
│   └── api/                # API routes
├── components/             # Shared components (layout, ui, landing)
├── lib/
│   ├── prisma.ts          # Prisma client with extensions
│   ├── prisma/            # Prisma utilities (middleware, helpers)
│   ├── repositories/      # Repository pattern for data access
│   ├── services/          # Business logic layer
│   ├── supabase/          # Supabase client/server setup
│   ├── jobStore.ts        # localStorage job management (development)
│   └── candidateStore.ts  # localStorage candidate management (development)
├── prisma/
│   ├── schema.prisma      # Database schema (source of truth)
│   └── seed.ts           # Database seeding script
└── supabase/
    ├── setup.sql          # Complete Supabase setup
    ├── policies/          # RLS policies per table
    └── functions/         # Database triggers
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account ([supabase.com](https://supabase.com))

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your credentials from **Settings → API**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon/Public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Configure Environment Variables

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

# Anthropic (Claude) API Configuration
# Get from: https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=your_anthropic_api_key_here
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

### 4. Set Up Database Schema

1. Generate Prisma Client:
   ```bash
   npm run db:generate
   ```

2. Push Prisma schema to database:
   ```bash
   npm run db:push
   ```
   This creates all tables, indexes, and relationships from `prisma/schema.prisma`

3. Set up RLS policies and triggers:
   - Go to Supabase **SQL Editor**
   - Copy and paste the contents of `supabase/setup.sql`
   - Run the SQL script

4. (Optional) Seed sample data:
   ```bash
   npm run db:seed
   ```
   Or run SQL: `supabase/seeds/sample-data.sql` in Supabase SQL Editor

**Important:** Prisma is the **only** way to manage your database schema. All table changes must be made in `prisma/schema.prisma` and then pushed to the database using `npm run db:push`.

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
npm run build
npm start
```

## 📊 Features

### Current Features (Fully Functional)

✅ **Job Management**
- Create/edit job postings with rich details
- Draft and publish workflow
- Status management (active/draft/closed)
- Custom application forms
- Public careers pages

✅ **Candidate Tracking**
- Application submission and storage
- Pipeline stages (Applied → Hired)
- Candidate profiles
- Stage management

✅ **Dashboard**
- Key metrics display
- Job statistics
- Application counts
- Recent activity

✅ **Multi-Tenant**
- Company-specific branding
- Isolated data per company
- Custom careers page URLs

### In Development

⏳ **Database Migration**
- Moving from localStorage to Supabase/Prisma
- Full authentication system
- Real-time updates

⏳ **AI Features**
- Automated candidate scoring
- Resume parsing
- Match recommendations

⏳ **Advanced Features**
- Email notifications
- Interview scheduling
- Advanced analytics
- Team collaboration

## 📝 Development Guidelines

### Code Standards

1. **TypeScript First**: All code must use TypeScript with proper type definitions
2. **Component Documentation**: Every component should have clear purpose
3. **Production-Ready**: Write production-quality code from the start
4. **Consistent Naming**: Follow conventions in PROJECT_STRUCTURE.md

### Database Workflow

1. Modify `prisma/schema.prisma` for any table/column changes
2. Run `npm run db:generate` to regenerate Prisma Client types
3. Run `npm run db:push` to sync schema changes to database (development)
4. Run `npm run db:migrate` for production migrations
5. Update `supabase/policies/*.sql` files only if RLS policies need changes

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

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

## 📜 Available Scripts

```bash
# Development
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database (development)
npm run db:migrate   # Create and apply migration
npm run db:studio    # Open Prisma Studio (visual DB browser)
npm run db:seed      # Seed database with sample data
npm run db:format    # Format Prisma schema
npm run db:validate  # Validate Prisma schema
```

## 🔧 Troubleshooting

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

## 👥 Team Collaboration

### Git Workflow

```bash
# Create feature branch
git checkout -b feat/your-feature

# Make changes
git add .
git commit -m "feat: add candidate filtering"

# Push and create PR
git push origin feat/your-feature
```

### Commit Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `style:` Formatting/styling

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Compatible with: Netlify, AWS Amplify, Railway, Render

**Remember to set environment variables in your deployment platform!**

## 🎯 Hackathon Goals

**YC x HackPrinceton Fall 2025**

Building a production-level ATS to compete with Lever and Greenhouse:
- ✅ Modern, professional UI
- ✅ Comprehensive job management
- ✅ Public careers pages
- ✅ Dashboard analytics
- ✅ Candidate tracking
- 🔄 Database integration (in progress)
- ⏳ AI candidate matching
- ⏳ Email notifications

## 📄 License

Proprietary - All rights reserved

---

**Need Help?** Check [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for architecture details and development guidelines.
