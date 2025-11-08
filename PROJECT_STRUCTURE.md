# Better ATS - Project Structure

## Overview
This document explains the project's folder structure and naming conventions to help team members navigate and contribute effectively.

## Directory Structure

```
better-ats/
├── app/                          # Next.js App Router pages and layouts
│   ├── dashboard/                # Dashboard section (protected routes)
│   │   ├── jobs/                 # Jobs management section
│   │   │   ├── [id]/            # Individual job routes
│   │   │   │   └── candidates/   # View candidates for specific job
│   │   │   ├── components/       # Job-specific components
│   │   │   │   └── JobCard.tsx   # Job listing card
│   │   │   ├── new/              # Create new job page
│   │   │   └── page.tsx          # Jobs list page
│   │   │
│   │   ├── settings/             # Company settings page
│   │   ├── layout.tsx            # Dashboard layout wrapper
│   │   └── page.tsx              # Main dashboard overview
│   │
│   ├── jobs/                     # Public job listings (careers pages)
│   │   └── [companySlug]/        # Company-specific career pages
│   │
│   └── page.tsx                  # Landing page
│
├── components/                   # Shared components (used across multiple sections)
│   ├── layout/                   # Layout components
│   │   └── Sidebar.tsx           # Main navigation sidebar
│   │
│   ├── landing/                  # Landing page specific components
│   │   └── Hero.tsx              # Landing hero section
│   │
│   └── ui/                       # Reusable UI components
│       ├── StatCard.tsx          # Generic stat display card
│       └── FilterButton.tsx      # Generic filter button
│
├── lib/                          # Utility functions and configurations
│   ├── auth.ts                   # Authentication utilities
│   ├── companySettings.ts        # Company configuration
│   └── mockData.ts               # Mock data for development
│
└── types/                        # TypeScript type definitions (future)
```

## Naming Conventions

### Files and Folders
- **PascalCase**: React components (e.g., `MetricCard.tsx`, `JobCard.tsx`)
- **camelCase**: Utility files and non-component modules (e.g., `auth.ts`, `mockData.ts`)
- **kebab-case**: Route folders in Next.js (e.g., `[companySlug]`)
- **Descriptive names**: Use clear, specific names that describe the component's purpose

### Components
- **Single Responsibility**: Each component should have one clear purpose
- **JSDoc comments**: Add descriptive comments at the top of each component explaining its purpose and usage
- **Props interface**: Always define TypeScript interfaces for component props

Example:
```typescript
/**
 * MetricCard - Dashboard metric display component
 * Shows a single key metric with an icon and value
 * Used in the main dashboard overview
 */
export default function MetricCard({ title, value, icon }: MetricCardProps) {
  // Component implementation
}
```

## Component Organization Rules

### When to place components in `/components` (root level):
✅ Used by 2+ different app sections
✅ Landing page components
✅ Layout components (header, footer, sidebar)
✅ Generic UI components (buttons, cards, inputs)

### When to place components in `/app/[section]/components`:
✅ Only used within that specific section
✅ Specific to that section's domain logic
✅ Reduces coupling between sections

## Import Paths

### Absolute imports (use `@/` prefix):
```typescript
import { CURRENT_COMPANY } from '@/lib/auth';
import Sidebar from '@/components/layout/Sidebar';
import StatCard from '@/components/ui/StatCard';
```

### Relative imports (for section-specific components):
```typescript
import JobCard from './components/JobCard';
import MetricCard from '../components/MetricCard';
```

## Development Guidelines

1. **Production-Level Code**: All code should be production-ready
   - Proper error handling
   - TypeScript types for all props and functions
   - Meaningful variable and function names
   - Comments for complex logic

2. **Component Documentation**: Every component should have:
   - JSDoc comment explaining its purpose
   - Props interface with descriptive names
   - Usage context (where it's used)

3. **Code Organization**:
   - Group related functionality together
   - Keep components small and focused
   - Extract reusable logic into utility functions

4. **Consistent Styling**:
   - Use Tailwind CSS classes
   - Follow existing design patterns
   - Maintain visual consistency across the platform

## Adding New Features

When adding a new feature:

1. **Determine scope**: Is it section-specific or shared?
2. **Create components**: Place in appropriate folder structure
3. **Name descriptively**: Use clear, understandable names
4. **Document**: Add JSDoc comments and update this file if needed
5. **Use types**: Define TypeScript interfaces for all data structures

## Questions?

If you're unsure where to place a component or how to structure something:
1. Check if similar components exist and follow that pattern
2. Ask: "Is this used by multiple sections?" → If yes, put in `/components`
3. Ask: "Is this specific to one feature?" → If yes, put in that feature's folder
