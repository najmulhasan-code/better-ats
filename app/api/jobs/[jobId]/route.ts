/**
 * Job Management API
 * Public GET - used by job detail pages
 * Protected PATCH/DELETE - used by recruiters
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: {
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            website: true,
          },
        },
        applicationForm: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Convert BigInt to string for JSON serialization
    const jobResponse = {
      ...job,
      postedTimestamp: job.postedTimestamp ? job.postedTimestamp.toString() : null,
    };

    return NextResponse.json({ job: jobResponse });
  } catch (error: any) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch job' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const body = await request.json();

    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !supabaseUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user's company
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

    // Verify job belongs to user's company
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.companySlug !== user.company.slug) {
      return NextResponse.json(
        { error: 'Unauthorized to update this job' },
        { status: 403 }
      );
    }

    // Build update data - support both status-only updates and full job updates
    const updateData: any = {};

    // Status update
    if (body.status !== undefined) {
      updateData.status = body.status;
      // Set posted date when publishing
      if (body.status === 'published' && !job.posted) {
        updateData.posted = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        updateData.postedTimestamp = BigInt(Date.now());
      }
    }

    // Full job data updates
    if (body.title !== undefined) updateData.title = body.title;
    if (body.department !== undefined) updateData.department = body.department;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.salary !== undefined) updateData.salary = body.salary;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.fullDescription !== undefined) updateData.fullDescription = body.fullDescription;
    if (body.responsibilities !== undefined) updateData.responsibilities = body.responsibilities;
    if (body.requirements !== undefined) updateData.requirements = body.requirements;
    if (body.niceToHave !== undefined) updateData.niceToHave = body.niceToHave;
    if (body.privateDirections !== undefined) updateData.privateDirections = body.privateDirections;

    // Check if private directions changed (will trigger re-ranking)
    const privateDirectionsChanged = body.privateDirections !== undefined && 
      body.privateDirections !== job.privateDirections;

    // Update job
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: updateData,
    });

    // If private directions changed, trigger re-analysis and re-ranking
    if (privateDirectionsChanged && process.env.ANTHROPIC_API_KEY) {
      // Re-analyze all candidates and re-rank (async, don't block response)
      import('@/lib/integration').then(({ analyzeApplication }) => {
        import('@/lib/ranking/comparative').then(({ rankCandidatesForJob }) => {
          // Get all candidates for this job
          prisma.candidate.findMany({
            where: { jobId: jobId },
            select: { id: true },
          }).then((candidates) => {
            // Re-analyze all candidates
            Promise.all(
              candidates.map(candidate => 
                analyzeApplication(candidate.id, true, false).catch((error) => {
                  console.error(`Error re-analyzing candidate ${candidate.id}:`, error);
                })
              )
            ).then(() => {
              // Re-rank after all analyses complete
              rankCandidatesForJob(jobId).catch((error) => {
                console.error(`Error re-ranking job ${jobId}:`, error);
              });
            });
          });
        });
      });
    }

    return NextResponse.json({
      success: true,
      job: {
        ...updatedJob,
        postedTimestamp: updatedJob.postedTimestamp ? updatedJob.postedTimestamp.toString() : null,
      },
    });
  } catch (error: any) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update job' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !supabaseUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user's company
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

    // Verify job belongs to user's company
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.companySlug !== user.company.slug) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this job' },
        { status: 403 }
      );
    }

    // Delete the job (cascades to candidates and application forms)
    await prisma.job.delete({
      where: { id: jobId },
    });

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete job' },
      { status: 500 }
    );
  }
}
