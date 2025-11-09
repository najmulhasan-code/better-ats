/**
 * Jobs API
 * Create and manage jobs
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
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

    const body = await request.json();
    const {
      title,
      department,
      location,
      type,
      salary,
      description,
      fullDescription,
      responsibilities,
      requirements,
      niceToHave,
      privateDirections,
      status = 'draft',
      applicationForm,
    } = body;

    // Validate required fields
    if (!title || !department || !location || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: title, department, location, type' },
        { status: 400 }
      );
    }

    // Create job
    const now = new Date();
    const posted = status === 'published' ? now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
    const postedTimestamp = status === 'published' ? BigInt(now.getTime()) : null;

    const job = await prisma.job.create({
      data: {
        companySlug: user.company.slug,
        title,
        department,
        location,
        type,
        salary: salary || null,
        description: description || null,
        fullDescription: fullDescription || null,
        responsibilities: responsibilities || [],
        requirements: requirements || [],
        niceToHave: niceToHave || [],
        privateDirections: privateDirections || null,
        status,
        posted,
        postedTimestamp,
        applicants: 0,
      },
      include: {
        company: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    });

    // Create application form if provided
    if (applicationForm) {
      await prisma.applicationForm.create({
        data: {
          jobId: job.id,
          standardFields: applicationForm.standardFields || [],
          knockoutQuestions: applicationForm.knockoutQuestions || [],
          eeoFields: applicationForm.eeoFields || {},
          customQuestions: applicationForm.customQuestions || [],
        },
      });
    }

    // Convert BigInt to string for JSON serialization
    const jobResponse = {
      ...job,
      postedTimestamp: job.postedTimestamp ? job.postedTimestamp.toString() : null,
    };

    return NextResponse.json({ job: jobResponse }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create job' },
      { status: 500 }
    );
  }
}
