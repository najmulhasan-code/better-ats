/**
 * Candidate Update API
 * Allows updating candidate information (stage, notes, etc.)
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  try {
    const { candidateId } = await params;
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

    // Verify candidate belongs to user's company
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    if (candidate.companySlug !== user.company.slug) {
      return NextResponse.json(
        { error: 'Unauthorized to update this candidate' },
        { status: 403 }
      );
    }

    // Update candidate
    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        stage: body.stage || candidate.stage,
        // Add other fields as needed in the future
      },
    });

    return NextResponse.json({
      success: true,
      candidate: {
        ...updatedCandidate,
        appliedDateTimestamp: updatedCandidate.appliedDateTimestamp.toString(),
      },
    });
  } catch (error: any) {
    console.error('Error updating candidate:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update candidate' },
      { status: 500 }
    );
  }
}
