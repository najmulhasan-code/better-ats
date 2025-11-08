'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { Plus, ExternalLink, Briefcase } from 'lucide-react';
import { CURRENT_COMPANY } from '@/lib/auth';
import { mockJobs } from '@/lib/mockData';
import JobCard from './components/JobCard';
import { jobStore } from '@/lib/jobStore';

export default function JobsPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'closed'>('all');
  const [newJobs, setNewJobs] = useState<any[]>([]);

  // Load jobs from localStorage on mount
  useEffect(() => {
    const stored = jobStore.getByCompany(CURRENT_COMPANY.slug);
    setNewJobs(stored);
  }, []);

  const handleStatusChange = (jobId: string, newStatus: string) => {
    jobStore.updateStatus(jobId, newStatus as 'active' | 'draft' | 'closed');
    // Reload jobs
    const stored = jobStore.getByCompany(CURRENT_COMPANY.slug);
    setNewJobs(stored);
  };

  // Merge mock jobs with new jobs from localStorage
  const mockCompanyJobs = mockJobs.filter((job) => job.companySlug === CURRENT_COMPANY.slug);
  const allJobs = [...newJobs, ...mockCompanyJobs];

  const filteredJobs = filter === 'all'
    ? allJobs
    : allJobs.filter(job => job.status?.toLowerCase() === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Jobs</h1>
        <div className="flex items-center gap-3">
          <Link
            href={`/jobs/${CURRENT_COMPANY.slug}`}
            target="_blank"
            className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <ExternalLink size={16} />
            Careers Page
          </Link>
          <Link
            href="/dashboard/jobs/new"
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Plus size={16} />
            Create Job
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-sm text-slate-600 mb-1">Active</div>
          <div className="text-2xl font-bold text-slate-900">
            {allJobs.filter(j => j.status?.toLowerCase() === 'active').length}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-sm text-slate-600 mb-1">Applications</div>
          <div className="text-2xl font-bold text-slate-900">
            {allJobs.reduce((acc, job) => acc + (job.applicants || 0), 0)}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-sm text-slate-600 mb-1">Draft</div>
          <div className="text-2xl font-bold text-slate-900">
            {allJobs.filter(j => j.status?.toLowerCase() === 'draft').length}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-sm text-slate-600 mb-1">Closed</div>
          <div className="text-2xl font-bold text-slate-900">
            {allJobs.filter(j => j.status?.toLowerCase() === 'closed').length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {(['all', 'active', 'draft', 'closed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-lg p-12 text-center">
          <Briefcase className="mx-auto text-slate-400 mb-4" size={48} />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">No jobs found</h2>
          <Link
            href="/dashboard/jobs/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium mt-4"
          >
            <Plus size={16} />
            Create Job
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              companySlug={CURRENT_COMPANY.slug}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
