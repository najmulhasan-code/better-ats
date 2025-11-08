'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import { mockJobs, mockCandidates, PIPELINE_STAGES } from '@/lib/mockData';
import { CURRENT_COMPANY } from '@/lib/auth';
import { candidateStore } from '@/lib/candidateStore';
import { jobStore } from '@/lib/jobStore';

interface CandidatesPageProps {
  params: Promise<{
    jobId: string;
  }>;
}

export default function JobCandidatesPage({ params }: CandidatesPageProps) {
  const { jobId } = use(params);
  const [newCandidates, setNewCandidates] = useState<any[]>([]);

  // Load new candidates from localStorage on mount
  useEffect(() => {
    const stored = candidateStore.getByJob(jobId, CURRENT_COMPANY.slug);
    setNewCandidates(stored);
  }, [jobId]);

  const handleStageChange = (candidateId: string, newStage: string) => {
    candidateStore.updateStage(candidateId, newStage);
    // Reload candidates
    const stored = candidateStore.getByJob(jobId, CURRENT_COMPANY.slug);
    setNewCandidates(stored);
  };

  // Check both localStorage and mock jobs
  const storedJob = jobStore.getById(jobId);
  const mockJob = mockJobs.find((j) => j.id === jobId && j.companySlug === CURRENT_COMPANY.slug);
  const job = storedJob || mockJob;

  // Merge mock candidates with new ones from localStorage
  const mockCandidatesForJob = mockCandidates.filter(
    (c) => c.jobId === jobId && c.companySlug === CURRENT_COMPANY.slug
  );
  const candidates = [...newCandidates, ...mockCandidatesForJob];

  if (!job) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Job not found</h1>
        <Link
          href="/dashboard/jobs"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          Back to jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-3"
        >
          <ArrowLeft size={16} />
          Back to jobs
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
        <p className="text-sm text-slate-600">
          {job.location} • {job.type} • {candidates.length} candidates
        </p>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-5 gap-3">
        {PIPELINE_STAGES.filter(s => s.id !== 'rejected').map((stage) => {
          const count = candidates.filter(c => c.stage === stage.id).length;
          return (
            <div key={stage.id} className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="text-xs text-slate-600 mb-1">{stage.name}</div>
              <div className="text-2xl font-bold text-slate-900">{count}</div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search candidates..."
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
        />
      </div>

      {/* Candidates List */}
      {candidates.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
          <p className="text-slate-600">No candidates yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {candidate.name}
                    </h3>
                    <span className="px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                      {candidate.aiScore}% match
                    </span>
                  </div>

                  <div className="text-sm text-slate-600 mb-3">
                    {candidate.currentRole} • {candidate.experience}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {candidate.skillMatch.slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <select
                    value={candidate.stage}
                    onChange={(e) => handleStageChange(candidate.id, e.target.value)}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    {PIPELINE_STAGES.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.name}
                      </option>
                    ))}
                  </select>
                  <Link
                    href={`/dashboard/jobs/${jobId}/candidates/${candidate.id}`}
                    className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
