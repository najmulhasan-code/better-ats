/**
 * Get Jobs by Company Slug
 * Public API - used by job board pages
 * Returns only active jobs
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { slug },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Get published jobs
    const jobs = await prisma.job.findMany({
      where: {
        companySlug: slug,
        status: 'published',
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        department: true,
        location: true,
        type: true,
        salary: true,
        description: true,
        fullDescription: true,
        responsibilities: true,
        requirements: true,
        niceToHave: true,
        posted: true,
        postedTimestamp: true,
        applicants: true,
        createdAt: true,
      },
    });

    // Convert BigInt to string for JSON serialization
    const jobsResponse = jobs.map(job => ({
      ...job,
      postedTimestamp: job.postedTimestamp ? job.postedTimestamp.toString() : null,
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
