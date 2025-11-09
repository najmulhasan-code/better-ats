/**
 * Candidate Profile Page
 * Displays full candidate application details including all form responses
 */

'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Calendar,
  FileText,
  Award,
  Download,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';
import { useCurrentCompany } from '@/lib/auth/hooks';

const PIPELINE_STAGES = [
  { id: 'applied', name: 'New Applicants', color: 'slate' },
  { id: 'screening', name: 'Screening', color: 'blue' },
  { id: 'interview', name: 'Interview', color: 'purple' },
  { id: 'offer', name: 'Offer', color: 'green' },
  { id: 'hired', name: 'Hired', color: 'emerald' },
  { id: 'rejected', name: 'Rejected', color: 'red' },
];

interface CandidateProfilePageProps {
  params: Promise<{ jobId: string; candidateId: string }>;
}

export default function CandidateProfilePage({ params }: CandidateProfilePageProps) {
  const { jobId, candidateId } = use(params);
  const { company, loading } = useCurrentCompany();
  const [candidate, setCandidate] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!company?.slug) return;

      setDataLoading(true);
      try {
        const candidateResponse = await fetch(`/api/dashboard/jobs/${jobId}/candidates/${candidateId}`);
        if (candidateResponse.ok) {
          const candidateData = await candidateResponse.json();
          setCandidate(candidateData.candidate);
        }

        const jobResponse = await fetch(`/api/jobs/${jobId}`);
        if (jobResponse.ok) {
          const jobData = await jobResponse.json();
          setJob(jobData.job);
        }

        // Fetch analysis data (if available)
        setAnalysisLoading(true);
        try {
          const analysisResponse = await fetch(`/api/dashboard/jobs/${jobId}/candidates/${candidateId}/analyze`);
          if (analysisResponse.ok) {
            const analysisData = await analysisResponse.json();
            if (analysisData.analysis) {
              setAnalysis(analysisData.analysis);
            }
          }
          // If analysis fails (400/404), it's okay - we'll show the "Run Analysis" button
        } catch (error) {
          console.error('Error fetching analysis:', error);
          // Silently fail - analysis might not be available yet
        } finally {
          setAnalysisLoading(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setDataLoading(false);
      }
    }

    fetchData();
  }, [jobId, candidateId, company?.slug]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch(`/api/dashboard/jobs/${jobId}/candidates/${candidateId}/analyze`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
        // Refresh candidate data to get updated aiScore
        const candidateResponse = await fetch(`/api/dashboard/jobs/${jobId}/candidates/${candidateId}`);
        if (candidateResponse.ok) {
          const candidateData = await candidateResponse.json();
          setCandidate(candidateData.candidate);
        }
      }
    } catch (error) {
      console.error('Error analyzing candidate:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'strong_yes':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'yes':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'maybe':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'no':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[15px] text-slate-600">Loading candidate profile...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[15px] text-slate-600">Please sign in to view candidate</div>
      </div>
    );
  }

  if (!candidate || !job) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-[24px] font-bold text-slate-900 mb-3">Candidate not found</h2>
          <Link
            href={`/dashboard/jobs/${jobId}/candidates`}
            className="text-[15px] text-[#5371FE] hover:text-[#4461ED] font-semibold"
          >
            Back to candidates
          </Link>
        </div>
      </div>
    );
  }

  const currentStage = PIPELINE_STAGES.find((s) => s.id === candidate.stage);

  const knockoutResponses = candidate.applicationResponses?.filter((r: any) => r.answer?.type === 'knockout') || [];
  const customResponses = candidate.applicationResponses?.filter((r: any) => r.answer?.type === 'custom') || [];
  const eeoResponses = candidate.applicationResponses?.filter((r: any) => r.answer?.type === 'eeo') || [];

  // Format the applied date from timestamp
  const formatAppliedDate = (timestamp: string) => {
    const date = new Date(Number(timestamp));
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <Link
        href={`/dashboard/jobs/${jobId}/candidates`}
        className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to candidates
      </Link>

      <div className="bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-8 shadow-xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[40px] font-bold text-slate-900 mb-2 tracking-tight">{candidate.name}</h1>
            <p className="text-[15px] text-slate-600">{candidate.currentRole || 'Applicant'}</p>
          </div>
          {candidate.aiScore > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-[15px] font-semibold">
              <Award size={18} />
              {candidate.aiScore}% match
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <Mail size={18} className="text-slate-600" />
            </div>
            <div>
              <div className="text-[12px] text-slate-500 font-medium mb-0.5">Email</div>
              <a
                href={`mailto:${candidate.email}`}
                className="text-[14px] text-[#5371FE] hover:text-[#4461ED] font-medium"
              >
                {candidate.email}
              </a>
            </div>
          </div>

          {candidate.phone && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Phone size={18} className="text-slate-600" />
              </div>
              <div>
                <div className="text-[12px] text-slate-500 font-medium mb-0.5">Phone</div>
                <a
                  href={`tel:${candidate.phone}`}
                  className="text-[14px] text-slate-900 hover:text-[#5371FE] font-medium"
                >
                  {candidate.phone}
                </a>
              </div>
            </div>
          )}

          {candidate.linkedin && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <ExternalLink size={18} className="text-slate-600" />
              </div>
              <div>
                <div className="text-[12px] text-slate-500 font-medium mb-0.5">LinkedIn</div>
                <a
                  href={candidate.linkedin.startsWith('http') ? candidate.linkedin : `https://${candidate.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] text-[#5371FE] hover:text-[#4461ED] font-medium"
                >
                  View Profile
                </a>
              </div>
            </div>
          )}

          {candidate.portfolio && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <ExternalLink size={18} className="text-slate-600" />
              </div>
              <div>
                <div className="text-[12px] text-slate-500 font-medium mb-0.5">Portfolio</div>
                <a
                  href={candidate.portfolio.startsWith('http') ? candidate.portfolio : `https://${candidate.portfolio}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] text-[#5371FE] hover:text-[#4461ED] font-medium"
                >
                  View Website
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-8 shadow-xl">
        <h2 className="text-[18px] font-semibold text-slate-900 mb-6">Application Details</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-[13px] text-slate-600 font-medium mb-2">Applied for</div>
            <div className="text-[15px] font-semibold text-slate-900">{job.title}</div>
          </div>
          <div>
            <div className="text-[13px] text-slate-600 font-medium mb-2">Applied</div>
            <div className="text-[15px] font-semibold text-slate-900 flex items-center gap-2">
              <Calendar size={16} className="text-slate-400" />
              {formatAppliedDate(candidate.appliedDateTimestamp)}
            </div>
          </div>
          <div>
            <div className="text-[13px] text-slate-600 font-medium mb-2">Current stage</div>
            <div className="text-[15px] font-semibold text-slate-900 capitalize">
              {currentStage?.name || 'Unknown'}
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis Section */}
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[18px] font-semibold text-slate-900 flex items-center gap-2">
            <Sparkles size={20} className="text-[#5371FE]" />
            AI Analysis
          </h2>
          {!analysis && !analysisLoading && (
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#5371FE] text-white text-[14px] font-semibold rounded-xl hover:bg-[#4461ED] active:bg-[#3551DC] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Run Analysis
                </>
              )}
            </button>
          )}
        </div>

        {analysisLoading && !analysis ? (
          <div className="text-center py-8">
            <div className="text-[15px] text-slate-600">Loading analysis...</div>
          </div>
        ) : analysis ? (
          <div className="space-y-6">
            {/* Scores Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[12px] text-slate-600 font-medium mb-1">Final Score</div>
                <div className={`text-2xl font-bold ${getScoreColor(analysis.finalScore).split(' ')[0]}`}>
                  {Math.round(analysis.finalScore)}%
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[12px] text-slate-600 font-medium mb-1">Resume Score</div>
                <div className={`text-2xl font-bold ${getScoreColor(analysis.resumeScore).split(' ')[0]}`}>
                  {Math.round(analysis.resumeScore)}%
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[12px] text-slate-600 font-medium mb-1">Cover Letter Score</div>
                <div className={`text-2xl font-bold ${getScoreColor(analysis.questioneryScore).split(' ')[0]}`}>
                  {Math.round(analysis.questioneryScore)}%
                </div>
              </div>
            </div>

            {/* Hiring Recommendation */}
            {analysis.hiringRecommendation && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[13px] text-slate-600 font-medium mb-2">Hiring Recommendation</div>
                <div className={`inline-flex px-3 py-1.5 rounded-lg text-[14px] font-semibold border ${getRecommendationColor(analysis.hiringRecommendation)}`}>
                  {analysis.hiringRecommendation.replace('_', ' ').toUpperCase()}
                </div>
              </div>
            )}

            {/* Strengths */}
            {analysis.overallStrengths && analysis.overallStrengths.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={18} className="text-emerald-600" />
                  <h3 className="text-[15px] font-semibold text-slate-900">Strengths</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.overallStrengths.map((strength: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[13px] font-medium"
                    >
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Weaknesses */}
            {analysis.overallWeaknesses && analysis.overallWeaknesses.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown size={18} className="text-red-600" />
                  <h3 className="text-[15px] font-semibold text-slate-900">Weaknesses</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.overallWeaknesses.map((weakness: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-[13px] font-medium"
                    >
                      {weakness}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={18} className="text-blue-600" />
                  <h3 className="text-[15px] font-semibold text-slate-900">Recommendations</h3>
                </div>
                <ul className="space-y-2">
                  {analysis.recommendations.map((recommendation: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-[14px] text-slate-700">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Comprehensive Analysis */}
            {analysis.comprehensiveAnalysis && (
              <div>
                <h3 className="text-[15px] font-semibold text-slate-900 mb-3">Comprehensive Analysis</h3>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[14px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {analysis.comprehensiveAnalysis}
                  </p>
                </div>
              </div>
            )}

            {/* Detailed Analysis */}
            <div className="grid grid-cols-2 gap-4">
              {analysis.resumeKeyInfo && (
                <div>
                  <h3 className="text-[15px] font-semibold text-slate-900 mb-3">Resume Analysis</h3>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 max-h-64 overflow-y-auto">
                    <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {analysis.resumeKeyInfo}
                    </p>
                  </div>
                </div>
              )}
              {analysis.questioneryKeyInfo && (
                <div>
                  <h3 className="text-[15px] font-semibold text-slate-900 mb-3">Cover Letter Analysis</h3>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 max-h-64 overflow-y-auto">
                    <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {analysis.questioneryKeyInfo}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-[15px] text-slate-600 mb-4">No analysis available yet</p>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#5371FE] text-white text-[14px] font-semibold rounded-xl hover:bg-[#4461ED] active:bg-[#3551DC] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Run Analysis
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {candidate.resumeFile && (
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-8 shadow-xl">
          <h2 className="text-[18px] font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-[#5371FE]" />
            Resume
          </h2>
          <a
            href={candidate.resumeFile}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#5371FE] text-white text-[15px] font-semibold rounded-xl hover:bg-[#4461ED] active:bg-[#3551DC] transition-all"
          >
            <Download size={18} />
            Download Resume
          </a>
        </div>
      )}

      {candidate.coverLetter && (
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-8 shadow-xl">
          <h2 className="text-[18px] font-semibold text-slate-900 mb-4">Cover Letter</h2>
          <p className="text-[15px] text-slate-700 leading-relaxed whitespace-pre-wrap">
            {candidate.coverLetter}
          </p>
        </div>
      )}

      {knockoutResponses.length > 0 && (
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-8 shadow-xl">
          <h2 className="text-[18px] font-semibold text-slate-900 mb-6">Screening Questions</h2>
          <div className="space-y-5">
            {knockoutResponses.map((response: any) => (
              <div key={response.id} className="pb-5 border-b border-slate-200/60 last:border-0 last:pb-0">
                <div className="text-[14px] font-semibold text-slate-900 mb-2">{response.questionId}</div>
                <div
                  className={`inline-flex px-3 py-1.5 rounded-lg text-[13px] font-semibold ${
                    response.answer?.value === 'yes'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {response.answer?.value === 'yes' ? 'Yes' : 'No'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {customResponses.length > 0 && (
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-8 shadow-xl">
          <h2 className="text-[18px] font-semibold text-slate-900 mb-6">Additional Questions</h2>
          <div className="space-y-5">
            {customResponses.map((response: any) => (
              <div key={response.id} className="pb-5 border-b border-slate-200/60 last:border-0 last:pb-0">
                <div className="text-[14px] font-semibold text-slate-900 mb-2">{response.questionId}</div>
                <div className="text-[15px] text-slate-700">{response.answer?.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {eeoResponses.length > 0 && (
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-8 shadow-xl">
          <h2 className="text-[18px] font-semibold text-slate-900 mb-3">
            Equal Employment Opportunity Information
          </h2>
          <p className="text-[12px] text-slate-600 bg-slate-100 px-3 py-2 rounded-lg mb-6">
            This information is voluntary and confidential. It will not affect hiring decisions.
          </p>
          <div className="grid grid-cols-2 gap-5">
            {eeoResponses.map((response: any) => (
              <div key={response.id}>
                <div className="text-[13px] text-slate-600 font-medium mb-1 capitalize">
                  {response.questionId.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="text-[15px] font-semibold text-slate-900 capitalize">
                  {response.answer?.value.replace(/-/g, ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
