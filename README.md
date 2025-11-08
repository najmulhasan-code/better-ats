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
- **Modern Tech Stack**: Built with Next.js 15, TypeScript, and Tailwind CSS v4

## 📁 Project Structure

For detailed information about the project structure, naming conventions, and development guidelines, see **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)**.

### Quick Overview

```
better-ats/
├── app/                    # Next.js App Router
│   ├── dashboard/          # Protected dashboard (jobs, candidates, settings)
│   └── jobs/               # Public careers pages
├── components/             # Shared components (layout, ui, landing)
└── lib/                    # Utilities and configurations
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Charts**: Recharts
- **Future**: Supabase (planned for production database)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## 📝 Development Guidelines

### Code Standards

1. **TypeScript First**: All code must use TypeScript with proper type definitions
2. **Component Documentation**: Every component must have JSDoc comments
3. **Production-Ready**: Write production-quality code from the start
4. **Consistent Naming**: Follow conventions in PROJECT_STRUCTURE.md

### Component Example

```typescript
/**
 * MetricCard - Dashboard metric display component
 * Shows a single key metric with an icon and value
 * Used in the main dashboard overview
 */
export default function MetricCard({ title, value, icon }: MetricCardProps) {
  // Implementation
}
```

### File Organization

- **Section-specific**: `app/[section]/components/`
- **Shared**: `components/[category]/`
- **Utilities**: `lib/`

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed guidelines.

## 🏗️ Architecture

### Multi-Tenancy

Each company has a unique slug for their careers page:
- `/jobs/demo-company` - Demo Company careers
- `/jobs/techstart` - TechStart Inc careers

### Current State (MVP)

- Frontend complete with mock data
- All features functional for testing
- Ready for backend integration

### Production Roadmap

1. ✅ **Phase 1**: Frontend + Mock Data
2. ⏳ **Phase 2**: Supabase + Authentication
3. ⏳ **Phase 3**: AI Matching Engine
4. ⏳ **Phase 4**: Email Notifications
5. ⏳ **Phase 5**: Advanced Analytics

## 🎨 Design System

- **Colors**: Slate (primary), Emerald (success), Amber (warning), Red (danger)
- **Typography**: Bold headings, medium body, consistent hierarchy
- **Spacing**: Tailwind scale, standard gaps of 4-6
- **Components**: Reusable, documented, production-ready

## 📊 Features

### Dashboard
- Key metrics with real-time data
- Application trends and pipeline analytics
- Recent applications feed
- Quick action shortcuts

### Jobs Management
- Create/edit job postings with rich editor
- Custom application forms
- Status management (active/draft/closed)
- Per-job analytics and applicant tracking

### Candidates
- AI match scoring and ranking
- Pipeline stages (Applied → Hired)
- Candidate profiles and history
- Advanced filtering and search

### Settings
- Department configuration
- Location management
- Job type customization
- Company branding (planned)

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

## 🎯 Hackathon Goals

**YC x HackPrinceton Fall 2025**

Building a production-level ATS to compete with Lever and Greenhouse:
- ✅ Modern, professional UI
- ✅ Comprehensive job management
- ✅ Public careers pages
- ✅ Dashboard analytics
- ⏳ AI candidate matching
- ⏳ Backend integration

## 📄 License

Proprietary - All rights reserved

---

**Need Help?** Check [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for architecture details and development guidelines.