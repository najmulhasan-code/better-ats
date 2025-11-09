/**
 * LLM-based Comparative Ranking
 * 
 * Ranks candidates relative to each other using LLM comparative analysis.
 * Private directions dominate ranking order.
 */

import { prisma } from '../prisma';
import { callLLM, isLLMAvailable } from '../llm/client';

export interface CandidateSummary {
  candidateId: string;
  name: string;
  resumeStrongPoints: string[];
  resumeWeakPoints: string[];
  questioneryStrongPoints: string[];
  questioneryWeakPoints: string[];
  overallStrongPoints: string[];
  overallWeakPoints: string[];
  recruiterRemarks: string;
  privateDirectionsCompliance: {
    meetsRequirements: boolean;
    complianceScore: number;
    reasoning: string;
  } | null;
}

export interface RankingResult {
  candidateId: string;
  rank: number;
  rankingScore: number;
  reasoning: string;
  keyDifferentiators: string[];
  algorithm: string;
}

export interface ComparativeRankingResult {
  ranking: RankingResult[];
  algorithm: string;
  rankingMethod: string;
  totalCandidates: number;
  rankedAt: string;
}

/**
 * Perform comparative ranking of candidates for a job
 */
export async function performComparativeRanking(
  candidateSummaries: CandidateSummary[],
  jobDescription: string,
  jobRequirements: string[],
  jobResponsibilities: string[],
  privateDirections: string | null
): Promise<ComparativeRankingResult> {
  if (!isLLMAvailable()) {
    throw new Error('Neither ANTHROPIC_API_KEY nor OPENAI_API_KEY is set. Comparative ranking requires at least one API key.');
  }

  if (candidateSummaries.length === 0) {
    return {
      ranking: [],
      algorithm: 'LLM Comparative Ranking v1.0',
      rankingMethod: 'Comparative analysis considering resume, questionery, job description, and private directions. Private directions have dominant weight. No hardcoded scoring weights - LLM determines relative importance.',
      totalCandidates: 0,
      rankedAt: new Date().toISOString(),
    };
  }

  // If only one candidate, rank them as #1
  if (candidateSummaries.length === 1) {
    return {
      ranking: [
        {
          candidateId: candidateSummaries[0].candidateId,
          rank: 1,
          rankingScore: 100,
          reasoning: 'Only candidate for this position',
          keyDifferentiators: [],
          algorithm: 'LLM Comparative Ranking v1.0',
        },
      ],
      algorithm: 'LLM Comparative Ranking v1.0',
      rankingMethod: 'Comparative analysis considering resume, questionery, job description, and private directions. Private directions have dominant weight. No hardcoded scoring weights - LLM determines relative importance.',
      totalCandidates: 1,
      rankedAt: new Date().toISOString(),
    };
  }

  // Format requirements and responsibilities
  const requirementsText = Array.isArray(jobRequirements) 
    ? jobRequirements.join('\n') 
    : (jobRequirements || '');
  const responsibilitiesText = Array.isArray(jobResponsibilities)
    ? jobResponsibilities.join('\n')
    : (jobResponsibilities || '');

  // Format candidate summaries for prompt
  const candidateSummariesText = candidateSummaries.map((candidate, idx) => {
    return `[Candidate ${idx + 1}]:
- Name: ${candidate.name}
- Candidate ID: ${candidate.candidateId}
- Resume Strong Points: ${candidate.resumeStrongPoints.join('; ')}
- Resume Weak Points: ${candidate.resumeWeakPoints.join('; ')}
- Questionery Strong Points: ${candidate.questioneryStrongPoints.join('; ')}
- Questionery Weak Points: ${candidate.questioneryWeakPoints.join('; ')}
- Overall Strong Points: ${candidate.overallStrongPoints.join('; ')}
- Overall Weak Points: ${candidate.overallWeakPoints.join('; ')}
- Recruiter Remarks: ${candidate.recruiterRemarks}
- Private Directions Compliance: ${candidate.privateDirectionsCompliance 
    ? `Meets Requirements: ${candidate.privateDirectionsCompliance.meetsRequirements}, Score: ${candidate.privateDirectionsCompliance.complianceScore}, Reasoning: ${candidate.privateDirectionsCompliance.reasoning}`
    : 'No private directions specified'}
---`;
  }).join('\n\n');

  // Build the prompt
  const prompt = `You are an expert recruiter ranking job candidates.

JOB DESCRIPTION:
${jobDescription}

JOB REQUIREMENTS:
${requirementsText}

JOB RESPONSIBILITIES:
${responsibilitiesText}

${privateDirections ? `PRIVATE DIRECTIONS (CRITICAL - MUST DOMINATE RANKING):
${privateDirections}

IMPORTANT: Private directions MUST dominate ranking order. If private directions say "citizens only" and a candidate is not a citizen, rank them lower regardless of other qualifications. Private directions take precedence over all other factors.
` : ''}

CANDIDATES TO RANK:
${candidateSummariesText}

TASK:
Rank these candidates from BEST to WORST fit for this position.

CRITICAL RULES:
1. Private directions MUST dominate ranking - if private directions exist and a candidate doesn't meet them, rank them lower regardless of other qualifications
2. Consider both resume and questionery (determine relative importance based on context - no fixed weights)
3. Consider overall potential, not just keyword matching
4. Be fair and unbiased - focus on qualifications only
5. Provide clear reasoning for ranking order
6. Identify key differentiators that make each candidate stand out

Return your response as a JSON object with this exact structure:
{
  "ranking": [
    {
      "candidateId": "uuid",
      "rank": 1,
      "rankingScore": 0-100,
      "reasoning": "why this candidate is ranked #1",
      "keyDifferentiators": ["what makes this candidate stand out"],
      "algorithm": "LLM Comparative Ranking v1.0"
    },
    ... (ordered from best to worst, rank 1 is best)
  ],
  "algorithm": "LLM Comparative Ranking v1.0",
  "rankingMethod": "Comparative analysis considering resume, questionery, job description, and private directions. Private directions have dominant weight. No hardcoded scoring weights - LLM determines relative importance.",
  "totalCandidates": ${candidateSummaries.length},
  "rankedAt": "${new Date().toISOString()}"
}

IMPORTANT:
- Rank 1 is the BEST candidate, higher numbers are worse fits
- rankingScore should reflect the candidate's fit (0-100, where 100 is perfect fit)
- reasoning should explain why this candidate is ranked at this position
- keyDifferentiators should highlight what makes this candidate unique (positive or negative)
- Return ONLY valid JSON, no additional text or markdown formatting`;

  // Use unified LLM client with automatic Anthropic -> OpenAI fallback
  console.log(`[LLM Ranking] Starting ranking with automatic provider fallback...`);
  
  try {
    const response = await callLLM(prompt, {
      temperature: 0.2, // Lower temperature for more consistent ranking
      maxTokens: 4096,
    });

    console.log(`[LLM Ranking] ✅ Ranking completed using ${response.provider} (${response.model})`);

    const responseText = response.content;

      let jsonText = responseText.trim();
      
      // Remove markdown code blocks if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const result = JSON.parse(jsonText) as ComparativeRankingResult;

      // Validate and ensure all candidates are ranked
      const rankedCandidateIds = new Set(result.ranking.map(r => r.candidateId));
      const allCandidateIds = new Set(candidateSummaries.map(c => c.candidateId));

      // Check if all candidates are ranked
      if (rankedCandidateIds.size !== allCandidateIds.size) {
        console.warn('Not all candidates were ranked by LLM. Adding missing candidates at the end.');
        
        // Add missing candidates at the end
        for (const candidate of candidateSummaries) {
          if (!rankedCandidateIds.has(candidate.candidateId)) {
            result.ranking.push({
              candidateId: candidate.candidateId,
              rank: result.ranking.length + 1,
              rankingScore: 0,
              reasoning: 'Candidate not ranked by LLM',
              keyDifferentiators: [],
              algorithm: 'LLM Comparative Ranking v1.0',
            });
          }
        }
      }

      // Validate ranking scores and ranks
      result.ranking = result.ranking.map(rank => ({
        ...rank,
        rankingScore: Math.max(0, Math.min(100, rank.rankingScore || 0)),
        algorithm: rank.algorithm || 'LLM Comparative Ranking v1.0',
        keyDifferentiators: Array.isArray(rank.keyDifferentiators) 
          ? rank.keyDifferentiators.filter((d: any) => typeof d === 'string' && d.trim().length > 0)
          : [],
      }));

      // Ensure algorithm and method are set
      result.algorithm = result.algorithm || 'LLM Comparative Ranking v1.0';
      result.rankingMethod = result.rankingMethod || 'Comparative analysis considering resume, questionery, job description, and private directions. Private directions have dominant weight. No hardcoded scoring weights - LLM determines relative importance.';
      result.totalCandidates = candidateSummaries.length;
      result.rankedAt = result.rankedAt || new Date().toISOString();

    return result;
  } catch (error: any) {
    console.error('[LLM Ranking] Ranking failed:', error);
    throw new Error(`LLM comparative ranking failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Rank all candidates for a job
 */
export async function rankCandidatesForJob(jobId: string): Promise<ComparativeRankingResult> {
  // Get job with private directions
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      applicationForm: true,
    },
  });

  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }

  // Get all analyzed candidates for this job
  // Type assertion needed until Prisma client is regenerated after schema changes
  const candidates = await prisma.candidate.findMany({
    where: {
      jobId: jobId,
      analyzedAt: { not: null }, // Only rank analyzed candidates
    },
    orderBy: {
      appliedDateTimestamp: 'desc',
    },
  }) as any[];

  if (candidates.length === 0) {
    return {
      ranking: [],
      algorithm: 'LLM Comparative Ranking v1.0',
      rankingMethod: 'Comparative analysis considering resume, questionery, job description, and private directions. Private directions have dominant weight. No hardcoded scoring weights - LLM determines relative importance.',
      totalCandidates: 0,
      rankedAt: new Date().toISOString(),
    };
  }

  // Prepare candidate summaries
  const candidateSummaries: CandidateSummary[] = candidates.map(candidate => ({
    candidateId: candidate.id,
    name: candidate.name,
    resumeStrongPoints: candidate.resumeStrongPoints || [],
    resumeWeakPoints: candidate.resumeWeakPoints || [],
    questioneryStrongPoints: candidate.questioneryStrongPoints || [],
    questioneryWeakPoints: candidate.questioneryWeakPoints || [],
    overallStrongPoints: candidate.overallStrongPoints || [],
    overallWeakPoints: candidate.overallWeakPoints || [],
    recruiterRemarks: candidate.recruiterRemarks || 'No remarks available',
    privateDirectionsCompliance: candidate.privateDirectionsCompliance as any || null,
  }));

  // Perform comparative ranking
  const rankingResult = await performComparativeRanking(
    candidateSummaries,
    job.description || job.fullDescription || '',
    job.requirements || [],
    job.responsibilities || [],
    job.privateDirections
  );

  // Update candidate ranks in database
  // Type assertion needed until Prisma client is regenerated after schema changes
  for (const rank of rankingResult.ranking) {
    await prisma.candidate.update({
      where: { id: rank.candidateId },
      data: {
        rankingScore: rank.rankingScore,
        rankPosition: rank.rank,
        rankingReasoning: rank.reasoning,
        keyDifferentiators: rank.keyDifferentiators,
        rankingAlgorithm: rank.algorithm,
      } as any,
    });
  }

  // Update job ranking metadata
  await prisma.job.update({
    where: { id: jobId },
    data: {
      lastRankedAt: new Date(),
      sortingAlgorithm: rankingResult.algorithm,
      rankingVersion: '1.0',
    },
  });

  return rankingResult;
}

