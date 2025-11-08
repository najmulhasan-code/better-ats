# Prisma Database Schema

This directory contains the Prisma schema and seed files.

## Files

- `schema.prisma` - Database schema (source of truth for table structure)
- `seed.ts` - Seed script for sample data

## Schema Organization

The schema is organized into sections:

1. **Enums** - Type-safe enums for status fields
2. **Company Models** - Company-related tables
3. **Job Posting Models** - Job posting tables
4. **Candidate Models** - Candidate/applicant tables
5. **Application Models** - Application/job application tables
6. **Interview Models** - Interview scheduling tables

## Usage

### Generate Prisma Client

```bash
npm run db:generate
```

### Push Schema to Database

```bash
npm run db:push
```

### Create Migration

```bash
npm run db:migrate
```

### Seed Database

```bash
npm run db:seed
```

### Open Prisma Studio

```bash
npm run db:studio
```

## Schema Changes

1. Modify `schema.prisma`
2. Run `npm run db:generate` to regenerate types
3. Run `npm run db:push` to sync to database (development)
4. Or run `npm run db:migrate` to create a migration (production)

## Type Safety

After running `npm run db:generate`, you'll have:

- Type-safe models: `Company`, `JobPosting`, `Candidate`, etc.
- Type-safe enums: `EmploymentType`, `JobPostingStatus`, etc.
- Auto-completion in your IDE
- Compile-time type checking

## Notes

- Prisma schema is the source of truth for table structure
- Use Supabase SQL files for RLS policies and triggers
- Enums provide better type safety than string literals
- All timestamps use `TIMESTAMPTZ` for timezone awareness

