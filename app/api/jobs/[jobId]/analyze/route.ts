/**
 * Analyze Application API
 * Analyzes a single candidate application
 */

import { NextResponse } from 'next/server';
import { analyzeApplication } from '@/lib/integration';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const body = await request.json();
    const { candidateId } = body;

    if (!candidateId) {
      return NextResponse.json(
        { error: 'Missing candidateId' },
        { status: 400 }
      );
    }

    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Analyze application
    const result = await analyzeApplication(candidateId, true, true);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('Error analyzing application:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze application' },
      { status: 500 }
    );
  }
}

