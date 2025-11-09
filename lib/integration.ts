/**
 * Integration Module
 * 
 * Combines resume and questionnaire analysis results, calculates final score,
 * and stores results in database
 * Supports both LLM-based and weighted-score-based integration
 * 
 * Note: 
 * - Resumes are PDFs that need parsing (handled by resume.ts)
 * - Cover letters are text-based (stored in database, handled by questionery.ts)
 */

import 'server-only'; // Ensure this module only runs on the server

import { prisma } from './prisma';
import { analyzeResume } from './resume';
import { analyzeQuestionery } from './questionery';
import { analyzeIntegratedApplicationWithLLM } from './llm/extract';
import { applicationRepository } from './repositories';

interface IntegrationResult {
  finalScore: number;
  resumeScore: number;
  questioneryScore: number;
  resumeKeyInfo: string;
  questioneryKeyInfo: string;
  stored: boolean;
  hiringRecommendation?: 'strong_yes' | 'yes' | 'maybe' | 'no';
  comprehensiveAnalysis?: string;
  overallStrengths?: string[];
  overallWeaknesses?: string[];
  recommendations?: string[];
}

/**
 * Analyze application and store results in database
 * 
 * @param applicationId - Application ID to analyze
 * @param useLLM - Whether to use LLM for integrated analysis (default: true if API key is available)
 */
export async function analyzeApplication(
  applicationId: string,
  useLLM: boolean = true
): Promise<IntegrationResult> {
  // Fetch application to get job description for LLM analysis
  const application = await applicationRepository.findWithRelations(applicationId) as any;
  
  if (!application) {
    throw new Error(`Application not found: ${applicationId}`);
  }
  
  if (!application.jobPosting && !application.job) {
    throw new Error('Job posting not found');
  }
  
  // Get job posting (prefer jobPosting, fallback to job for backward compatibility)
  const jobPosting = application.jobPosting || application.job;
  const jobDescription = jobPosting?.description || jobPosting?.fullDescription || '';
  // Requirements is an array in the schema, convert to string
  const jobRequirements = Array.isArray(jobPosting?.requirements) 
    ? jobPosting.requirements.join(' ') 
    : (jobPosting?.requirements || '');
  
  // Run resume analysis (uses LLM if available)
  const resumeAnalysis = await analyzeResume(applicationId, useLLM);
  const resumeScore = resumeAnalysis.score;
  const resumeKeyInfo = resumeAnalysis.keyInfo;
  
  // Run questionnaire analysis (uses LLM if available)
  const questioneryAnalysis = await analyzeQuestionery(applicationId, useLLM);
  const questioneryScore = questioneryAnalysis.score;
  const questioneryKeyInfo = questioneryAnalysis.keyInfo;
  
  // Extract strengths/weaknesses from keyInfo for LLM integrated analysis
  let resumeStrengths: string[] = [];
  let resumeWeaknesses: string[] = [];
  let coverLetterStrengths: string[] = [];
  let coverLetterWeaknesses: string[] = [];
  
  // Try to extract strengths and weaknesses from keyInfo (if LLM was used)
  if (resumeKeyInfo.includes('Strengths:')) {
    const strengthsMatch = resumeKeyInfo.match(/Strengths:\s*(.+?)(?:\n|Weaknesses:|$)/s);
    if (strengthsMatch) {
      resumeStrengths = strengthsMatch[1].split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
    const weaknessesMatch = resumeKeyInfo.match(/Weaknesses:\s*(.+?)(?:\n|Recommendations:|$)/s);
    if (weaknessesMatch) {
      resumeWeaknesses = weaknessesMatch[1].split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
  }
  
  if (questioneryKeyInfo.includes('Strengths:')) {
    const strengthsMatch = questioneryKeyInfo.match(/Strengths:\s*(.+?)(?:\n|Weaknesses:|$)/s);
    if (strengthsMatch) {
      coverLetterStrengths = strengthsMatch[1].split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
    const weaknessesMatch = questioneryKeyInfo.match(/Weaknesses:\s*(.+?)(?:\n|Recommendations:|$)/s);
    if (weaknessesMatch) {
      coverLetterWeaknesses = weaknessesMatch[1].split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
  }
  
  let finalScore: number;
  let hiringRecommendation: 'strong_yes' | 'yes' | 'maybe' | 'no' | undefined;
  let comprehensiveAnalysis: string | undefined;
  let overallStrengths: string[] | undefined;
  let overallWeaknesses: string[] | undefined;
  let recommendations: string[] | undefined;
  
  // Try LLM integrated analysis if enabled and API key is available
  if (useLLM && process.env.ANTHROPIC_API_KEY && resumeStrengths.length > 0 && coverLetterStrengths.length > 0) {
    try {
      console.log('Using LLM for integrated application analysis...');
      const llmIntegratedAnalysis = await analyzeIntegratedApplicationWithLLM(
        {
          score: resumeScore,
          keyInfo: resumeKeyInfo,
          strengths: resumeStrengths,
          weaknesses: resumeWeaknesses,
        },
        {
          score: questioneryScore,
          keyInfo: questioneryKeyInfo,
          strengths: coverLetterStrengths,
          weaknesses: coverLetterWeaknesses,
        },
        jobDescription,
        jobRequirements
      );
      
      finalScore = llmIntegratedAnalysis.finalScore;
      hiringRecommendation = llmIntegratedAnalysis.hiringRecommendation;
      comprehensiveAnalysis = llmIntegratedAnalysis.comprehensiveAnalysis;
      overallStrengths = llmIntegratedAnalysis.overallStrengths;
      overallWeaknesses = llmIntegratedAnalysis.overallWeaknesses;
      recommendations = llmIntegratedAnalysis.recommendations;
    } catch (error: any) {
      console.warn('LLM integrated analysis failed, falling back to weighted scores:', error.message);
      // Fall through to weighted score calculation
      finalScore = calculateWeightedScore(resumeScore, questioneryScore);
    }
  } else {
    // Use weighted score calculation as fallback or if LLM is disabled
    console.log('Using weighted scores for integrated analysis...');
    finalScore = calculateWeightedScore(resumeScore, questioneryScore);
  }
  
  // Ensure final score is between 0-100
  const clampedFinalScore = Math.min(100, Math.max(0, finalScore));
  
  // Prepare analysis data for storage (include LLM insights if available)
  let enhancedResumeKeyInfo = resumeKeyInfo;
  let enhancedQuestioneryKeyInfo = questioneryKeyInfo;
  
  if (comprehensiveAnalysis) {
    enhancedResumeKeyInfo = `${resumeKeyInfo}\n\n--- Integrated Analysis ---\n${comprehensiveAnalysis}`;
    if (overallStrengths && overallStrengths.length > 0) {
      enhancedQuestioneryKeyInfo = `${questioneryKeyInfo}\n\nOverall Strengths: ${overallStrengths.join(', ')}`;
    }
    if (overallWeaknesses && overallWeaknesses.length > 0) {
      enhancedQuestioneryKeyInfo += `\nOverall Weaknesses: ${overallWeaknesses.join(', ')}`;
    }
    if (recommendations && recommendations.length > 0) {
      enhancedQuestioneryKeyInfo += `\nRecommendations: ${recommendations.join(', ')}`;
    }
    if (hiringRecommendation) {
      enhancedQuestioneryKeyInfo += `\nHiring Recommendation: ${hiringRecommendation}`;
    }
  }
  
  // Store analysis results in database
  try {
    // Determine analysis method
    const analysisMethod = useLLM && process.env.ANTHROPIC_API_KEY ? 'llm' : 'keyword';
    
    // Get existing candidate data to preserve matchReasons if needed
    const existingCandidate = await prisma.candidate.findUnique({
      where: { id: applicationId },
      select: { matchReasons: true },
    });
    
    // Build matchReasons from analysis insights
    const newMatchReasons = [
      ...(overallStrengths?.slice(0, 3) || []),
      ...(existingCandidate?.matchReasons?.slice(0, 2) || []),
    ].slice(0, 5);
    
    await prisma.candidate.update({
      where: { id: applicationId },
      data: {
        resumeScore: resumeScore,
        questioneryScore: questioneryScore,
        finalScore: clampedFinalScore,
        resumeAnalysisData: enhancedResumeKeyInfo,
        questioneryAnalysisData: enhancedQuestioneryKeyInfo,
        hiringRecommendation: hiringRecommendation || null,
        comprehensiveAnalysis: comprehensiveAnalysis || null,
        overallStrengths: overallStrengths || [],
        overallWeaknesses: overallWeaknesses || [],
        recommendations: recommendations || [],
        analyzedAt: new Date(),
        analysisMethod: analysisMethod,
        // Update aiScore for backward compatibility (round to int)
        aiScore: Math.round(clampedFinalScore),
        // Update matchReasons with key insights
        matchReasons: newMatchReasons.length > 0 ? newMatchReasons : (existingCandidate?.matchReasons || []),
      },
    });
    
    return {
      finalScore: clampedFinalScore,
      resumeScore: resumeScore,
      questioneryScore: questioneryScore,
      resumeKeyInfo: enhancedResumeKeyInfo,
      questioneryKeyInfo: enhancedQuestioneryKeyInfo,
      stored: true,
      hiringRecommendation,
      comprehensiveAnalysis,
      overallStrengths,
      overallWeaknesses,
      recommendations,
    };
  } catch (error: any) {
    console.error('Error storing analysis results:', error);
    // Return results even if storage fails
    return {
      finalScore: clampedFinalScore,
      resumeScore: resumeScore,
      questioneryScore: questioneryScore,
      resumeKeyInfo: enhancedResumeKeyInfo,
      questioneryKeyInfo: enhancedQuestioneryKeyInfo,
      stored: false,
      hiringRecommendation,
      comprehensiveAnalysis,
      overallStrengths,
      overallWeaknesses,
      recommendations,
    };
  }
}

/**
 * Calculate weighted final score from resume and questionnaire scores
 */
function calculateWeightedScore(resumeScore: number, questioneryScore: number): number {
  // Resume: 70% weight, Questionnaire: 30% weight
  const resumeWeight = 0.7;
  const questioneryWeight = 0.3;
  
  return Math.round(
    (resumeScore * resumeWeight + questioneryScore * questioneryWeight) * 100
  ) / 100;
}

/**
 * Get analysis results for an application
 * Returns stored results if available, otherwise returns null
 */
export async function getAnalysisResults(applicationId: string): Promise<IntegrationResult | null> {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: applicationId },
      select: {
        resumeScore: true,
        questioneryScore: true,
        finalScore: true,
        resumeAnalysisData: true,
        questioneryAnalysisData: true,
        hiringRecommendation: true,
        comprehensiveAnalysis: true,
        overallStrengths: true,
        overallWeaknesses: true,
        recommendations: true,
        analyzedAt: true,
      },
    });
    
    if (!candidate) {
      return null;
    }
    
    // Check if analysis has been performed
    if (candidate.resumeScore === null || candidate.questioneryScore === null || !candidate.analyzedAt) {
      return null;
    }
    
    return {
      finalScore: candidate.finalScore || 0,
      resumeScore: candidate.resumeScore || 0,
      questioneryScore: candidate.questioneryScore || 0,
      resumeKeyInfo: candidate.resumeAnalysisData || '',
      questioneryKeyInfo: candidate.questioneryAnalysisData || '',
      stored: true,
      hiringRecommendation: candidate.hiringRecommendation as 'strong_yes' | 'yes' | 'maybe' | 'no' | undefined,
      comprehensiveAnalysis: candidate.comprehensiveAnalysis || undefined,
      overallStrengths: candidate.overallStrengths || undefined,
      overallWeaknesses: candidate.overallWeaknesses || undefined,
      recommendations: candidate.recommendations || undefined,
    };
  } catch (error) {
    console.error('Error fetching analysis results:', error);
    return null;
  }
}

/**
 * Re-analyze application (recalculate and update scores)
 * 
 * @param applicationId - Application ID to re-analyze
 * @param useLLM - Whether to use LLM for integrated analysis (default: true if API key is available)
 */
export async function reanalyzeApplication(
  applicationId: string,
  useLLM: boolean = true
): Promise<IntegrationResult> {
  return analyzeApplication(applicationId, useLLM);
}

