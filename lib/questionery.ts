/**
 * Questionnaire Analysis Module
 * 
 * Analyzes cover letter/questionnaire (text-based) against job description and calculates similarity score
 * Supports both LLM-based and keyword-based analysis
 * 
 * Note: Cover letters are stored as text in the database (not PDFs like resumes).
 * This module works directly with the text content.
 */

import { applicationRepository } from './repositories';
import { analyzeCoverLetterMatchWithLLM } from './llm/extract';

interface QuestioneryAnalysisResult {
  score: number;
  keyInfo: string;
}

/**
 * Extract keywords from text
 * Uses LLM when available, falls back to simple word extraction
 */
async function extractKeywords(text: string, useLLM: boolean = true, context?: string): Promise<string[]> {
  if (!text) return [];
  
  // Try LLM extraction if enabled and API key is available
  if (useLLM && process.env.ANTHROPIC_API_KEY) {
    try {
      const { extractKeywordsWithLLM } = await import('./llm/extract');
      return await extractKeywordsWithLLM(text, context);
    } catch (error: any) {
      console.warn('LLM keyword extraction failed, using fallback:', error.message);
      // Fall through to simple extraction
    }
  }
  
  // Simple fallback: extract words without hardcoded stop words
  // Let the LLM handle intelligent filtering when available
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2) // Filter very short words
    .filter(word => !/^\d+$/.test(word)); // Filter pure numbers
  
  // Return unique words (no stop word filtering - let LLM handle that)
  return [...new Set(words)];
}

/**
 * Calculate keyword match score between two texts
 * Uses LLM for keyword extraction when available
 */
async function calculateKeywordMatch(text1: string, text2: string, useLLM: boolean = true): Promise<number> {
  const keywords1 = await extractKeywords(text1, useLLM, 'job description');
  const keywords2 = await extractKeywords(text2, useLLM, 'cover letter');
  
  if (keywords1.length === 0 || keywords2.length === 0) return 0;
  
  // Count matching keywords (fuzzy matching for similar terms)
  const matches = keywords1.filter(keyword => 
    keywords2.some(kw => 
      kw === keyword || 
      kw.includes(keyword) || 
      keyword.includes(kw) ||
      // Simple similarity check for compound words
      (keyword.split(/\s+/).length > 1 && kw.includes(keyword.split(/\s+/)[0]))
    )
  ).length;
  
  // Calculate percentage
  return (matches / keywords1.length) * 100;
}

/**
 * Calculate basic text similarity using Jaccard similarity
 * Uses LLM for keyword extraction when available
 */
async function calculateTextSimilarity(text1: string, text2: string, useLLM: boolean = true): Promise<number> {
  const keywords1 = await extractKeywords(text1, useLLM, 'job description');
  const keywords2 = await extractKeywords(text2, useLLM, 'cover letter');
  const words1 = new Set(keywords1);
  const words2 = new Set(keywords2);
  
  if (words1.size === 0 || words2.size === 0) return 0;
  
  // Calculate intersection
  const intersection = new Set([...words1].filter(word => words2.has(word)));
  
  // Calculate union
  const union = new Set([...words1, ...words2]);
  
  // Jaccard similarity
  const similarity = (intersection.size / union.size) * 100;
  
  return similarity;
}

/**
 * Extract relevant phrases from text based on job description
 * Uses LLM for keyword extraction when available
 */
async function extractRelevantPhrases(coverLetter: string, jobText: string, maxPhrases: number = 3, useLLM: boolean = true): Promise<string[]> {
  const sentences = coverLetter.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const jobKeywords = await extractKeywords(jobText, useLLM, 'job description');
  
  // Score each sentence based on keyword matches
  const scoredSentences = await Promise.all(sentences.map(async sentence => {
    const sentenceKeywords = await extractKeywords(sentence, useLLM, 'cover letter sentence');
    const matches = sentenceKeywords.filter(sk =>
      jobKeywords.some(jk => 
        jk === sk ||
        jk.includes(sk) || 
        sk.includes(jk)
      )
    ).length;
    return { sentence: sentence.trim(), score: matches };
  }));
  
  // Sort by score and return top phrases
  return scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, maxPhrases)
    .filter(item => item.score > 0)
    .map(item => item.sentence);
}

/**
 * Check if cover letter addresses job requirements
 * Uses LLM for keyword extraction when available
 */
async function checkRequirementsAddressed(coverLetter: string, requirements: string, useLLM: boolean = true): Promise<number> {
  if (!requirements) return 50; // Default score if no requirements
  
  const requirementKeywords = await extractKeywords(requirements, useLLM, 'job requirements');
  const coverLetterKeywords = await extractKeywords(coverLetter, useLLM, 'cover letter');
  
  if (requirementKeywords.length === 0) return 50;
  
  // Count how many requirement keywords are mentioned in cover letter
  const addressed = requirementKeywords.filter(reqKw =>
    coverLetterKeywords.some(clKw => 
      clKw === reqKw ||
      clKw.includes(reqKw) || 
      reqKw.includes(clKw)
    )
  ).length;
  
  // Calculate percentage
  return (addressed / requirementKeywords.length) * 100;
}

/**
 * Analyze questionnaire/cover letter against job description
 * 
 * Cover letters are text-based (stored in database), not PDFs like resumes.
 * This function reads the cover letter text directly from the database.
 * 
 * @param applicationId - Application ID to analyze
 * @param useLLM - Whether to use LLM analysis (default: true if API key is available)
 */
export async function analyzeQuestionery(
  applicationId: string,
  useLLM: boolean = true
): Promise<QuestioneryAnalysisResult> {
  // Fetch application with relations
  const application = await applicationRepository.findWithRelations(applicationId) as any;
  
  if (!application) {
    throw new Error(`Application not found: ${applicationId}`);
  }
  
  if (!application.coverLetter) {
    throw new Error('Cover letter not found for application');
  }
  
  if (!application.jobPosting && !application.job) {
    throw new Error('Job posting not found');
  }
  
  // Get cover letter text directly from database (no PDF parsing needed)
  const coverLetter = application.coverLetter; // This is already text, not a PDF
  // Get job posting (prefer jobPosting, fallback to job for backward compatibility)
  const jobPosting = application.jobPosting || application.job;
  const jobDescription = jobPosting?.description || jobPosting?.fullDescription || '';
  // Requirements is an array in the schema, convert to string
  const jobRequirements = Array.isArray(jobPosting?.requirements) 
    ? jobPosting.requirements.join(' ') 
    : (jobPosting?.requirements || '');
  
  // Try LLM analysis first if enabled and API key is available
  if (useLLM && process.env.ANTHROPIC_API_KEY) {
    try {
      console.log('Using LLM for cover letter analysis...');
      const llmAnalysis = await analyzeCoverLetterMatchWithLLM(
        coverLetter,
        jobDescription,
        jobRequirements
      );
      
      // Convert LLM analysis to QuestioneryAnalysisResult format
      const keyInfo = `${llmAnalysis.keyInfo}\n\nStrengths: ${llmAnalysis.strengths.join(', ')}\nWeaknesses: ${llmAnalysis.weaknesses.join(', ')}\nRecommendations: ${llmAnalysis.recommendations.join(', ')}\nRelevant Phrases: ${llmAnalysis.relevantPhrases.join(' | ')}`;
      
      return {
        score: llmAnalysis.score,
        keyInfo: keyInfo.trim(),
      };
    } catch (error: any) {
      console.warn('LLM analysis failed, falling back to keyword matching:', error.message);
      // Fall through to keyword-based analysis
    }
  }
  
  // Use keyword-based analysis as fallback or if LLM is disabled
  console.log('Using keyword matching for cover letter analysis...');
  const jobText = `${jobDescription} ${jobRequirements}`.trim();
  
  // Calculate scores (using LLM for keyword extraction when available)
  // 1. Keyword match score (50% weight)
  const keywordScore = await calculateKeywordMatch(jobText, coverLetter, useLLM);
  const keywordScoreWeighted = keywordScore * 0.5;
  
  // 2. Relevance score - requirements addressed (30% weight)
  const relevanceScore = await checkRequirementsAddressed(coverLetter, jobRequirements, useLLM);
  const relevanceScoreWeighted = relevanceScore * 0.3;
  
  // 3. Text similarity score (20% weight)
  const similarityScore = await calculateTextSimilarity(jobText, coverLetter, useLLM);
  const similarityScoreWeighted = similarityScore * 0.2;
  
  // Calculate final score
  const finalScore = Math.min(100, Math.max(0, 
    keywordScoreWeighted + 
    relevanceScoreWeighted + 
    similarityScoreWeighted
  ));
  
  // Extract key information
  const jobKeywords = await extractKeywords(jobText, useLLM, 'job description');
  const coverLetterKeywords = await extractKeywords(coverLetter, useLLM, 'cover letter');
  const matchedKeywords = jobKeywords.filter(jk =>
    coverLetterKeywords.some(ck => 
      ck === jk ||
      ck.includes(jk) || 
      jk.includes(ck)
    )
  ).slice(0, 10); // Top 10 matched keywords
  
  const relevantPhrases = await extractRelevantPhrases(coverLetter, jobText, 3, useLLM);
  
  const requirementsAddressed = await checkRequirementsAddressed(coverLetter, jobRequirements, useLLM);
  const requirementsKeywords = await extractKeywords(jobRequirements, useLLM, 'job requirements');
  const requirementsCount = requirementsKeywords.length;
  const addressedCount = Math.round((requirementsAddressed / 100) * requirementsCount);
  
  // Format key info as text
  const keyInfo = `Matched Keywords: ${matchedKeywords.join(', ') || 'None'}
Relevant Phrases: ${relevantPhrases.length > 0 ? relevantPhrases.map(p => `"${p.substring(0, 100)}${p.length > 100 ? '...' : ''}"`).join(' | ') : 'None found'}
Requirements Addressed: ${addressedCount} out of ${requirementsCount} requirement keywords
Keyword Match Percentage: ${Math.round(keywordScore)}%
Text Similarity: ${Math.round(similarityScore)}%`;
  
  return {
    score: Math.round(finalScore * 100) / 100,
    keyInfo: keyInfo.trim(),
  };
}

/**
 * Analyze questionnaire with direct input (for testing or direct calls)
 * 
 * Cover letters are text-based (not PDFs). Pass the cover letter text directly.
 * 
 * @param input - Cover letter (text) and job information
 * @param useLLM - Whether to use LLM analysis (default: true if API key is available)
 */
export async function analyzeQuestioneryDirect(
  input: {
    coverLetter: string; // Cover letter text (not PDF)
    jobDescription: string;
    jobRequirements: string;
  },
  useLLM: boolean = true
): Promise<QuestioneryAnalysisResult> {
  // Cover letter is already text, no parsing needed
  const coverLetter = input.coverLetter;
  
  // Try LLM analysis first if enabled and API key is available
  if (useLLM && process.env.ANTHROPIC_API_KEY) {
    try {
      console.log('Using LLM for cover letter analysis (direct)...');
      const llmAnalysis = await analyzeCoverLetterMatchWithLLM(
        coverLetter,
        input.jobDescription,
        input.jobRequirements
      );
      
      // Convert LLM analysis to QuestioneryAnalysisResult format
      const keyInfo = `${llmAnalysis.keyInfo}\n\nStrengths: ${llmAnalysis.strengths.join(', ')}\nWeaknesses: ${llmAnalysis.weaknesses.join(', ')}\nRecommendations: ${llmAnalysis.recommendations.join(', ')}\nRelevant Phrases: ${llmAnalysis.relevantPhrases.join(' | ')}`;
      
      return {
        score: llmAnalysis.score,
        keyInfo: keyInfo.trim(),
      };
    } catch (error: any) {
      console.warn('LLM analysis failed, falling back to keyword matching:', error.message);
      // Fall through to keyword-based analysis
    }
  }
  
  // Use keyword-based analysis as fallback or if LLM is disabled
  console.log('Using keyword matching for cover letter analysis (direct)...');
  const jobText = `${input.jobDescription} ${input.jobRequirements}`.trim();
  
  // Calculate scores (same logic as analyzeQuestionery, using LLM for keyword extraction when available)
  const keywordScore = await calculateKeywordMatch(jobText, coverLetter, useLLM);
  const keywordScoreWeighted = keywordScore * 0.5;
  
  const relevanceScore = await checkRequirementsAddressed(coverLetter, input.jobRequirements, useLLM);
  const relevanceScoreWeighted = relevanceScore * 0.3;
  
  const similarityScore = await calculateTextSimilarity(jobText, coverLetter, useLLM);
  const similarityScoreWeighted = similarityScore * 0.2;
  
  const finalScore = Math.min(100, Math.max(0, 
    keywordScoreWeighted + 
    relevanceScoreWeighted + 
    similarityScoreWeighted
  ));
  
  const jobKeywords = await extractKeywords(jobText, useLLM, 'job description');
  const coverLetterKeywords = await extractKeywords(coverLetter, useLLM, 'cover letter');
  const matchedKeywords = jobKeywords.filter(jk =>
    coverLetterKeywords.some(ck => 
      ck === jk ||
      ck.includes(jk) || 
      jk.includes(ck)
    )
  ).slice(0, 10);
  
  const relevantPhrases = await extractRelevantPhrases(coverLetter, jobText, 3, useLLM);
  
  const requirementsAddressed = await checkRequirementsAddressed(coverLetter, input.jobRequirements, useLLM);
  const requirementsKeywords = await extractKeywords(input.jobRequirements, useLLM, 'job requirements');
  const requirementsCount = requirementsKeywords.length;
  const addressedCount = Math.round((requirementsAddressed / 100) * requirementsCount);
  
  const keyInfo = `Matched Keywords: ${matchedKeywords.join(', ') || 'None'}
Relevant Phrases: ${relevantPhrases.length > 0 ? relevantPhrases.map(p => `"${p.substring(0, 100)}${p.length > 100 ? '...' : ''}"`).join(' | ') : 'None found'}
Requirements Addressed: ${addressedCount} out of ${requirementsCount} requirement keywords
Keyword Match Percentage: ${Math.round(keywordScore)}%
Text Similarity: ${Math.round(similarityScore)}%`;
  
  return {
    score: Math.round(finalScore * 100) / 100,
    keyInfo: keyInfo.trim(),
  };
}

