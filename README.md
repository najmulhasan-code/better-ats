<div align="center">

<img src="./public/logos/better-ats-logo-for-github.png" alt="BetterATS Logo" width="550" style="margin-bottom: 30px;"/>

### AI-Powered Applicant Tracking System
**Hire for talent and potential, not just keywords.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<p align="center">
  <a href="#key-features"><strong>Features</strong></a> •
  <a href="#technology-stack"><strong>Tech Stack</strong></a> •
  <a href="#getting-started"><strong>Getting Started</strong></a> •
  <a href="#development"><strong>Development</strong></a> •
  <a href="#license"><strong>License</strong></a>
</p>

</div>

---

<br/>

## Introduction

<div align="center">
  <a href="https://www.youtube.com/watch?v=dGjOEzMp-AQ" target="_blank">
    <img src="https://img.youtube.com/vi/dGjOEzMp-AQ/maxresdefault.jpg" alt="Watch BetterATS Introduction Video" width="700" style="border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"/>
  </a>
  <p><em>▶️ Click to watch our introduction video on YouTube</em></p>
</div>

<br/>

betterATS revolutionizes recruiting by replacing outdated keyword matching with semantic AI analysis. Our platform uses large language models to comprehensively analyze resumes, cover letters, and application responses against job requirements, helping recruiters identify the best candidates based on true fit and potential rather than resume buzzwords.

## The Problem

Traditional ATS systems rely on keyword matching, leading to qualified candidates being overlooked while less suitable ones pass through. Recruiters spend countless hours manually reviewing applications, and the best candidates often get filtered out by rigid keyword algorithms that can't understand context, experience, or potential.

## The Solution

betterATS leverages advanced AI to perform semantic analysis of entire applications. The system evaluates candidates holistically - analyzing their resume, cover letter, portfolio, and responses - against job requirements and recruiter-defined private directions. This provides deep insights into candidate quality and fit, not just keyword density.

## Key Features

- **Semantic Analysis**: LLM-powered evaluation of resumes, cover letters, and application materials
- **Smart Candidate Evaluation**: AI-driven assessment based on comprehensive analysis, not keywords
- **Private Directions**: Recruiters can define hidden filtering criteria for deeper candidate insights
- **Comprehensive Insights**: Detailed strong points, weak points, and recruiter remarks for each candidate
- **Pipeline Management**: Visual candidate pipeline with drag-and-drop stage management
- **Custom Application Forms**: Flexible job application forms with custom questions and knockout criteria

## Technology Stack

- **Framework**: Next.js 16, React 19, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth
- **AI**: Anthropic Claude & OpenAI
- **Storage**: Supabase Storage for resume PDFs
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Supabase account (for authentication and storage)
- Anthropic API key or OpenAI API key

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd better-ats

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up the database
npx prisma migrate dev
npx prisma generate

# Run development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
ANTHROPIC_API_KEY="..." # or OPENAI_API_KEY="..."
```

## Development

```bash
# Development server
npm run dev

# Database migrations
npm run db:migrate

# Database studio
npm run db:studio

# Build for production
npm run build
npm start
```

## License

MIT License
