/**
 * Candidate Analysis API
 * Analyzes a candidate's application and returns detailed scoring and analysis
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { analyzeApplication, getAnalysisResults } from '@/lib/integration';

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

    // Verify candidate exists and belongs to user's company
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate || candidate.companySlug !== user.company.slug || candidate.jobId !== jobId) {
      return NextResponse.json(
        { error: 'Candidate not found or access denied' },
        { status: 404 }
      );
    }

    // Try to get existing analysis results first
    const existingAnalysis = await getAnalysisResults(candidateId);
    if (existingAnalysis && existingAnalysis.stored) {
      return NextResponse.json({ analysis: existingAnalysis, cached: true });
    }
    
    // If no existing analysis, run new analysis
    try {
      const analysis = await analyzeApplication(candidateId, true);
      return NextResponse.json({ analysis, cached: false });
    } catch (error: any) {
      // If analysis fails (e.g., missing resume or cover letter), return error
      return NextResponse.json(
        { error: error.message || 'Failed to analyze application' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error analyzing candidate:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze candidate' },
      { status: 500 }
    );
  }
}

/**
 * Trigger analysis and optionally update candidate's aiScore
 */
export async function POST(
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

    // Verify candidate exists and belongs to user's company
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate || candidate.companySlug !== user.company.slug || candidate.jobId !== jobId) {
      return NextResponse.json(
        { error: 'Candidate not found or access denied' },
        { status: 404 }
      );
    }

    // Analyze the application
    const analysis = await analyzeApplication(candidateId, true);

    // Get scores from analysis result
    // The analysis should have finalScore, resumeScore, questioneryScore from integration.ts
    let finalScore = analysis.finalScore;
    let resumeScore = analysis.resumeScore;
    let questioneryScore = analysis.questioneryScore;

    // If scores are not in analysis result, use complianceScore as fallback
    if (finalScore == null || isNaN(finalScore)) {
      finalScore = analysis.privateDirectionsCompliance?.complianceScore ?? 0;
    }
    if (resumeScore == null || isNaN(resumeScore)) {
      resumeScore = finalScore;
    }
    if (questioneryScore == null || isNaN(questioneryScore)) {
      questioneryScore = finalScore;
    }

    // Validate all scores are numbers and within 0-100 range
    const validFinalScore = typeof finalScore === 'number' && !isNaN(finalScore) 
      ? Math.max(0, Math.min(100, finalScore)) 
      : 0;
    const validResumeScore = typeof resumeScore === 'number' && !isNaN(resumeScore) 
      ? Math.max(0, Math.min(100, resumeScore)) 
      : 0;
    const validQuestioneryScore = typeof questioneryScore === 'number' && !isNaN(questioneryScore) 
      ? Math.max(0, Math.min(100, questioneryScore)) 
      : 0;

    await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        aiScore: Math.round(validFinalScore),
        finalScore: validFinalScore,
        resumeScore: validResumeScore,
        questioneryScore: validQuestioneryScore,
        // Store match reasons from analysis
        matchReasons: [
          `Resume Score: ${Math.round(validResumeScore)}%`,
          `Cover Letter Score: ${Math.round(validQuestioneryScore)}%`,
          ...(analysis.overallStrongPoints || []).slice(0, 3),
        ].filter(Boolean),
      } as any,
    });

    return NextResponse.json({ 
      analysis,
      updated: true,
      message: 'Analysis completed and candidate score updated',
    });
  } catch (error: any) {
    console.error('Error analyzing candidate:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze candidate' },
      { status: 500 }
    );
  }
}

