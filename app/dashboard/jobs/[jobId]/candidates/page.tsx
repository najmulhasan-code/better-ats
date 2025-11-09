'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import { useCurrentCompany } from '@/lib/auth/hooks';

// Pipeline stages constant
const PIPELINE_STAGES = [
  { id: 'applied', name: 'New Applicants', color: 'slate' },
  { id: 'screening', name: 'Screening', color: 'blue' },
  { id: 'interview', name: 'Interview', color: 'purple' },
  { id: 'offer', name: 'Offer', color: 'green' },
  { id: 'hired', name: 'Hired', color: 'emerald' },
  { id: 'rejected', name: 'Rejected', color: 'red' },
];

interface CandidatesPageProps {
  params: Promise<{
    jobId: string;
  }>;
}

export default function JobCandidatesPage({ params }: CandidatesPageProps) {
  const { jobId } = use(params);
  const { company, loading } = useCurrentCompany();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [job, setJob] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch job and candidates from API
  useEffect(() => {
    async function fetchData() {
      if (!company?.slug) return;

      setDataLoading(true);
      try {
        // Fetch job details
        const jobResponse = await fetch(`/api/jobs/${jobId}`);
        if (jobResponse.ok) {
          const jobData = await jobResponse.json();
          setJob(jobData.job);
        }

        // Fetch candidates for this job
        const candidatesResponse = await fetch(`/api/dashboard/jobs/${jobId}/candidates`);
        if (candidatesResponse.ok) {
          const candidatesData = await candidatesResponse.json();
          setCandidates(candidatesData.candidates || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setDataLoading(false);
      }
    }

    fetchData();
  }, [jobId, company?.slug]);

  const handleStageChange = async (candidateId: string, newStage: string) => {
    if (!company?.slug) return;

    // Optimistically update UI
    setCandidates(prev =>
      prev.map(c => c.id === candidateId ? { ...c, stage: newStage } : c)
    );

    try {
      // Update candidate stage in database
      const response = await fetch(`/api/dashboard/candidates/${candidateId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stage: newStage }),
      });

      if (!response.ok) {
        throw new Error('Failed to update candidate stage');
      }
    } catch (error) {
      console.error('Error updating candidate stage:', error);
      // Revert optimistic update on error
      setCandidates(prev =>
        prev.map(c => c.id === candidateId ? { ...c, stage: c.stage } : c)
      );
      alert('Failed to update candidate stage. Please try again.');
    }
  };

  if (loading || dataLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="text-slate-600">Loading...</div></div>;
  }

  if (!company) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="text-slate-600">Please sign in to view candidates</div></div>;
  }

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
      <div className="grid grid-cols-6 gap-3">
        {PIPELINE_STAGES.map((stage) => {
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
                    {candidate.skillMatch.slice(0, 5).map((skill: string) => (
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
