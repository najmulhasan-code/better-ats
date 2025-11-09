/**
 * LLM-based Resume Extraction
 * 
 * Uses LLM (Anthropic Claude or OpenAI GPT) to extract structured information from resume text
 */

import { callLLM, isLLMAvailable } from './client';

function logLLMError(err: any, context?: string) {
  try {
    const str = (err && err.message) ? err.message : JSON.stringify(err);
    if (str && (str.includes('not_found_error') || str.includes('model:') || str.includes('not found'))) {
      console.error('❌ LLM model not found or invalid model name.');
      console.error('');
      console.error('Available providers:');
      if (process.env.ANTHROPIC_API_KEY) {
        console.error('  - Anthropic Claude (ANTHROPIC_API_KEY set)');
      }
      if (process.env.OPENAI_API_KEY) {
        console.error('  - OpenAI GPT (OPENAI_API_KEY set)');
      }
      if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
        console.error('  - No API keys found. Please set ANTHROPIC_API_KEY or OPENAI_API_KEY');
      }
    }
  } catch (e) {
    // ignore
  }
  if (context) console.error(context);
  console.error(err);
}

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

/**
 * Extract structured resume data using Claude
 */
export async function extractResumeWithLLM(resumeText: string): Promise<ParsedResumeData> {
  if (!isLLMAvailable()) {
    throw new Error('Neither ANTHROPIC_API_KEY nor OPENAI_API_KEY is set. LLM analysis requires at least one API key.');
  }

  const prompt = `You are an expert at parsing resumes and extracting structured information. 
Extract the following information from the resume text below and return it as a JSON object.

Resume Text:
${resumeText.substring(0, 50000)} ${resumeText.length > 50000 ? '... (truncated)' : ''}

Please extract and return a JSON object with this exact structure:
{
  "personalInfo": {
    "name": "string or null",
    "email": "string or null",
    "phone": "string or null",
    "location": "string or null"
  },
  "skills": ["array of skill strings"],
  "experience": [
    {
      "title": "string or null",
      "company": "string or null",
      "duration": "string or null (e.g., 'Jan 2020 - Present' or '2020-2022')",
      "description": "string or null"
    }
  ],
  "education": [
    {
      "degree": "string or null (e.g., 'Bachelor of Science in Computer Science')",
      "institution": "string or null",
      "year": "string or null (e.g., '2020' or '2020-2024')"
    }
  ],
  "certifications": ["array of certification strings"]
}

Important rules:
- Only include information that is explicitly stated in the resume
- For skills, extract all technical and professional skills mentioned
- For experience, extract all work experiences in chronological order (most recent first)
- For education, extract all degrees and educational qualifications
- For certifications, extract all professional certifications and licenses
- If a field cannot be determined, use null (not empty string)
- Return ONLY valid JSON, no additional text or markdown formatting
- Ensure all dates are in a consistent format
- Extract full job descriptions for experience entries
- Include location if available (city, state or city, country format)`;

  // Use unified LLM client with automatic Anthropic -> OpenAI fallback
  console.log(`[LLM Extract] Starting extraction with automatic provider fallback...`);
  
  try {
    const response = await callLLM(prompt, {
      temperature: 0.1, // Low temperature for consistent extraction
      maxTokens: 4096,
    });

    console.log(`[LLM Extract] ✅ Extraction completed using ${response.provider} (${response.model})`);

    // Parse JSON response
    // Sometimes LLM wraps response in markdown code blocks
    let jsonText = response.content.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Parse JSON
    const extractedData = JSON.parse(jsonText) as ParsedResumeData;

    // Add raw text to response
    extractedData.rawText = resumeText;

    // Validate and clean the data
    return {
      personalInfo: extractedData.personalInfo || {},
      skills: Array.isArray(extractedData.skills) ? extractedData.skills : [],
      experience: Array.isArray(extractedData.experience) ? extractedData.experience : [],
      education: Array.isArray(extractedData.education) ? extractedData.education : [],
      certifications: Array.isArray(extractedData.certifications) ? extractedData.certifications : [],
      rawText: resumeText,
    };
  } catch (error: any) {
    console.error('[LLM Extract] Extraction failed:', error);
    throw new Error(`LLM extraction failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Analyze resume match against job description using LLM
 */
export async function analyzeResumeMatchWithLLM(
  resumeData: ParsedResumeData,
  jobDescription: string,
  jobRequirements: string
): Promise<{
  score: number;
  keyInfo: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}> {
  if (!isLLMAvailable()) {
    throw new Error('Neither ANTHROPIC_API_KEY nor OPENAI_API_KEY is set. LLM analysis requires at least one API key.');
  }

  const resumeSummary = `
Personal Info: ${JSON.stringify(resumeData.personalInfo || {})}
Skills: ${(resumeData.skills || []).join(', ')}
Experience: ${JSON.stringify(resumeData.experience || [])}
Education: ${JSON.stringify(resumeData.education || [])}
Certifications: ${(resumeData.certifications || []).join(', ')}
`;

  const prompt = `You are an expert recruiter analyzing a resume against a job description.

Job Description:
${jobDescription}

Job Requirements:
${jobRequirements}

Resume Summary:
${resumeSummary}

Please analyze the resume and provide:
1. A match score from 0-100 (where 100 is perfect match)
2. Key information highlighting why this candidate matches or doesn't match
3. Top 3-5 strengths of this candidate for this role
4. Top 3-5 weaknesses or gaps for this role
5. Recommendations for the candidate or recruiter

Return your response as a JSON object with this exact structure:
{
  "score": number (0-100),
  "keyInfo": "string (2-3 sentences summarizing the match)",
  "strengths": ["array of 3-5 strength strings"],
  "weaknesses": ["array of 3-5 weakness strings"],
  "recommendations": ["array of 3-5 recommendation strings"]
}

Important:
- Be specific and actionable in your analysis
- Focus on skills, experience, and qualifications relevant to the job
- Consider both technical and soft skills
- Provide constructive feedback
- Return ONLY valid JSON, no additional text or markdown formatting`;

  try {
    const response = await callLLM(prompt, {
      temperature: 0.3, // Slightly higher temperature for more nuanced analysis
      maxTokens: 4096,
    });

    const responseText = response.content;

    let jsonText = responseText.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const analysis = JSON.parse(jsonText);

    // Validate and ensure score is between 0-100
    const score = Math.max(0, Math.min(100, analysis.score || 0));

    return {
      score: Math.round(score * 100) / 100,
      keyInfo: analysis.keyInfo || 'Analysis completed',
      strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
      weaknesses: Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [],
      recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
    };
  } catch (error: any) {
    logLLMError(error, 'LLM analysis error');
    throw new Error(`LLM analysis failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Analyze cover letter/questionnaire match against job description using LLM
 * 
 * Note: Cover letters are text-based (stored in database), not PDFs.
 * This function analyzes the cover letter text directly.
 * 
 * @param coverLetter - Cover letter text (not PDF)
 * @param jobDescription - Job description text
 * @param jobRequirements - Job requirements text
 */
export async function analyzeCoverLetterMatchWithLLM(
  coverLetter: string, // Text-based cover letter (not PDF)
  jobDescription: string,
  jobRequirements: string
): Promise<{
  score: number;
  keyInfo: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  relevantPhrases: string[];
}> {
  if (!isLLMAvailable()) {
    throw new Error('Neither ANTHROPIC_API_KEY nor OPENAI_API_KEY is set. LLM analysis requires at least one API key.');
  }

  const prompt = `You are an expert recruiter analyzing a cover letter/questionnaire (text) against a job description.

Job Description:
${jobDescription}

Job Requirements:
${jobRequirements}

Cover Letter/Questionnaire (text):
${coverLetter.substring(0, 10000)} ${coverLetter.length > 10000 ? '... (truncated)' : ''}

Please analyze the cover letter and provide:
1. A match score from 0-100 (where 100 is perfect match)
2. Key information highlighting why this cover letter matches or doesn't match
3. Top 3-5 strengths of this cover letter for this role
4. Top 3-5 weaknesses or gaps in the cover letter
5. Recommendations for improvement
6. Most relevant phrases from the cover letter (2-3 phrases that best demonstrate fit)

Return your response as a JSON object with this exact structure:
{
  "score": number (0-100),
  "keyInfo": "string (2-3 sentences summarizing the match)",
  "strengths": ["array of 3-5 strength strings"],
  "weaknesses": ["array of 3-5 weakness strings"],
  "recommendations": ["array of 3-5 recommendation strings"],
  "relevantPhrases": ["array of 2-3 relevant phrase strings"]
}

Important:
- Be specific and actionable in your analysis
- Focus on how well the cover letter addresses job requirements
- Evaluate writing quality, clarity, and professionalism
- Check if the candidate demonstrates understanding of the role
- Consider cultural fit and motivation
- Return ONLY valid JSON, no additional text or markdown formatting`;

  try {
    const response = await callLLM(prompt, {
      temperature: 0.3,
      maxTokens: 4096,
    });

    const responseText = response.content;

    let jsonText = responseText.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const analysis = JSON.parse(jsonText);

    // Validate and ensure score is between 0-100
    const score = Math.max(0, Math.min(100, analysis.score || 0));

    return {
      score: Math.round(score * 100) / 100,
      keyInfo: analysis.keyInfo || 'Analysis completed',
      strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
      weaknesses: Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [],
      recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
      relevantPhrases: Array.isArray(analysis.relevantPhrases) ? analysis.relevantPhrases : [],
    };
  } catch (error: any) {
    logLLMError(error, 'LLM cover letter analysis error');
    throw new Error(`LLM cover letter analysis failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Analyze integrated application (resume + cover letter) using LLM
 * Provides holistic insights combining both analyses
 */
export async function analyzeIntegratedApplicationWithLLM(
  resumeAnalysis: {
    score: number;
    keyInfo: string;
    strengths: string[];
    weaknesses: string[];
  },
  coverLetterAnalysis: {
    score: number;
    keyInfo: string;
    strengths: string[];
    weaknesses: string[];
  },
  jobDescription: string,
  jobRequirements: string
): Promise<{
  finalScore: number;
  comprehensiveAnalysis: string;
  overallStrengths: string[];
  overallWeaknesses: string[];
  recommendations: string[];
  hiringRecommendation: 'strong_yes' | 'yes' | 'maybe' | 'no';
}> {
  if (!isLLMAvailable()) {
    throw new Error('Neither ANTHROPIC_API_KEY nor OPENAI_API_KEY is set. LLM analysis requires at least one API key.');
  }

  const prompt = `You are an expert recruiter providing a final holistic analysis of a job application.

Job Description:
${jobDescription}

Job Requirements:
${jobRequirements}

Resume Analysis:
Score: ${resumeAnalysis.score}/100
Key Info: ${resumeAnalysis.keyInfo}
Strengths: ${resumeAnalysis.strengths.join('; ')}
Weaknesses: ${resumeAnalysis.weaknesses.join('; ')}

Cover Letter Analysis:
Score: ${coverLetterAnalysis.score}/100
Key Info: ${coverLetterAnalysis.keyInfo}
Strengths: ${coverLetterAnalysis.strengths.join('; ')}
Weaknesses: ${coverLetterAnalysis.weaknesses.join('; ')}

Please provide a comprehensive integrated analysis that:
1. Combines insights from both resume and cover letter
2. Identifies overall strengths (considering both resume and cover letter)
3. Identifies overall weaknesses or concerns
4. Provides actionable recommendations
5. Suggests a hiring recommendation (strong_yes, yes, maybe, or no)
6. Calculates a final comprehensive score (0-100)

Return your response as a JSON object with this exact structure:
{
  "finalScore": number (0-100),
  "comprehensiveAnalysis": "string (3-5 sentences providing holistic view)",
  "overallStrengths": ["array of 4-6 overall strength strings"],
  "overallWeaknesses": ["array of 4-6 overall weakness strings"],
  "recommendations": ["array of 4-6 recommendation strings"],
  "hiringRecommendation": "strong_yes" | "yes" | "maybe" | "no"
}

Important:
- Consider consistency between resume and cover letter
- Look for alignment in skills, experience, and motivation
- Identify any red flags or concerns
- Provide balanced, fair assessment
- Return ONLY valid JSON, no additional text or markdown formatting`;

  try {
    const response = await callLLM(prompt, {
      temperature: 0.3,
      maxTokens: 4096,
    });

    const responseText = response.content;

    let jsonText = responseText.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const analysis = JSON.parse(jsonText);

    // Validate and ensure score is between 0-100
    const finalScore = Math.max(0, Math.min(100, analysis.finalScore || 0));
    
    // Validate hiring recommendation
    const validRecommendations = ['strong_yes', 'yes', 'maybe', 'no'];
    const hiringRecommendation = validRecommendations.includes(analysis.hiringRecommendation)
      ? analysis.hiringRecommendation
      : 'maybe';

    return {
      finalScore: Math.round(finalScore * 100) / 100,
      comprehensiveAnalysis: analysis.comprehensiveAnalysis || 'Analysis completed',
      overallStrengths: Array.isArray(analysis.overallStrengths) ? analysis.overallStrengths : [],
      overallWeaknesses: Array.isArray(analysis.overallWeaknesses) ? analysis.overallWeaknesses : [],
      recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
      hiringRecommendation: hiringRecommendation as 'strong_yes' | 'yes' | 'maybe' | 'no',
    };
  } catch (error: any) {
    logLLMError(error, 'LLM integrated analysis error');
    throw new Error(`LLM integrated analysis failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Extract keywords from text using LLM
 * This provides intelligent keyword extraction without hardcoded stop words
 * 
 * @param text - Text to extract keywords from
 * @param context - Optional context (e.g., "job requirements", "resume", "cover letter")
 */
export async function extractKeywordsWithLLM(
  text: string,
  context?: string
): Promise<string[]> {
  if (!isLLMAvailable()) {
    throw new Error('Neither ANTHROPIC_API_KEY nor OPENAI_API_KEY is set. LLM analysis requires at least one API key.');
  }

  if (!text || text.trim().length === 0) {
    return [];
  }

  const contextHint = context ? ` Context: ${context}` : '';

  const prompt = `Extract the most relevant and important keywords from the following text${contextHint}.
Focus on:
- Technical skills, technologies, tools, and frameworks
- Professional skills, competencies, and expertise areas
- Industry-specific terms and concepts
- Key qualifications and requirements
- Important nouns and noun phrases that represent meaningful concepts

Ignore:
- Common words that don't add meaning (articles, prepositions, common verbs)
- Generic words that appear in most texts
- Personal pronouns unless they're part of a technical term

Text:
${text.substring(0, 10000)} ${text.length > 10000 ? '... (truncated)' : ''}

Return your response as a JSON array of keyword strings. Each keyword should be:
- A single word or short phrase (2-3 words max)
- In lowercase
- Meaningful and relevant to the text
- Without duplicates

Example format:
["javascript", "react", "typescript", "full-stack development", "aws", "docker", "team leadership"]

Return ONLY the JSON array, no additional text or markdown formatting.`;

  try {
    const response = await callLLM(prompt, {
      temperature: 0.2, // Low temperature for consistent extraction
      maxTokens: 2048,
    });

    const responseText = response.content;

    let jsonText = responseText.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const keywords = JSON.parse(jsonText);

    // Validate and clean the keywords
    if (!Array.isArray(keywords)) {
      return [];
    }

    return keywords
      .filter((kw: any) => typeof kw === 'string' && kw.trim().length > 0)
      .map((kw: string) => kw.trim().toLowerCase())
      .filter((kw: string, index: number, arr: string[]) => arr.indexOf(kw) === index); // Remove duplicates
  } catch (error: any) {
    logLLMError(error, 'LLM keyword extraction error');
    throw new Error(`LLM keyword extraction failed: ${error.message || 'Unknown error'}`);
  }
}

