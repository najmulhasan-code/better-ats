/**
 * Dashboard Jobs API
 * Get all jobs for the current user's company
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !supabaseUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user from database with company
    const user = await prisma.user.findUnique({
      where: { email: supabaseUser.email! },
      include: { company: true },
    });

    if (!user || !user.company) {
      return NextResponse.json(
        { error: 'User not found or not associated with a company' },
        { status: 404 }
      );
    }

    // Get all jobs for this company with candidate counts
    const jobs = await prisma.job.findMany({
      where: {
        companySlug: user.company.slug,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            candidates: true,
          },
        },
      },
    });

    // Convert BigInt to string and add actual candidate count
    const jobsResponse = jobs.map(job => ({
      ...job,
      postedTimestamp: job.postedTimestamp ? job.postedTimestamp.toString() : null,
      applicants: job._count.candidates, // Use actual count from database
      _count: undefined, // Remove _count from response
    }));

    return NextResponse.json({ jobs: jobsResponse });
  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}
