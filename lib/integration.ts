/**
 * Integration Module
 * 
 * Comprehensive application analysis using LLM
 * Analyzes resume + questionery together, extracts strong/weak points,
 * generates recruiter remarks, and stores results
 * 
 * Note: 
 * - Resumes are PDFs that need parsing (handled by resume.ts)
 * - Questionery includes all non-resume data (cover letter, custom answers, etc.)
 */

import 'server-only'; // Ensure this module only runs on the server

import { prisma } from './prisma';
import { parsePdfFromUrl, ParsedResumeData } from './resume';
import { getQuestioneryDataFromCandidate, QuestioneryData } from './questionery';
import { analyzeComprehensiveApplication } from './llm/analysis';
import { rankCandidatesForJob } from './ranking/comparative';
import { applicationRepository } from './repositories';

export interface IntegrationResult {
  stored: boolean;
  resumeStrongPoints?: string[];
  resumeWeakPoints?: string[];
  questioneryStrongPoints?: string[];
  questioneryWeakPoints?: string[];
  overallStrongPoints?: string[];
  overallWeakPoints?: string[];
  recruiterRemarks?: string;
  privateDirectionsCompliance?: {
    meetsRequirements: boolean;
    complianceScore: number;
    reasoning: string;
  };
  finalScore?: number;
  resumeScore?: number;
  questioneryScore?: number;
}

/**
 * Analyze application comprehensively using LLM
 * 
 * @param applicationId - Application ID to analyze
 * @param useLLM - Whether to use LLM analysis (default: true if API key is available)
 * @param triggerRanking - Whether to trigger ranking after analysis (default: true)
 */
export async function analyzeApplication(
  applicationId: string,
  useLLM: boolean = true,
  triggerRanking: boolean = true
): Promise<IntegrationResult> {
  // Fetch application with relations
  const application = await applicationRepository.findWithRelations(applicationId) as any;
  
  if (!application) {
    throw new Error(`Application not found: ${applicationId}`);
  }
  
  if (!application.jobPosting && !application.job) {
    throw new Error('Job posting not found');
  }

  // Get job posting with application form
  const jobPosting = application.jobPosting || application.job;
  
  // Fetch job with application form if not included
  let jobWithForm = jobPosting;
  if (!jobPosting.applicationForm) {
    jobWithForm = await prisma.job.findUnique({
      where: { id: jobPosting.id },
      include: {
        applicationForm: true,
      },
    });
  }

  const jobDescription = jobWithForm?.description || jobWithForm?.fullDescription || '';
  const jobRequirements = Array.isArray(jobWithForm?.requirements) 
    ? jobWithForm.requirements 
    : [];
  const jobResponsibilities = Array.isArray(jobWithForm?.responsibilities)
    ? jobWithForm.responsibilities
    : [];
  const privateDirections = jobWithForm?.privateDirections || null;

  // Check if resume exists
  if (!application.resumeFile && !application.candidate?.resumeUrl) {
    throw new Error('Resume URL not found for candidate');
  }

  // Get resume URL
  const resumeUrl = application.resumeFile || application.candidate?.resumeUrl;
  if (!resumeUrl) {
    throw new Error('Resume URL not found for candidate');
  }

  // Parse resume
  console.log(`Parsing resume for candidate ${applicationId}...`);
  let resumeData: ParsedResumeData;
  try {
    resumeData = await parsePdfFromUrl(resumeUrl, useLLM);
  } catch (error: any) {
    // If LLM parsing fails due to model error, try without LLM to get at least raw text
    if (error.message && (error.message.includes('not_found_error') || error.message.includes('model:'))) {
      console.warn('LLM resume parsing failed due to model error, falling back to raw text extraction');
      resumeData = await parsePdfFromUrl(resumeUrl, false);
    } else {
      throw error;
    }
  }
  
  // Ensure we have at least raw text
  if (!resumeData.rawText && resumeData.skills?.length === 0 && resumeData.experience?.length === 0) {
    throw new Error('Failed to parse resume: no text content extracted');
  }

  // Get questionery data
  console.log(`Getting questionery data for candidate ${applicationId}...`);
  const questioneryData = await getQuestioneryDataFromCandidate(applicationId);

  // Helper function to remove null bytes from data (PostgreSQL doesn't allow \u0000 in text fields)
  const sanitizeForPostgres = (data: any): any => {
    if (typeof data === 'string') {
      return data.replace(/\u0000/g, '');
    } else if (Array.isArray(data)) {
      return data.map(item => sanitizeForPostgres(item));
    } else if (data && typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = sanitizeForPostgres(value);
      }
      return sanitized;
    }
    return data;
  };

  // Store questionery data in candidate record for future reference
  // Type assertion needed until Prisma client is regenerated
  // Sanitize data to remove null bytes before storing
  await prisma.candidate.update({
    where: { id: applicationId },
    data: {
      questioneryData: sanitizeForPostgres(questioneryData) as any,
      parsedResumeData: sanitizeForPostgres(resumeData) as any,
    } as any,
  });

  // Perform comprehensive analysis with LLM
  if (!useLLM || (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY)) {
    throw new Error('LLM analysis is required but neither ANTHROPIC_API_KEY nor OPENAI_API_KEY is available');
  }

  console.log(`Performing comprehensive analysis for candidate ${applicationId}...`);
  let analysis;
  try {
    analysis = await analyzeComprehensiveApplication(
      resumeData,
      questioneryData,
      jobDescription,
      jobRequirements,
      jobResponsibilities,
      privateDirections,
      jobWithForm?.applicationForm
    );
  } catch (error: any) {
    // Error handling is now done in the unified LLM client
    // Just re-throw with context
    console.error('[Integration] Analysis failed:', error);
    throw error;
  }

    // Store analysis results in database
  try {
    console.log(`Storing analysis results for candidate ${applicationId}...`);
    
    // Helper function to remove null bytes from strings (PostgreSQL doesn't allow \u0000 in text fields)
    const sanitizeString = (str: string | null | undefined): string | null => {
      if (!str) return str || null;
      return str.replace(/\u0000/g, '');
    };

    // Type assertion needed until Prisma client is regenerated after schema changes
    // Calculate scores based on overall match score (reflects actual fit quality)
    const overallMatchScore = analysis.overallMatchScore;
    const complianceScore = analysis.privateDirectionsCompliance?.complianceScore;
    const privateDirections = jobWithForm.privateDirections;
    
    // Detect critical issues from analysis
    const weaknessText = analysis.overallWeakPoints?.join(' ').toLowerCase() || '';
    const remarksText = analysis.recruiterRemarks?.toLowerCase() || '';
    const combinedText = weaknessText + ' ' + remarksText;
    
    // Check for critical issues - use comprehensive pattern matching
    // NOTE: Visa sponsorship is NOT automatically a critical issue - only if private directions specify otherwise
    const hasCorruptedResume = /corrupted|unreadable|cannot verify|impossible to verify|completely corrupted|making it impossible/i.test(combinedText);
    const hasWrongCompany = /wrong company|addressing wrong|careless error.*company|addressed.*wrong/i.test(combinedText);
    const lacksRequiredExperience = /lack.*required.*experience|student.*rather than|appears to lack|does not have.*required|lack the required|appears to be a.*student/i.test(combinedText);
    
    // Only treat visa sponsorship as a critical issue if private directions explicitly require otherwise
    // Check if private directions mention citizenship/visa requirements that conflict
    const privateDirectionsText = (jobWithForm.privateDirections || '').toLowerCase();
    const requiresCitizenship = /citizens only|us citizen|citizenship required|no visa|no sponsorship|must be citizen/i.test(privateDirectionsText);
    const needsVisaSponsorship = /visa sponsorship|will require.*visa|sponsorship.*needed|require visa|need.*sponsorship/i.test(combinedText);
    // Only flag as critical if private directions require citizenship AND candidate needs visa
    const hasVisaConflict = requiresCitizenship && needsVisaSponsorship;
    
    // Count critical issues (visa only counts if it conflicts with private directions)
    const criticalIssueCount = [hasCorruptedResume, hasWrongCompany, lacksRequiredExperience, hasVisaConflict].filter(Boolean).length;
    const hasMultipleCriticalIssues = criticalIssueCount >= 2;
    
    const strengths = analysis.overallStrongPoints?.length || 0;
    const weaknesses = analysis.overallWeakPoints?.length || 0;
    const weaknessesOutnumberStrengths = weaknesses > strengths;
    
    // Use overall match score if available, but ALWAYS validate it against critical issues
    let baseScore: number;
    if (typeof overallMatchScore === 'number' && !isNaN(overallMatchScore)) {
      baseScore = overallMatchScore;
      
      // VALIDATION: Always check for critical issues and enforce realistic scoring
      // If LLM gave unrealistic score, override it based on critical issues
      const hasAnyCriticalIssue = hasCorruptedResume || hasWrongCompany || lacksRequiredExperience || hasVisaConflict;
      
      if (hasAnyCriticalIssue) {
        console.warn(`[Score Validation] LLM returned ${baseScore}% but critical issues detected:`, {
          hasCorruptedResume,
          hasWrongCompany,
          lacksRequiredExperience,
          hasVisaConflict,
          hasMultipleCriticalIssues,
          weaknessesOutnumberStrengths,
        });
        
        // Calculate maximum realistic score based on critical issues
        // Apply constraints in order from most restrictive to least restrictive
        let maxScore = 100;
        
        // WORST CASE: All three major issues = 25% absolute maximum
        if (hasCorruptedResume && lacksRequiredExperience && hasWrongCompany) {
          maxScore = 25;
        }
        // 4 critical issues = 25% maximum
        else if (criticalIssueCount >= 4) {
          maxScore = 25;
        }
        // 3 critical issues = 30% maximum
        else if (criticalIssueCount >= 3) {
          maxScore = 30;
        }
        // 2+ critical issues = 35% maximum
        else if (hasMultipleCriticalIssues) {
          maxScore = 35;
        }
        // Single critical issues
        else {
          // Corrupted resume = 40% maximum
          if (hasCorruptedResume) {
            maxScore = 40;
          }
          // Lacking required experience = 50% maximum
          else if (lacksRequiredExperience) {
            maxScore = 50;
          }
          // Wrong company = apply 25% penalty (but not if already capped lower)
          if (hasWrongCompany) {
            maxScore = Math.min(maxScore, Math.floor(maxScore * 0.75));
          }
        }
        
        // Apply visa sponsorship penalty ONLY if it conflicts with private directions
        if (hasVisaConflict) {
          maxScore = Math.max(0, maxScore - 15); // Penalize visa conflict
        }
        
        // Additional constraints
        // If weaknesses outnumber strengths with critical issues, cap at 30%
        if (weaknessesOutnumberStrengths && (hasCorruptedResume || lacksRequiredExperience)) {
          maxScore = Math.min(maxScore, 30);
        }
        
        // Final hard caps as safety
        if (criticalIssueCount >= 3) {
          maxScore = Math.min(maxScore, 30);
        }
        if (criticalIssueCount >= 2 && maxScore > 35) {
          maxScore = 35;
        }
        if (criticalIssueCount > 0 && maxScore > 50) {
          maxScore = 50; // Any critical issue = max 50%
        }
        
        // Ensure visa penalty doesn't push below reasonable minimum for worst cases
        if (criticalIssueCount >= 4 && maxScore < 20) {
          maxScore = 20; // Minimum 20% even with all issues
        }
        
        // Override the LLM score if it's higher than our calculated maximum
        if (baseScore > maxScore) {
          console.warn(`[Score Validation] Overriding LLM score from ${baseScore}% to ${maxScore}% due to critical issues`);
          baseScore = maxScore;
        }
      }
      
      // If private directions exist and compliance score is much lower, reduce the score
      if (privateDirections && typeof complianceScore === 'number' && !isNaN(complianceScore)) {
        if (complianceScore < baseScore - 20) {
          // Compliance is much worse - reduce score but not below compliance score
          baseScore = Math.min(baseScore, Math.max(complianceScore, baseScore * 0.7));
        }
      }
    } else if (typeof complianceScore === 'number' && !isNaN(complianceScore)) {
      // Fallback to compliance score if no overall match score
      baseScore = complianceScore;
      
      // Apply the same comprehensive critical issue validation logic
      const hasAnyCriticalIssue = hasCorruptedResume || hasWrongCompany || lacksRequiredExperience || hasVisaConflict;
      if (hasAnyCriticalIssue) {
        let maxScore = 100;
        if (hasCorruptedResume && lacksRequiredExperience && hasWrongCompany) {
          maxScore = 25;
        } else if (criticalIssueCount >= 4) {
          maxScore = 25;
        } else if (criticalIssueCount >= 3) {
          maxScore = 30;
        } else if (hasMultipleCriticalIssues) {
          maxScore = 35;
        } else {
          if (hasCorruptedResume) maxScore = 40;
          else if (lacksRequiredExperience) maxScore = 50;
          if (hasWrongCompany) maxScore = Math.min(maxScore, Math.floor(maxScore * 0.75));
        }
        if (hasVisaConflict) maxScore = Math.max(0, maxScore - 15);
        if (weaknessesOutnumberStrengths && (hasCorruptedResume || lacksRequiredExperience)) {
          maxScore = Math.min(maxScore, 30);
        }
        if (criticalIssueCount >= 3) maxScore = Math.min(maxScore, 30);
        if (criticalIssueCount >= 2 && maxScore > 35) maxScore = 35;
        if (criticalIssueCount > 0 && maxScore > 50) maxScore = 50;
        if (criticalIssueCount >= 4 && maxScore < 20) maxScore = 20;
        baseScore = Math.min(baseScore, maxScore);
      }
    } else {
      // Last resort: calculate from strengths/weaknesses
      const total = strengths + weaknesses;
      baseScore = total > 0 ? (strengths / total) * 100 : 50;
      
      // Apply the same comprehensive critical issue validation logic
      const hasAnyCriticalIssue = hasCorruptedResume || hasWrongCompany || lacksRequiredExperience || hasVisaConflict;
      if (hasAnyCriticalIssue) {
        let maxScore = 100;
        if (hasCorruptedResume && lacksRequiredExperience && hasWrongCompany) {
          maxScore = 25;
        } else if (criticalIssueCount >= 4) {
          maxScore = 25;
        } else if (criticalIssueCount >= 3) {
          maxScore = 30;
        } else if (hasMultipleCriticalIssues) {
          maxScore = 35;
        } else {
          if (hasCorruptedResume) maxScore = 40;
          else if (lacksRequiredExperience) maxScore = 50;
          if (hasWrongCompany) maxScore = Math.min(maxScore, Math.floor(maxScore * 0.75));
        }
        if (hasVisaConflict) maxScore = Math.max(0, maxScore - 15);
        if (weaknessesOutnumberStrengths && (hasCorruptedResume || lacksRequiredExperience)) {
          maxScore = Math.min(maxScore, 30);
        }
        if (criticalIssueCount >= 3) maxScore = Math.min(maxScore, 30);
        if (criticalIssueCount >= 2 && maxScore > 35) maxScore = 35;
        if (criticalIssueCount > 0 && maxScore > 50) maxScore = 50;
        if (criticalIssueCount >= 4 && maxScore < 20) maxScore = 20;
        baseScore = Math.min(baseScore, maxScore);
      }
    }
    
    // Calculate final score (overall match score with validation)
    const validatedScore = Math.max(0, Math.min(100, baseScore));
    const finalScore = validatedScore;
    
    // Get resume score from LLM analysis, or calculate from resume-specific analysis
    let resumeScore: number;
    if (typeof analysis.resumeScore === 'number' && !isNaN(analysis.resumeScore)) {
      // Use LLM-provided resume score
      resumeScore = Math.max(0, Math.min(100, analysis.resumeScore));
      
      // Apply critical issue penalties specific to resume (these override LLM score if needed)
      if (hasCorruptedResume) {
        resumeScore = Math.min(resumeScore, 40); // Corrupted resume heavily penalizes resume score
      }
      if (lacksRequiredExperience) {
        resumeScore = Math.min(resumeScore, 50); // Missing experience penalizes resume score
      }
    } else {
      // Fallback: Calculate from resume-specific strengths/weaknesses
      const resumeStrengths = analysis.resumeStrongPoints?.length || 0;
      const resumeWeaknesses = analysis.resumeWeakPoints?.length || 0;
      const resumeTotal = resumeStrengths + resumeWeaknesses;
      if (resumeTotal > 0) {
        const resumeRatio = resumeStrengths / resumeTotal;
        resumeScore = resumeRatio * 100;
        if (hasCorruptedResume) resumeScore = Math.min(resumeScore, 40);
        if (lacksRequiredExperience) resumeScore = Math.min(resumeScore, 50);
      } else {
        resumeScore = finalScore; // Fallback to final score
      }
    }
    resumeScore = Math.max(0, Math.min(100, resumeScore));
    
    // Get questionery score from LLM analysis, or calculate from questionery-specific analysis
    let questioneryScore: number;
    if (typeof analysis.questioneryScore === 'number' && !isNaN(analysis.questioneryScore)) {
      // Use LLM-provided questionery score
      questioneryScore = Math.max(0, Math.min(100, analysis.questioneryScore));
      
      // Apply critical issue penalties specific to questionery (these override LLM score if needed)
      if (hasWrongCompany) {
        questioneryScore = Math.min(questioneryScore, questioneryScore * 0.75); // Wrong company heavily penalizes questionery score
      }
    } else {
      // Fallback: Calculate from questionery-specific strengths/weaknesses
      const questioneryStrengths = analysis.questioneryStrongPoints?.length || 0;
      const questioneryWeaknesses = analysis.questioneryWeakPoints?.length || 0;
      const questioneryTotal = questioneryStrengths + questioneryWeaknesses;
      if (questioneryTotal > 0) {
        const questioneryRatio = questioneryStrengths / questioneryTotal;
        questioneryScore = questioneryRatio * 100;
        if (hasWrongCompany) questioneryScore = Math.min(questioneryScore, questioneryScore * 0.75);
      } else {
        // If no questionery data exists, use neutral score
        questioneryScore = 50; // Neutral if no questionery data at all
      }
    }
    questioneryScore = Math.max(0, Math.min(100, questioneryScore));

    await prisma.candidate.update({
      where: { id: applicationId },
      data: {
        resumeStrongPoints: analysis.resumeStrongPoints.map(s => sanitizeString(s)!),
        resumeWeakPoints: analysis.resumeWeakPoints.map(s => sanitizeString(s)!),
        questioneryStrongPoints: analysis.questioneryStrongPoints.map(s => sanitizeString(s)!),
        questioneryWeakPoints: analysis.questioneryWeakPoints.map(s => sanitizeString(s)!),
        overallStrengths: analysis.overallStrongPoints.map(s => sanitizeString(s)!),
        overallWeaknesses: analysis.overallWeakPoints.map(s => sanitizeString(s)!),
        recruiterRemarks: sanitizeString(analysis.recruiterRemarks),
        privateDirectionsCompliance: sanitizeForPostgres(analysis.privateDirectionsCompliance) as any,
        analyzedAt: new Date(),
        analysisMethod: 'llm_comprehensive_analysis_v1',
        // Store calculated scores based on overall match quality
        resumeScore: resumeScore,
        questioneryScore: questioneryScore,
        finalScore: finalScore,
        aiScore: Math.round(finalScore),
        // Update matchReasons with overall strengths (sanitize to remove null bytes)
        matchReasons: analysis.overallStrongPoints.slice(0, 5).map(s => sanitizeString(s)!),
      } as any,
    });

    console.log(`Analysis stored for candidate ${applicationId}`);

    // Trigger ranking if requested
    if (triggerRanking) {
      console.log(`Triggering ranking for job ${jobWithForm.id}...`);
      try {
        await rankCandidatesForJob(jobWithForm.id);
        console.log(`Ranking completed for job ${jobWithForm.id}`);
      } catch (error: any) {
        console.error(`Error triggering ranking: ${error.message}`);
        // Don't fail the analysis if ranking fails
      }
    }

    // Return the same scores that were stored in the database
    return {
      stored: true,
      resumeStrongPoints: analysis.resumeStrongPoints,
      resumeWeakPoints: analysis.resumeWeakPoints,
      questioneryStrongPoints: analysis.questioneryStrongPoints,
      questioneryWeakPoints: analysis.questioneryWeakPoints,
      overallStrongPoints: analysis.overallStrongPoints,
      overallWeakPoints: analysis.overallWeakPoints,
      recruiterRemarks: analysis.recruiterRemarks,
      privateDirectionsCompliance: analysis.privateDirectionsCompliance,
      finalScore: finalScore,
      resumeScore: resumeScore,
      questioneryScore: questioneryScore,
    };
  } catch (error: any) {
    console.error('Error storing analysis results:', error);
    // Return results even if storage fails - calculate score the same way
    const overallMatchScore = analysis.overallMatchScore;
    const complianceScore = analysis.privateDirectionsCompliance?.complianceScore;
    const privateDirections = jobWithForm.privateDirections;
    
    let fallbackScore: number;
    if (typeof overallMatchScore === 'number' && !isNaN(overallMatchScore)) {
      fallbackScore = overallMatchScore;
    } else if (typeof complianceScore === 'number' && !isNaN(complianceScore)) {
      fallbackScore = complianceScore;
    } else {
      // Calculate from strengths/weaknesses
      const strengths = analysis.overallStrongPoints?.length || 0;
      const weaknesses = analysis.overallWeakPoints?.length || 0;
      const total = strengths + weaknesses;
      fallbackScore = total > 0 ? (strengths / total) * 100 : 50;
      
      // Penalize for critical issues
      const weaknessText = analysis.overallWeakPoints?.join(' ').toLowerCase() || '';
      const remarksText = analysis.recruiterRemarks?.toLowerCase() || '';
      const hasCriticalIssues = /corrupted|unreadable|cannot verify|wrong company|lack.*required|visa sponsorship|student.*rather than/i.test(weaknessText + ' ' + remarksText);
      if (hasCriticalIssues && weaknesses > strengths) {
        fallbackScore = Math.min(fallbackScore, 40);
      }
    }
    
    fallbackScore = Math.max(0, Math.min(100, fallbackScore));
    
    return {
      stored: false,
      resumeStrongPoints: analysis.resumeStrongPoints,
      resumeWeakPoints: analysis.resumeWeakPoints,
      questioneryStrongPoints: analysis.questioneryStrongPoints,
      questioneryWeakPoints: analysis.questioneryWeakPoints,
      overallStrongPoints: analysis.overallStrongPoints,
      overallWeakPoints: analysis.overallWeakPoints,
      recruiterRemarks: analysis.recruiterRemarks,
      privateDirectionsCompliance: analysis.privateDirectionsCompliance,
      finalScore: fallbackScore,
      resumeScore: fallbackScore,
      questioneryScore: fallbackScore,
    };
  }
}

/**
 * Get analysis results for an application
 * Returns stored results if available, otherwise returns null
 */
export async function getAnalysisResults(applicationId: string): Promise<IntegrationResult | null> {
  try {
    // Fetch candidate without explicit select to avoid TypeScript errors
    // Prisma client needs to be regenerated after schema changes
    const candidate = await prisma.candidate.findUnique({
      where: { id: applicationId },
    }) as any; // Type assertion needed until Prisma client is regenerated
    
    if (!candidate) {
      return null;
    }
    
    // Check if analysis has been performed
    if (!candidate.analyzedAt) {
      return null;
    }
    
    // Extract scores from candidate record with proper NaN handling
    let finalScore: number = 0;
    if (candidate.finalScore != null && typeof candidate.finalScore === 'number' && !isNaN(candidate.finalScore)) {
      finalScore = candidate.finalScore;
    } else if (candidate.aiScore != null && typeof candidate.aiScore === 'number' && !isNaN(candidate.aiScore)) {
      finalScore = candidate.aiScore;
    } else if (candidate.privateDirectionsCompliance && typeof candidate.privateDirectionsCompliance === 'object' && 'complianceScore' in candidate.privateDirectionsCompliance) {
      const compScore = (candidate.privateDirectionsCompliance as any).complianceScore;
      if (typeof compScore === 'number' && !isNaN(compScore)) {
        finalScore = compScore;
      }
    }
    
    let resumeScore: number = finalScore;
    if (candidate.resumeScore != null && typeof candidate.resumeScore === 'number' && !isNaN(candidate.resumeScore)) {
      resumeScore = candidate.resumeScore;
    }
    
    let questioneryScore: number = finalScore;
    if (candidate.questioneryScore != null && typeof candidate.questioneryScore === 'number' && !isNaN(candidate.questioneryScore)) {
      questioneryScore = candidate.questioneryScore;
    }

    return {
      stored: true,
      resumeStrongPoints: Array.isArray(candidate.resumeStrongPoints) ? candidate.resumeStrongPoints : [],
      resumeWeakPoints: Array.isArray(candidate.resumeWeakPoints) ? candidate.resumeWeakPoints : [],
      questioneryStrongPoints: Array.isArray(candidate.questioneryStrongPoints) ? candidate.questioneryStrongPoints : [],
      questioneryWeakPoints: Array.isArray(candidate.questioneryWeakPoints) ? candidate.questioneryWeakPoints : [],
      overallStrongPoints: Array.isArray(candidate.overallStrengths) ? candidate.overallStrengths : [],
      overallWeakPoints: Array.isArray(candidate.overallWeaknesses) ? candidate.overallWeaknesses : [],
      recruiterRemarks: candidate.recruiterRemarks || undefined,
      privateDirectionsCompliance: candidate.privateDirectionsCompliance || undefined,
      finalScore: finalScore,
      resumeScore: resumeScore,
      questioneryScore: questioneryScore,
    };
  } catch (error) {
    console.error('Error fetching analysis results:', error);
    return null;
  }
}

/**
 * Re-analyze application (recalculate and update analysis)
 * 
 * @param applicationId - Application ID to re-analyze
 * @param useLLM - Whether to use LLM analysis (default: true if API key is available)
 * @param triggerRanking - Whether to trigger ranking after analysis (default: true)
 */
export async function reanalyzeApplication(
  applicationId: string,
  useLLM: boolean = true,
  triggerRanking: boolean = true
): Promise<IntegrationResult> {
  return analyzeApplication(applicationId, useLLM, triggerRanking);
}
