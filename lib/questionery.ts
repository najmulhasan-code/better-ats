/**
 * Questionnaire Analysis Module
 * 
 * Analyzes ALL non-resume application data (cover letter, custom answers, knockout answers, 
 * portfolio, LinkedIn, etc.) against job description and private directions.
 * 
 * This module consolidates all non-resume text into a single analysis.
 */

import { applicationRepository } from './repositories';
import { prisma } from './prisma';

export interface QuestioneryData {
  coverLetter?: string | null;
  customAnswers?: Record<string, string>;
  knockoutAnswers?: Record<string, string>;
  portfolio?: string | null;
  linkedin?: string | null;
  phone?: string | null;
  currentLocation?: string | null;
}

export interface QuestioneryAnalysisResult {
  strongPoints: string[];
  weakPoints: string[];
  keyInfo: string;
}

/**
 * Consolidate all questionery data into a single text block for LLM analysis
 */
export function consolidateQuestioneryData(data: QuestioneryData, applicationForm?: any): string {
  const parts: string[] = [];

  // Cover letter (if provided)
  if (data.coverLetter && data.coverLetter.trim()) {
    parts.push(`COVER LETTER:\n${data.coverLetter.trim()}\n`);
  }

  // Custom question answers
  if (data.customAnswers && Object.keys(data.customAnswers).length > 0) {
    parts.push('CUSTOM QUESTION ANSWERS:');
    const customQuestions = applicationForm?.customQuestions || [];
    Object.entries(data.customAnswers).forEach(([questionId, answer]) => {
      // Try to find the question text by ID or by index
      let questionText = `Custom Question`;
      if (customQuestions.length > 0) {
        // Try to match by ID first
        let question = customQuestions.find((q: any) => q.id === questionId);
        // If not found, try to match by index (custom-0, custom-1, etc.)
        if (!question && questionId.startsWith('custom-')) {
          const index = parseInt(questionId.replace('custom-', ''));
          if (!isNaN(index) && customQuestions[index]) {
            question = customQuestions[index];
          }
        }
        questionText = question?.label || question?.question || `Custom Question`;
      }
      parts.push(`Q: ${questionText}\nA: ${answer}\n`);
    });
  }

  // Knockout question answers
  if (data.knockoutAnswers && Object.keys(data.knockoutAnswers).length > 0) {
    parts.push('KNOCKOUT QUESTION ANSWERS:');
    const knockoutQuestions = applicationForm?.knockoutQuestions || [];
    Object.entries(data.knockoutAnswers).forEach(([questionId, answer]) => {
      // Try to find the question text
      const question = knockoutQuestions.find((q: any) => q.id === questionId);
      const questionText = question?.question || `Knockout Question`;
      parts.push(`Q: ${questionText}\nA: ${answer}\n`);
    });
  }

  // Portfolio (if provided)
  if (data.portfolio && data.portfolio.trim()) {
    parts.push(`PORTFOLIO URL: ${data.portfolio.trim()}\n`);
  }

  // LinkedIn (if provided)
  if (data.linkedin && data.linkedin.trim()) {
    parts.push(`LINKEDIN PROFILE: ${data.linkedin.trim()}\n`);
  }

  // Additional context (location, phone)
  if (data.currentLocation && data.currentLocation.trim()) {
    parts.push(`LOCATION: ${data.currentLocation.trim()}\n`);
  }

  // If no questionery data at all, return empty string
  if (parts.length === 0) {
    return '';
  }

  return parts.join('\n---\n\n');
}

/**
 * Get questionery data from candidate and application responses
 */
export async function getQuestioneryDataFromCandidate(candidateId: string): Promise<QuestioneryData> {
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: {
      applicationResponses: true,
      job: {
        include: {
          applicationForm: true,
        },
      },
    },
  });

  if (!candidate) {
    throw new Error(`Candidate not found: ${candidateId}`);
  }

  // Extract custom and knockout answers from ApplicationResponse
  const customAnswers: Record<string, string> = {};
  const knockoutAnswers: Record<string, string> = {};

  for (const response of candidate.applicationResponses) {
    const answerData = response.answer as any;
    if (answerData?.type === 'custom' && answerData?.value) {
      customAnswers[response.questionId] = answerData.value;
    } else if (answerData?.type === 'knockout' && answerData?.value) {
      knockoutAnswers[response.questionId] = answerData.value;
    }
  }

  return {
    coverLetter: candidate.coverLetter,
    customAnswers: Object.keys(customAnswers).length > 0 ? customAnswers : undefined,
    knockoutAnswers: Object.keys(knockoutAnswers).length > 0 ? knockoutAnswers : undefined,
    portfolio: candidate.portfolio,
    linkedin: candidate.linkedin,
    phone: candidate.phone || undefined,
    currentLocation: candidate.currentRole || undefined,
  };
}

/**
 * Analyze questionery data against job description
 * This is a legacy function for backward compatibility
 */
export async function analyzeQuestionery(
  applicationId: string,
  useLLM: boolean = true
): Promise<{ score: number; keyInfo: string }> {
  // This function is kept for backward compatibility
  // The new comprehensive analysis is handled in lib/llm/analysis.ts
  console.warn('analyzeQuestionery is deprecated. Use comprehensive analysis from lib/llm/analysis.ts');
  
  const questioneryData = await getQuestioneryDataFromCandidate(applicationId);
  const application = await applicationRepository.findWithRelations(applicationId) as any;
  
  if (!application) {
    throw new Error(`Application not found: ${applicationId}`);
  }

  const jobPosting = application.jobPosting || application.job;
  const questioneryText = consolidateQuestioneryData(questioneryData, jobPosting?.applicationForm);

  if (!questioneryText || questioneryText.trim().length === 0) {
    return {
      score: 0,
      keyInfo: 'No questionery data provided',
    };
  }

  // Return a basic response - actual analysis is done in comprehensive analysis
  return {
    score: 50,
    keyInfo: 'Questionery data collected. Use comprehensive analysis for detailed evaluation.',
  };
}

/**
 * Get consolidated questionery text for a candidate
 */
export async function getQuestioneryText(candidateId: string): Promise<string> {
  const questioneryData = await getQuestioneryDataFromCandidate(candidateId);
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: {
      job: {
        include: {
          applicationForm: true,
        },
      },
    },
  });

  if (!candidate) {
    throw new Error(`Candidate not found: ${candidateId}`);
  }

  return consolidateQuestioneryData(questioneryData, candidate.job?.applicationForm);
}
