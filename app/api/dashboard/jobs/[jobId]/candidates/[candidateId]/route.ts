/**
 * Single Candidate API
 * Get a specific candidate by ID
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string; candidateId: string }> }
) {
  try {
    const { jobId, candidateId } = await params;
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

    // Get candidate with application responses
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        applicationResponses: true,
      },
    });

    if (!candidate || candidate.companySlug !== user.company.slug || candidate.jobId !== jobId) {
      return NextResponse.json(
        { error: 'Candidate not found or access denied' },
        { status: 404 }
      );
    }

    // Convert BigInt to string for JSON serialization
    const candidateResponse = {
      ...candidate,
      appliedDateTimestamp: candidate.appliedDateTimestamp.toString(),
    };

    return NextResponse.json({ candidate: candidateResponse });
  } catch (error: any) {
    console.error('Error fetching candidate:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch candidate' },
      { status: 500 }
    );
  }
}
