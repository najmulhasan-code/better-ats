/**
 * Rank Candidates API
 * Triggers ranking for all candidates in a job
 */

import { NextResponse } from 'next/server';
import { rankCandidatesForJob } from '@/lib/ranking/comparative';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Perform ranking
    const result = await rankCandidatesForJob(jobId);

    return NextResponse.json({
      success: true,
      ranking: result,
    });
  } catch (error: any) {
    console.error('Error ranking candidates:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to rank candidates' },
      { status: 500 }
    );
  }
}

