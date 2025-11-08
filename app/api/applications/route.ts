import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { ApplicationStatus } from '@prisma/client';
import { NextResponse } from 'next/server';

/**
 * GET /api/applications
 * Get applications with authentication check
 * 
 * Demonstrates using both Prisma and Supabase:
 * - Supabase: Authentication (checking if user is logged in)
 * - Prisma: Type-safe database queries
 */
export async function GET() {
  try {
    // Use Supabase for authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use Prisma for type-safe database queries
    const applications = await prisma.application.findMany({
      include: {
        candidate: true,
        jobPosting: {
          include: {
            company: true,
          },
        },
        interviews: true,
      },
      orderBy: {
        appliedAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: applications,
      user: {
        email: user.email,
        id: user.id,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/applications
 * Create a new application
 * 
 * Demonstrates using both Prisma and Supabase:
 * - Supabase: Authentication (verify user)
 * - Prisma: Type-safe database mutations
 */
export async function POST(request: Request) {
  try {
    // Use Supabase for authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { jobPostingId, candidateId, coverLetter } = body;

    // Use Prisma for type-safe database mutation
    const application = await prisma.application.create({
      data: {
        jobPostingId,
        candidateId,
        coverLetter,
        status: ApplicationStatus.APPLIED,
      },
      include: {
        candidate: true,
        jobPosting: {
          include: {
            company: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: application,
      message: 'Application created successfully',
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

