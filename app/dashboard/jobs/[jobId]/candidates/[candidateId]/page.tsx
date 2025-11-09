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
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setDataLoading(false);
      }
    }

    fetchData();
  }, [jobId, candidateId, company?.slug]);

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
