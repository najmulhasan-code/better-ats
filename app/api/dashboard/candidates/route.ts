/**
 * Dashboard Candidates API
 * Get all candidates for the current user's company
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

    // Get all candidates for this company
    const candidates = await prisma.candidate.findMany({
      where: {
        companySlug: user.company.slug,
      },
      orderBy: {
        appliedDateTimestamp: 'desc',
      },
    });

    // Convert BigInt to string for JSON serialization
    const candidatesResponse = candidates.map(candidate => ({
      ...candidate,
      appliedDateTimestamp: candidate.appliedDateTimestamp.toString(),
    }));

    return NextResponse.json({ candidates: candidatesResponse });
  } catch (error: any) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch candidates' },
      { status: 500 }
    );
  }
}
