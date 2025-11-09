/**
 * Ranking Info API
 * Returns ranking algorithm information for a job
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

    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get job with ranking info
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        title: true,
        privateDirections: true,
        sortingAlgorithm: true,
        lastRankedAt: true,
        rankingVersion: true,
        _count: {
          select: {
            candidates: {
              where: {
                analyzedAt: { not: null },
              },
            },
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      jobId: job.id,
      jobTitle: job.title,
      algorithm: job.sortingAlgorithm || 'LLM Comparative Ranking v1.0',
      rankingMethod: 'Comparative analysis considering resume, questionery, job description, and private directions. Private directions have dominant weight. No hardcoded scoring weights - LLM determines relative importance.',
      rankingVersion: job.rankingVersion || '1.0',
      lastRankedAt: job.lastRankedAt,
      totalAnalyzedCandidates: job._count.candidates,
      hasPrivateDirections: !!job.privateDirections,
    });
  } catch (error: any) {
    console.error('Error fetching ranking info:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch ranking info' },
      { status: 500 }
    );
  }
}

