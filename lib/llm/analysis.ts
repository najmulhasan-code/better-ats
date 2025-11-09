/**
 * Comprehensive LLM-based Application Analysis
 * 
 * Analyzes resume + questionery data together, extracting strong/weak points
 * and generating recruiter remarks. No hardcoded weights - LLM determines importance.
 */

import { ParsedResumeData } from '../resume';
import { consolidateQuestioneryData, QuestioneryData } from '../questionery';
import { callLLM, isLLMAvailable } from './client';

export interface ComprehensiveAnalysisResult {
  resumeStrongPoints: string[];
  resumeWeakPoints: string[];
  questioneryStrongPoints: string[];
  questioneryWeakPoints: string[];
  overallStrongPoints: string[];
  overallWeakPoints: string[];
  recruiterRemarks: string;
  resumeScore?: number; // Resume-specific score (0-100)
  questioneryScore?: number; // Questionery-specific score (0-100)
  overallMatchScore?: number; // Overall match score based on strengths/weaknesses and fit
  privateDirectionsCompliance?: {
    meetsRequirements: boolean;
    complianceScore: number;
    reasoning: string;
  };
}

/**
 * Analyze comprehensive application (resume + questionery) with LLM
 */
export async function analyzeComprehensiveApplication(
  resumeData: ParsedResumeData,
  questioneryData: QuestioneryData,
  jobDescription: string,
  jobRequirements: string[],
  jobResponsibilities: string[],
  privateDirections: string | null,
  applicationForm?: any,
  resumeIsValid: boolean = true // Whether resume was successfully parsed
): Promise<ComprehensiveAnalysisResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }

  // Consolidate questionery data into text
  const questioneryText = consolidateQuestioneryData(questioneryData, applicationForm);

  // Format resume data
  const resumeSummary = formatResumeForAnalysis(resumeData);
  
  // Check if resume has meaningful content
  // Only add a note if resume is truly invalid (no content at all)
  const hasResumeContent = resumeIsValid && (
    (resumeData.rawText && resumeData.rawText.trim().length > 50) ||
    (resumeData.skills && resumeData.skills.length > 0) ||
    (resumeData.experience && resumeData.experience.length > 0) ||
    (resumeData.education && resumeData.education.length > 0)
  );
  
  // If resume has no meaningful content, note this in the prompt
  // Only mark as corrupted if it truly has NO content
  const resumeStatusNote = !hasResumeContent 
    ? '\n\nIMPORTANT: The resume could not be parsed or contains no readable content. This indicates a corrupted resume with ZERO usable information.'
    : '';

  // Format job requirements and responsibilities
  const requirementsText = Array.isArray(jobRequirements) 
    ? jobRequirements.join('\n') 
    : (jobRequirements || '');
  const responsibilitiesText = Array.isArray(jobResponsibilities)
    ? jobResponsibilities.join('\n')
    : (jobResponsibilities || '');

  // Build the prompt - conditionally include private directions section
  const privateDirectionsSection = privateDirections 
    ? `PRIVATE DIRECTIONS (Internal, HIGH PRIORITY - MUST DOMINATE ANALYSIS):
${privateDirections}

IMPORTANT: Private directions should heavily influence your analysis. If the candidate doesn't meet private direction requirements, this should be reflected in weak points and compliance assessment.

`
    : '';

  // Build JSON structure template based on whether private directions exist
  const jsonStructureTemplate = privateDirections
    ? `{
  "resumeStrongPoints": ["array of up to 3-5 resume-specific strong points (only include relevant ones)"],
  "resumeWeakPoints": ["array of up to 3-5 resume-specific weak points (only include relevant ones, can be empty if none)"],
  "questioneryStrongPoints": ["array of up to 3-5 questionery-specific strong points (only include relevant ones)"],
  "questioneryWeakPoints": ["array of up to 3-5 questionery-specific weak points (only include relevant ones, can be empty if none)"],
  "overallStrongPoints": ["array of up to 5-7 overall strong points (only include relevant ones, combine resume and questionery, prioritized)"],
  "overallWeakPoints": ["array of up to 5-7 overall weak points (only include relevant ones, can be fewer or empty if candidate is strong)"],
  "recruiterRemarks": "2-3 sentences comprehensive assessment",
  "resumeScore": 0-100,
  "questioneryScore": 0-100,
  "overallMatchScore": 0-100,
  "privateDirectionsCompliance": {
    "meetsRequirements": true/false,
    "complianceScore": 0-100,
    "reasoning": "explanation of how candidate meets/doesn't meet private directions"
  }
}`
    : `{
  "resumeStrongPoints": ["array of up to 3-5 resume-specific strong points (only include relevant ones)"],
  "resumeWeakPoints": ["array of up to 3-5 resume-specific weak points (only include relevant ones, can be empty if none)"],
  "questioneryStrongPoints": ["array of up to 3-5 questionery-specific strong points (only include relevant ones)"],
  "questioneryWeakPoints": ["array of up to 3-5 questionery-specific weak points (only include relevant ones, can be empty if none)"],
  "overallStrongPoints": ["array of up to 5-7 overall strong points (only include relevant ones, combine resume and questionery, prioritized)"],
  "overallWeakPoints": ["array of up to 5-7 overall weak points (only include relevant ones, can be fewer or empty if candidate is strong)"],
  "recruiterRemarks": "2-3 sentences comprehensive assessment",
  "resumeScore": 0-100,
  "questioneryScore": 0-100,
  "overallMatchScore": 0-100
}`;

  const prompt = `You are an expert recruiter analyzing a job application.

JOB DESCRIPTION:
${jobDescription}

JOB REQUIREMENTS:
${requirementsText}

JOB RESPONSIBILITIES:
${responsibilitiesText}

${privateDirectionsSection}

CANDIDATE APPLICATION:

RESUME:
${resumeSummary}${resumeStatusNote}

QUESTIONERY (Cover letter + answers + other application info):
${questioneryText || 'No questionery data provided (cover letter, custom answers, etc.)'}

TASK:
Analyze this candidate's application comprehensively:

1. Analyze the candidate's RESUME against the job description, requirements, responsibilities, and private directions (if any)
   - Evaluate resume quality, relevance, experience, skills, education
   - Assess how well the resume matches job requirements
   - IMPORTANT: Only mark resume as "corrupted" or "unreadable" if it truly contains NO usable information
   - If resume has some content (even if sparse, poorly formatted, or missing some details), it is NOT corrupted
   - A resume is only corrupted if: it's completely blank, contains only gibberish/nonsensical text, or cannot be parsed at all
   - Poor formatting, missing information, or incomplete details do NOT make a resume "corrupted"
2. Analyze the candidate's QUESTIONERY (all non-resume materials: cover letter, custom answers, portfolio links, etc.) against the job description, requirements, responsibilities, and private directions (if any)
   - Evaluate cover letter quality, relevance, communication skills
   - Assess answers to custom questions
   - Consider portfolio, LinkedIn, and other provided materials
3. Extract STRONG POINTS:
   - Resume-specific strong points (up to 3-5 points, only if relevant)
   - Questionery-specific strong points (up to 3-5 points, only if relevant)
   - Overall strong points (up to 5-7 points, combining resume and questionery, prioritized)
   - Only include points that are actually relevant and meaningful
   - If a candidate has fewer strong points, list only what exists - don't force unnecessary points
   - Consider both resume and questionery together
   - Prioritize aspects mentioned in private directions (if any)
   - Be specific and provide evidence
4. Extract WEAK POINTS:
   - Resume-specific weak points (up to 3-5 points, only if relevant)
   - Questionery-specific weak points (up to 3-5 points, only if relevant)
   - Overall weak points (up to 5-7 points, combining resume and questionery, prioritized)
   - Only include genuine gaps, concerns, or areas for improvement
   - If a candidate is strong with few weaknesses, list only what actually exists - don't invent weak points
   - A strong candidate might have 0-2 weak points, which is perfectly fine
   - Consider private directions (if candidate doesn't meet them, this is a weak point)
   - Be constructive and specific
   - IMPORTANT: Quality over quantity - better to have 2-3 meaningful weak points than 7 weak points just to meet a number
5. Generate RECRUITER REMARKS (2-3 comprehensive sentences):
   - Holistic assessment of the candidate
   - Consider both resume and questionery together
   - Factor in private directions heavily (if any)
   - Provide hiring recommendation context
6. Calculate SCORES (0-100):
   - RESUME SCORE: Rate the resume quality and match (0-100) based on resume-specific analysis
     * Consider: skills match, experience relevance, education, resume quality
     * IMPORTANT: Only mark resume as corrupted/unreadable if it has ZERO usable content (completely blank, gibberish, or unparseable)
     * If resume has any readable content (even if sparse or poorly formatted), it is NOT corrupted - just rate it based on quality
     * Penalize heavily ONLY for truly corrupted/unreadable resume with NO usable content (max 40%)
     * Penalize for lack of required experience shown in resume (max 50%)
     * Poor formatting or missing details should reduce score but NOT be marked as "corrupted"
   - QUESTIONERY SCORE: Rate the cover letter and application materials (0-100) based on questionery-specific analysis
     * Consider: cover letter quality, answer relevance, communication skills
     * Penalize heavily for wrong company name (reduce by 25%)
     * If no questionery data exists, score should reflect that (neutral or based on available data)
   - OVERALL MATCH SCORE: This is the candidate's overall fit for the position (0-100)
     * Consider: job requirements match, strengths vs weaknesses, critical issues
     * This should be a holistic assessment considering BOTH resume and questionery together
     * It may differ from a simple average of resume and questionery scores
   - CRITICAL RULES FOR SCORING (THESE ARE HARD LIMITS - NO EXCEPTIONS):
     * IMPORTANT: Resume is ONLY corrupted if it has ZERO usable content (completely blank, gibberish, unparseable)
     * If resume has ANY readable content, it is NOT corrupted - rate based on quality, not corruption
     * If candidate has TRULY corrupted/unreadable resume (no usable content): MAXIMUM score is 40%
     * If candidate lacks required experience (e.g., student vs 4+ years required): MAXIMUM score is 50%
     * If candidate has wrong company name in application: Reduce score by 20-25% (multiply by 0.75-0.8)
     * If candidate has multiple critical issues (2+): MAXIMUM score is 35%
     * If candidate has 3+ critical issues: MAXIMUM score is 30%
     * If candidate has TRULY corrupted resume (no content) AND lacks experience AND wrong company: MAXIMUM score is 25%
     * If weaknesses outnumber strengths AND there are critical issues: MAXIMUM score is 30%
   - IMPORTANT: Visa sponsorship and relocation are TYPICALLY EXPECTED for many jobs - do NOT automatically penalize for these unless private directions explicitly require otherwise (e.g., "US citizens only", "No visa sponsorship needed")
   - Only penalize visa/relocation if private directions specifically state requirements that conflict with candidate's answers
   - A candidate with ANY critical issue CANNOT get 70%+ score, regardless of strengths
   - A candidate with multiple critical issues (corrupted resume + lacks experience + wrong company) CANNOT get more than 25-30%
   - A candidate with 7 weaknesses (including critical ones) and 7 strengths should get 20-40% at most, NOT 50%+
   - Balance: if candidate has critical issues, score MUST be low (0-40%)
   - If candidate has strong qualifications and NO critical issues, score can be high (70-90%)
   - Score MUST reflect REAL match quality - be realistic and strict
   - REMEMBER: A 100% score means PERFECT fit with NO issues - if there are ANY critical issues mentioned in weaknesses or remarks, score MUST be below 50%
7. Evaluate PRIVATE DIRECTIONS COMPLIANCE (ONLY if private directions exist):
   - IMPORTANT: Only evaluate compliance if private directions were provided above
   - If NO private directions exist, set privateDirectionsCompliance to null or omit it
   - Determine if candidate meets the specific private direction requirements
   - Provide compliance score (0-100) - this is SEPARATE from overall match score
   - Explain reasoning based on private directions
   - NOTE: Standard screening questions (visa sponsorship needed, relocation willing) are typically EXPECTED and POSITIVE - only penalize if private directions explicitly require otherwise (e.g., "US citizens only", "No visa sponsorship")

IMPORTANT RULES:
- No hardcoded weights - determine relative importance of resume vs questionery based on context
- Private directions (if provided) MUST dominate the analysis
- Be fair and unbiased - focus on qualifications and fit
- Provide specific, actionable insights
- Consider overall potential, not just keyword matching
- CRITICAL: Resume is ONLY "corrupted" if it has ZERO usable content - do NOT mark as corrupted if it has any readable text, skills, experience, or education
- CRITICAL: Poor formatting, missing details, or sparse content do NOT make a resume "corrupted" - these are quality issues, not corruption
- CRITICAL: Overall match score must reflect actual fit quality - candidates with critical issues (TRULY corrupted resume with no content, wrong company, lack of required experience) should get LOW scores (0-40%)
- CRITICAL: Do NOT give high scores (70%+) to candidates with multiple critical weaknesses
- CRITICAL: Only flag "corrupted resume" if resume contains NO usable information - if you can extract ANY skills, experience, education, or readable text, it is NOT corrupted
- CRITICAL: A candidate with 100% score should have NO critical issues, meet all requirements, and have strong qualifications
- CRITICAL: Review your recruiter remarks - if they mention problems, the score MUST reflect those problems
- QUALITY OVER QUANTITY: Only include strong/weak points that are genuinely relevant - don't force points to meet a number
- A strong candidate may have few or no weak points - that's perfectly acceptable
- A candidate with many strengths should list the most important ones (up to the limit)
- Empty arrays are acceptable if no relevant points exist

Return your response as a JSON object with this exact structure:
${jsonStructureTemplate}

${privateDirections ? '' : 'IMPORTANT: Since no private directions were provided, DO NOT include "privateDirectionsCompliance" in your JSON response. Omit this field entirely.'}

IMPORTANT NOTES:
- The numbers (3-5, 5-7) are MAXIMUM limits, not requirements
- Only include points that are genuinely relevant and meaningful
- If a strong candidate has only 2-3 weak points, that's perfectly fine - don't invent more
- If a candidate has many strengths, list the most important ones (up to the limit)
- Quality and relevance matter more than hitting a specific count
- Empty arrays are acceptable if no relevant points exist

Return ONLY valid JSON, no additional text or markdown formatting.`;

  // Use unified LLM client with automatic Anthropic -> OpenAI fallback
  console.log(`[LLM Analysis] Starting analysis with automatic provider fallback...`);
  
  try {
    const response = await callLLM(prompt, {
      temperature: 0.3, // Balanced temperature for nuanced analysis
      maxTokens: 4096,
    });

    console.log(`[LLM Analysis] ✅ Analysis completed using ${response.provider} (${response.model})`);

    let jsonText = response.content.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const analysis = JSON.parse(jsonText) as any;

    // Validate and clean the data
    const result: ComprehensiveAnalysisResult = {
      resumeStrongPoints: Array.isArray(analysis.resumeStrongPoints) 
        ? analysis.resumeStrongPoints.filter((s: any) => typeof s === 'string' && s.trim().length > 0)
        : [],
      resumeWeakPoints: Array.isArray(analysis.resumeWeakPoints)
        ? analysis.resumeWeakPoints.filter((s: any) => typeof s === 'string' && s.trim().length > 0)
        : [],
      questioneryStrongPoints: Array.isArray(analysis.questioneryStrongPoints)
        ? analysis.questioneryStrongPoints.filter((s: any) => typeof s === 'string' && s.trim().length > 0)
        : [],
      questioneryWeakPoints: Array.isArray(analysis.questioneryWeakPoints)
        ? analysis.questioneryWeakPoints.filter((s: any) => typeof s === 'string' && s.trim().length > 0)
        : [],
      overallStrongPoints: Array.isArray(analysis.overallStrongPoints)
        ? analysis.overallStrongPoints.filter((s: any) => typeof s === 'string' && s.trim().length > 0)
        : [],
      overallWeakPoints: Array.isArray(analysis.overallWeakPoints)
        ? analysis.overallWeakPoints.filter((s: any) => typeof s === 'string' && s.trim().length > 0)
        : [],
      recruiterRemarks: analysis.recruiterRemarks || 'Analysis completed',
      resumeScore: (() => {
        // Validate resume score from LLM
        if (typeof analysis.resumeScore === 'number' && !isNaN(analysis.resumeScore)) {
          return Math.max(0, Math.min(100, analysis.resumeScore));
        }
        // Fallback: Calculate from resume-specific analysis
        const resumeStrengths = analysis.resumeStrongPoints?.length || 0;
        const resumeWeaknesses = analysis.resumeWeakPoints?.length || 0;
        const resumeTotal = resumeStrengths + resumeWeaknesses;
        if (resumeTotal > 0) {
          return Math.round((resumeStrengths / resumeTotal) * 100);
        }
        return undefined;
      })(),
      questioneryScore: (() => {
        // Validate questionery score from LLM
        if (typeof analysis.questioneryScore === 'number' && !isNaN(analysis.questioneryScore)) {
          return Math.max(0, Math.min(100, analysis.questioneryScore));
        }
        // Fallback: Calculate from questionery-specific analysis
        const questioneryStrengths = analysis.questioneryStrongPoints?.length || 0;
        const questioneryWeaknesses = analysis.questioneryWeakPoints?.length || 0;
        const questioneryTotal = questioneryStrengths + questioneryWeaknesses;
        if (questioneryTotal > 0) {
          return Math.round((questioneryStrengths / questioneryTotal) * 100);
        }
        // If no questionery data, return neutral score
        return 50;
      })(),
      overallMatchScore: (() => {
        // Calculate overall match score based on strengths/weaknesses
        // If LLM provided it, use it; otherwise calculate from analysis
        if (typeof analysis.overallMatchScore === 'number' && !isNaN(analysis.overallMatchScore)) {
          return Math.max(0, Math.min(100, analysis.overallMatchScore));
        }
        
        // Fallback: Calculate score based on strengths vs weaknesses
        // This is a heuristic - LLM should provide the score
        const strengths = analysis.overallStrongPoints?.length || 0;
        const weaknesses = analysis.overallWeakPoints?.length || 0;
        const totalPoints = strengths + weaknesses;
        
        if (totalPoints === 0) {
          return 50; // Neutral if no analysis
        }
        
        // Base score from ratio, but penalize heavily for critical issues
        const ratio = strengths / totalPoints;
        let baseScore = ratio * 100;
        
        // Check for critical issues in weaknesses (heavily penalize)
        // NOTE: Don't automatically penalize visa sponsorship - only if it conflicts with private directions
        const criticalIssues = [
          'corrupted', 'unreadable', 'cannot verify', 'wrong company',
          'lack.*required.*experience', 'missing.*required', 'does not meet.*requirement',
          'student.*rather than', 'no.*evidence'
        ];
        const weaknessText = analysis.overallWeakPoints?.join(' ').toLowerCase() || '';
        const hasCriticalIssues = criticalIssues.some(issue => {
          const regex = new RegExp(issue, 'i');
          return regex.test(weaknessText) || regex.test(analysis.recruiterRemarks?.toLowerCase() || '');
        });
        
        if (hasCriticalIssues) {
          // Heavy penalty for critical issues - score should be low
          baseScore = Math.min(baseScore, 40);
          // Further reduce if many weaknesses
          if (weaknesses > strengths) {
            baseScore = Math.min(baseScore, 30);
          }
        }
        
        return Math.round(Math.max(0, Math.min(100, baseScore)));
      })(),
      privateDirectionsCompliance: (() => {
        // Only return compliance if private directions exist
        if (!privateDirections || !privateDirections.trim()) {
          return undefined;
        }
        
        // Validate and ensure compliance score is a valid number
        if (analysis.privateDirectionsCompliance && analysis.privateDirectionsCompliance !== null) {
          const compliance = analysis.privateDirectionsCompliance;
          const score = typeof compliance.complianceScore === 'number' && !isNaN(compliance.complianceScore)
            ? Math.max(0, Math.min(100, compliance.complianceScore))
            : 50; // Default to 50 if private directions exist but score is invalid
          
          return {
            meetsRequirements: compliance.meetsRequirements ?? (score >= 70),
            complianceScore: score,
            reasoning: compliance.reasoning || 'Compliance assessment completed',
          };
        }
        
        // Default if no compliance data but private directions exist
        return {
          meetsRequirements: false,
          complianceScore: 50, // Default to 50 if private directions exist but no assessment
          reasoning: 'No compliance assessment available',
        };
      })(),
    };
    
    return result;
  } catch (error: any) {
    console.error('[LLM Analysis] Analysis failed:', error);
    throw new Error(`LLM comprehensive analysis failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Format resume data for LLM analysis
 */
function formatResumeForAnalysis(resumeData: ParsedResumeData): string {
  const parts: string[] = [];

  // Personal info
  if (resumeData.personalInfo) {
    parts.push('PERSONAL INFO:');
    if (resumeData.personalInfo.name) parts.push(`Name: ${resumeData.personalInfo.name}`);
    if (resumeData.personalInfo.email) parts.push(`Email: ${resumeData.personalInfo.email}`);
    if (resumeData.personalInfo.phone) parts.push(`Phone: ${resumeData.personalInfo.phone}`);
    if (resumeData.personalInfo.location) parts.push(`Location: ${resumeData.personalInfo.location}`);
    parts.push('');
  }

  // Skills
  if (resumeData.skills && resumeData.skills.length > 0) {
    parts.push(`SKILLS: ${resumeData.skills.join(', ')}`);
    parts.push('');
  }

  // Experience
  if (resumeData.experience && resumeData.experience.length > 0) {
    parts.push('EXPERIENCE:');
    resumeData.experience.forEach((exp, idx) => {
      parts.push(`${idx + 1}. ${exp.title || 'N/A'} at ${exp.company || 'N/A'}`);
      if (exp.duration) parts.push(`   Duration: ${exp.duration}`);
      if (exp.description) parts.push(`   Description: ${exp.description}`);
    });
    parts.push('');
  }

  // Education
  if (resumeData.education && resumeData.education.length > 0) {
    parts.push('EDUCATION:');
    resumeData.education.forEach((edu, idx) => {
      parts.push(`${idx + 1}. ${edu.degree || 'N/A'} from ${edu.institution || 'N/A'}`);
      if (edu.year) parts.push(`   Year: ${edu.year}`);
    });
    parts.push('');
  }

  // Certifications
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    parts.push(`CERTIFICATIONS: ${resumeData.certifications.join(', ')}`);
    parts.push('');
  }

  // Raw text (if available and not too long)
  if (resumeData.rawText) {
    const textPreview = resumeData.rawText.length > 2000 
      ? resumeData.rawText.substring(0, 2000) + '... (truncated)'
      : resumeData.rawText;
    parts.push('RESUME TEXT:');
    parts.push(textPreview);
  }

  return parts.join('\n');
}

