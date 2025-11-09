/**
 * Dashboard Stats API
 * Get jobs and candidates stats for the current user's company
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

    // Get all jobs
    const jobs = await prisma.job.findMany({
      where: { companySlug: user.company.slug },
    });

    // Get all candidates
    const candidates = await prisma.candidate.findMany({
      where: { companySlug: user.company.slug },
    });

    // Convert BigInt to string
    const jobsResponse = jobs.map(job => ({
      ...job,
      postedTimestamp: job.postedTimestamp ? job.postedTimestamp.toString() : null,
    }));

    const candidatesResponse = candidates.map(candidate => ({
      ...candidate,
      appliedDateTimestamp: candidate.appliedDateTimestamp.toString(),
    }));

    return NextResponse.json({
      jobs: jobsResponse,
      candidates: candidatesResponse,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
