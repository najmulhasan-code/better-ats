import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, ExternalLink, Calendar, Briefcase, GraduationCap, Award } from 'lucide-react';
import { mockCandidates, mockJobs, PIPELINE_STAGES } from '@/lib/mockData';
import { CURRENT_COMPANY } from '@/lib/auth';
import { candidateStore } from '@/lib/candidateStore';

interface CandidateProfilePageProps {
  params: Promise<{ jobId: string; candidateId: string }>;
}

export default function CandidateProfilePage({ params }: CandidateProfilePageProps) {
  const { jobId, candidateId } = use(params);

  // Check both localStorage and mock data
  const storedCandidate = candidateStore.getById(candidateId);
  const mockCandidate = mockCandidates.find(
    (c) => c.id === candidateId && c.jobId === jobId && c.companySlug === CURRENT_COMPANY.slug
  );

  const candidate = storedCandidate || mockCandidate;

  const job = mockJobs.find(
    (j) => j.id === jobId && j.companySlug === CURRENT_COMPANY.slug
  );

  if (!candidate || !job) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Candidate not found</h2>
          <Link href={`/dashboard/jobs/${jobId}/candidates`} className="text-sm text-slate-600 hover:text-slate-900">
            Back to candidates
          </Link>
        </div>
      </div>
    );
  }

  const currentStage = PIPELINE_STAGES.find((s) => s.id === candidate.stage);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back button */}
      <Link
        href={`/dashboard/jobs/${jobId}/candidates`}
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Back to candidates
      </Link>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">{candidate.name}</h1>
            <p className="text-slate-600">{candidate.currentRole}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium">
            <Award size={16} />
            {candidate.aiScore}% match
          </div>
        </div>

        {/* Contact info */}
        <div className="flex items-center gap-6 text-sm text-slate-600">
          <a href={`mailto:${candidate.email}`} className="flex items-center gap-2 hover:text-slate-900">
            <Mail size={16} />
            {candidate.email}
          </a>
          <a
            href={`https://${candidate.linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-slate-900"
          >
            <ExternalLink size={16} />
            LinkedIn
          </a>
        </div>
      </div>

      {/* Application details */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Application Details</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-slate-600 mb-1">Applied for</div>
            <div className="font-medium text-slate-900">{job.title}</div>
          </div>
          <div>
            <div className="text-sm text-slate-600 mb-1">Applied</div>
            <div className="font-medium text-slate-900 flex items-center gap-2">
              <Calendar size={16} className="text-slate-400" />
              {candidate.appliedDate}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-600 mb-1">Current stage</div>
            <div className="font-medium text-slate-900">{currentStage?.name || 'Unknown'}</div>
          </div>
        </div>
      </div>

      {/* Match reasons */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Why this candidate is a good fit</h2>
        <ul className="space-y-2">
          {candidate.matchReasons.map((reason, index) => (
            <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
              <span className="text-emerald-600 mt-0.5">•</span>
              {reason}
            </li>
          ))}
        </ul>
      </div>

      {/* Skills */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {candidate.skillMatch.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Experience & Education */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Briefcase size={18} />
            Experience
          </h2>
          <div className="space-y-3">
            <div>
              <div className="font-medium text-slate-900">{candidate.currentRole}</div>
              <div className="text-sm text-slate-600">{candidate.experience} of experience</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <GraduationCap size={18} />
            Education
          </h2>
          <div className="font-medium text-slate-900">{candidate.education}</div>
        </div>
      </div>
    </div>
  );
}
