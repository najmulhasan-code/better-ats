/**
 * Resume Analysis Module
 * 
 * Handles resume parsing (PDF → structured data) and analysis (resume vs job description)
 * Supports both LLM-based and keyword-based analysis
 * 
 * Note: Resumes are PDF files that need to be parsed.
 * Cover letters are handled separately in questionery.ts (they are text-based).
 */

import 'server-only'; // Ensure this module only runs on the server

import { applicationRepository } from './repositories';
import { prisma } from './prisma';
import { analyzeResumeMatchWithLLM, extractResumeWithLLM } from './llm/extract';

export interface ParsedResumeData {
  personalInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  skills?: string[];
  experience?: Array<{
    title?: string;
    company?: string;
    duration?: string;
    description?: string;
  }>;
  education?: Array<{
    degree?: string;
    institution?: string;
    year?: string;
  }>;
  certifications?: string[];
  rawText?: string;
}

interface ResumeAnalysisResult {
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
  const keywords2 = await extractKeywords(text2, useLLM, 'resume');
  
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

// ============================================================================
// PDF PARSING FUNCTIONS
// ============================================================================

// Lazy-load pdf-parse to avoid browser API issues at module evaluation time
// This function will be called only when PDF parsing is actually needed
let pdfParseCache: any = null;

function getPdfParse() {
  if (pdfParseCache === null) {
    try {
      // Use require for CommonJS module - this only executes on the server
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParseModule = require('pdf-parse');
      
      // pdf-parse can be exported in different ways depending on how it's bundled
      // Try multiple patterns to find the actual function
      if (typeof pdfParseModule === 'function') {
        pdfParseCache = pdfParseModule;
      } else if (pdfParseModule.default && typeof pdfParseModule.default === 'function') {
        pdfParseCache = pdfParseModule.default;
      } else if (pdfParseModule.pdfParse && typeof pdfParseModule.pdfParse === 'function') {
        pdfParseCache = pdfParseModule.pdfParse;
      } else {
        // Last resort: try to find any function in the module
        const keys = Object.keys(pdfParseModule);
        const funcKey = keys.find(key => typeof pdfParseModule[key] === 'function');
        if (funcKey) {
          pdfParseCache = pdfParseModule[funcKey];
        } else {
          throw new Error(`Could not find pdf-parse function. Module exports: ${keys.join(', ')}`);
        }
      }
    } catch (error: any) {
      throw new Error(`Failed to load pdf-parse: ${error.message}`);
    }
  }
  return pdfParseCache;
}

/**
 * Parse PDF buffer to text
 * Uses lazy-loaded require to avoid browser API issues in Node.js
 * Only loads pdf-parse when actually needed (lazy loading)
 * 
 * Note: This function is server-only due to 'server-only' import at module level
 */
export async function parsePdfToText(buffer: Buffer): Promise<string> {
  const pdfParse = getPdfParse();
  
  if (typeof pdfParse !== 'function') {
    throw new Error(`pdf-parse is not a function. Type: ${typeof pdfParse}, Value: ${pdfParse}`);
  }
  // Some builds of `pdf-parse` export a class which must be called with `new`.
  // Older/different bundles export a plain function. Call the export and
  // if it throws the specific TypeError about being invoked without `new`,
  // retry by constructing it. Handle both Promise and sync-returning variants.
  let data: any;
  try {
    data = await pdfParse(buffer);
  } catch (err: any) {
    // Detect the common runtime error message when a class is called like a function
    if (err && typeof err.message === 'string' && err.message.includes("cannot be invoked without 'new'")) {
      // Retry by using `new`. Some builds return a Promise, others return the parsed data directly.
      const instance = new (pdfParse as any)(buffer);
      // If instance is a Promise-like, await it. Otherwise use it directly.
      if (instance && typeof (instance as Promise<any>).then === 'function') {
        data = await instance;
      } else {
        data = instance;
      }
    } else {
      // Re-throw unknown errors
      throw err;
    }
  }

  // Be flexible about the return shape. pdf-parse and other PDF wrappers
  // can return: a string, a Buffer, an object with `text`, an object with
  // `pages`, or other shapes depending on bundling. Try several heuristics
  // to extract a text string.
  let text: string | undefined;

  try {
    if (typeof data === 'string') {
      text = data;
    } else if (Buffer.isBuffer(data)) {
      text = data.toString('utf8');
    } else if (data && typeof data.text === 'string') {
      text = data.text;
    } else if (data && typeof data.text === 'object' && typeof data.text.text === 'string') {
      // nested shape
      text = data.text.text;
    } else if (Array.isArray(data) && data.every(item => typeof item === 'string')) {
      text = data.join('\n');
    } else if (data && Array.isArray((data as any).pages)) {
      text = (data as any).pages.map((p: any) => typeof p === 'string' ? p : (p?.text || '')).join('\n');
    } else if (data && typeof (data as any).getText === 'function') {
      // Some parsers expose a getText method
      try {
        const maybe = (data as any).getText();
        text = typeof maybe === 'string' ? maybe : (maybe && typeof maybe.then === 'function' ? await maybe : String(maybe));
      } catch (e) {
        // ignore and continue
      }
    } else if (data && typeof data.toString === 'function') {
      // Last resort: coerce to string (may be noisy)
      const s = data.toString();
      if (s && s.length > 0 && s.length < 1_000_000) {
        text = s;
      }
    }
  } catch (e) {
    // If extraction heuristics throw, fall through to error below
  }

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    // Provide some diagnostic info but avoid dumping the full buffer
    const infoParts = [] as string[];
    if (data === null) infoParts.push('data=null');
    else infoParts.push(`type=${typeof data}`);
    if (data && typeof data === 'object') {
      try {
        infoParts.push(`keys=${Object.keys(data).join(',')}`);
      } catch {
        // ignore
      }
    }
    throw new Error(`pdf-parse returned unexpected result when parsing PDF (${infoParts.join('; ')})`);
  }

  return text;
}

/**
 * Parse PDF buffer and extract structured data
 * Uses LLM if available, falls back to returning just raw text
 */
export async function parsePdfBuffer(
  buffer: Buffer,
  useLLM: boolean = true
): Promise<ParsedResumeData> {
  const text = await parsePdfToText(buffer);
  
  // Try LLM extraction if enabled and API key is available
  if (useLLM && process.env.ANTHROPIC_API_KEY) {
    try {
      return await extractResumeWithLLM(text);
    } catch (error: any) {
      // Check if it's a model error - if so, log it but still return raw text
      const errorMessage = (error?.message || '').toLowerCase();
      const isModelError = errorMessage.includes('not_found_error') || errorMessage.includes('model:') || errorMessage.includes('404');
      if (isModelError) {
        console.warn('LLM extraction failed due to model error:', error.message);
        console.warn('Falling back to raw text extraction. Please check your ANTHROPIC_MODEL environment variable.');
      } else {
        console.warn('LLM extraction failed:', error.message);
      }
      // Return raw text if LLM fails (model error or other error)
      return { rawText: text };
    }
  }
  
  // Return raw text if LLM is disabled
  return { rawText: text };
}

/**
 * Parse PDF from URL
 */
export async function parsePdfFromUrl(
  url: string,
  useLLM: boolean = true
): Promise<ParsedResumeData> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF from URL: ${response.statusText}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return parsePdfBuffer(buffer, useLLM);
}

// ============================================================================
// RESUME ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Analyze resume against job description
 * 
 * @param applicationId - Application ID to analyze
 * @param useLLM - Whether to use LLM analysis (default: true if API key is available)
 */
export async function analyzeResume(
  applicationId: string,
  useLLM: boolean = true
): Promise<ResumeAnalysisResult> {
  // Fetch application with relations
  const application = await applicationRepository.findWithRelations(applicationId) as any;
  
  if (!application) {
    throw new Error(`Application not found: ${applicationId}`);
  }
  
  if (!application.resumeFile && !application.candidate?.resumeUrl) {
    throw new Error('Resume URL not found for candidate');
  }
  
  if (!application.jobPosting && !application.job) {
    throw new Error('Job posting not found');
  }
  
  // Get resume URL (prefer resumeFile, fallback to candidate.resumeUrl for backward compatibility)
  const resumeUrl = application.resumeFile || application.candidate?.resumeUrl;
  if (!resumeUrl) {
    throw new Error('Resume URL not found for candidate');
  }
  
  // Parse resume directly (no HTTP call needed)
  const parsedResume = await parsePdfFromUrl(resumeUrl, useLLM);
  
  // Get job description and requirements
  const jobPosting = application.jobPosting || application.job;
  const jobDescription = jobPosting?.description || jobPosting?.fullDescription || '';
  // Requirements is an array in the schema, convert to string
  const jobRequirements = Array.isArray(jobPosting?.requirements) 
    ? jobPosting.requirements.join(' ') 
    : (jobPosting?.requirements || '');
  
  // Try LLM analysis first if enabled and API key is available
  if (useLLM && process.env.ANTHROPIC_API_KEY) {
    try {
      console.log('Using LLM for resume analysis...');
      const llmAnalysis = await analyzeResumeMatchWithLLM(
        parsedResume,
        jobDescription,
        jobRequirements
      );
      
      // Convert LLM analysis to ResumeAnalysisResult format
      const keyInfo = `${llmAnalysis.keyInfo}\n\nStrengths: ${llmAnalysis.strengths.join(', ')}\nWeaknesses: ${llmAnalysis.weaknesses.join(', ')}\nRecommendations: ${llmAnalysis.recommendations.join(', ')}`;
      
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
  console.log('Using keyword matching for resume analysis...');
  const jobText = `${jobDescription} ${jobRequirements}`.trim();
  
  // Extract resume text
  const resumeText = parsedResume.rawText || '';
  const resumeSkills = parsedResume.skills || [];
  
  // Calculate scores (using LLM for keyword extraction when available)
  // 1. Skills match score (40% weight)
  const requiredSkills = await extractKeywords(jobRequirements, useLLM, 'job requirements');
  const matchedSkills = resumeSkills.filter(skill => {
    const skillLower = skill.toLowerCase();
    return requiredSkills.some(reqSkill => 
      reqSkill === skillLower ||
      reqSkill.includes(skillLower) || 
      skillLower.includes(reqSkill)
    );
  });
  const skillsScore = requiredSkills.length > 0 
    ? (matchedSkills.length / requiredSkills.length) * 100 
    : 0;
  const skillsScoreWeighted = skillsScore * 0.4;
  
  // 2. Experience relevance score (30% weight)
  const experienceText = parsedResume.experience
    ?.map(exp => `${exp.title || ''} ${exp.company || ''} ${exp.description || ''}`)
    .join(' ') || '';
  const experienceScore = await calculateKeywordMatch(jobText, experienceText, useLLM);
  const experienceScoreWeighted = experienceScore * 0.3;
  
  // 3. Education match score (20% weight)
  const educationText = parsedResume.education
    ?.map(edu => `${edu.degree || ''} ${edu.institution || ''}`)
    .join(' ') || '';
  const educationKeywords = await extractKeywords(jobText, useLLM, 'job description');
  const educationTextKeywords = await extractKeywords(educationText, useLLM, 'education');
  const educationMatches = educationTextKeywords.filter(eduKw =>
    educationKeywords.some(jobKw => 
      jobKw === eduKw ||
      jobKw.includes(eduKw) || 
      eduKw.includes(jobKw)
    )
  ).length;
  const educationScore = educationKeywords.length > 0
    ? (educationMatches / educationKeywords.length) * 100
    : 50; // Default score if no education keywords in JD
  const educationScoreWeighted = educationScore * 0.2;
  
  // 4. Keyword density score (10% weight)
  const keywordScore = await calculateKeywordMatch(jobText, resumeText, useLLM);
  const keywordScoreWeighted = keywordScore * 0.1;
  
  // Calculate final score
  const finalScore = Math.min(100, Math.max(0, 
    skillsScoreWeighted + 
    experienceScoreWeighted + 
    educationScoreWeighted + 
    keywordScoreWeighted
  ));
  
  // Extract key information
  const yearsOfExperience = parsedResume.experience?.length || 0;
  const topSkills = matchedSkills.slice(0, 10);
  const educationSummary = parsedResume.education
    ?.map(edu => `${edu.degree || 'N/A'} from ${edu.institution || 'N/A'}`)
    .join(', ') || 'Not specified';
  const certifications = parsedResume.certifications?.join(', ') || 'None';
  
  // Format key info as text
  const keyInfo = `Skills: ${topSkills.join(', ') || 'None matched'}
Experience: ${yearsOfExperience} ${yearsOfExperience === 1 ? 'position' : 'positions'}
Education: ${educationSummary}
Certifications: ${certifications}
Years of Experience: ${yearsOfExperience}
Matched Skills Count: ${matchedSkills.length} out of ${requiredSkills.length}`;
  
  return {
    score: Math.round(finalScore * 100) / 100,
    keyInfo: keyInfo.trim(),
  };
}

/**
 * Analyze resume with direct input (for testing or direct calls)
 * 
 * @param input - Resume data and job information
 * @param useLLM - Whether to use LLM analysis (default: true if API key is available)
 */
export async function analyzeResumeDirect(
  input: {
    resumeData: ParsedResumeData;
    jobDescription: string;
    jobRequirements: string;
  },
  useLLM: boolean = true
): Promise<ResumeAnalysisResult> {
  // Try LLM analysis first if enabled and API key is available
  if (useLLM && process.env.ANTHROPIC_API_KEY) {
    try {
      console.log('Using LLM for resume analysis (direct)...');
      const llmAnalysis = await analyzeResumeMatchWithLLM(
        input.resumeData,
        input.jobDescription,
        input.jobRequirements
      );
      
      // Convert LLM analysis to ResumeAnalysisResult format
      const keyInfo = `${llmAnalysis.keyInfo}\n\nStrengths: ${llmAnalysis.strengths.join(', ')}\nWeaknesses: ${llmAnalysis.weaknesses.join(', ')}\nRecommendations: ${llmAnalysis.recommendations.join(', ')}`;
      
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
  console.log('Using keyword matching for resume analysis (direct)...');
  const jobText = `${input.jobDescription} ${input.jobRequirements}`.trim();
  const resumeText = input.resumeData.rawText || '';
  const resumeSkills = input.resumeData.skills || [];
  
  // Calculate scores (same logic as analyzeResume, using LLM for keyword extraction when available)
  const requiredSkills = await extractKeywords(input.jobRequirements, useLLM, 'job requirements');
  const matchedSkills = resumeSkills.filter(skill => {
    const skillLower = skill.toLowerCase();
    return requiredSkills.some(reqSkill => 
      reqSkill === skillLower ||
      reqSkill.includes(skillLower) || 
      skillLower.includes(reqSkill)
    );
  });
  const skillsScore = requiredSkills.length > 0 
    ? (matchedSkills.length / requiredSkills.length) * 100 
    : 0;
  const skillsScoreWeighted = skillsScore * 0.4;
  
  const experienceText = input.resumeData.experience
    ?.map(exp => `${exp.title || ''} ${exp.company || ''} ${exp.description || ''}`)
    .join(' ') || '';
  const experienceScore = await calculateKeywordMatch(jobText, experienceText, useLLM);
  const experienceScoreWeighted = experienceScore * 0.3;
  
  const educationText = input.resumeData.education
    ?.map(edu => `${edu.degree || ''} ${edu.institution || ''}`)
    .join(' ') || '';
  const educationKeywords = await extractKeywords(jobText, useLLM, 'job description');
  const educationTextKeywords = await extractKeywords(educationText, useLLM, 'education');
  const educationMatches = educationTextKeywords.filter(eduKw =>
    educationKeywords.some(jobKw => 
      jobKw === eduKw ||
      jobKw.includes(eduKw) || 
      eduKw.includes(jobKw)
    )
  ).length;
  const educationScore = educationKeywords.length > 0
    ? (educationMatches / educationKeywords.length) * 100
    : 50;
  const educationScoreWeighted = educationScore * 0.2;
  
  const keywordScore = await calculateKeywordMatch(jobText, resumeText, useLLM);
  const keywordScoreWeighted = keywordScore * 0.1;
  
  const finalScore = Math.min(100, Math.max(0, 
    skillsScoreWeighted + 
    experienceScoreWeighted + 
    educationScoreWeighted + 
    keywordScoreWeighted
  ));
  
  const yearsOfExperience = input.resumeData.experience?.length || 0;
  const topSkills = matchedSkills.slice(0, 10);
  const educationSummary = input.resumeData.education
    ?.map(edu => `${edu.degree || 'N/A'} from ${edu.institution || 'N/A'}`)
    .join(', ') || 'Not specified';
  const certifications = input.resumeData.certifications?.join(', ') || 'None';
  
  const keyInfo = `Skills: ${topSkills.join(', ') || 'None matched'}
Experience: ${yearsOfExperience} ${yearsOfExperience === 1 ? 'position' : 'positions'}
Education: ${educationSummary}
Certifications: ${certifications}
Years of Experience: ${yearsOfExperience}
Matched Skills Count: ${matchedSkills.length} out of ${requiredSkills.length}`;
  
  return {
    score: Math.round(finalScore * 100) / 100,
    keyInfo: keyInfo.trim(),
  };
}

