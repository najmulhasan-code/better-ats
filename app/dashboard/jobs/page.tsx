'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { Plus, ExternalLink, Briefcase } from 'lucide-react';
import JobCard from './components/JobCard';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  status: string;
  applicants?: number;
}

export default function JobsPage() {
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'closed'>('all');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companySlug, setCompanySlug] = useState<string>('');

  // Fetch jobs and user from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching jobs and user...');

        // Fetch user info for company slug
        const userRes = await fetch('/api/auth/user');
        if (userRes.ok) {
          const userData = await userRes.json();
          setCompanySlug(userData.user?.company?.slug || '');
        }

        // Fetch jobs
        const jobsRes = await fetch('/api/dashboard/jobs');
        console.log('Jobs response status:', jobsRes.status);

        if (jobsRes.ok) {
          const data = await jobsRes.json();
          console.log('Jobs data:', data);
          setJobs(data.jobs || []);
        } else {
          const error = await jobsRes.json();
          console.error('Jobs API error:', error);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update local state
        setJobs(jobs.map(job =>
          job.id === jobId ? { ...job, status: newStatus } : job
        ));
      } else {
        alert('Failed to update job status');
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      alert('Failed to update job status');
    }
  };

  const filteredJobs = useMemo(() => {
    if (filter === 'all') return jobs;
    return jobs.filter(job => job.status?.toLowerCase() === filter);
  }, [jobs, filter]);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-semibold text-slate-900 mb-2 tracking-tight">Jobs</h1>
          <p className="text-[15px] text-slate-600">Manage your job postings</p>
        </div>
        <div className="flex items-center gap-3">
          {companySlug && (
            <Link
              href={`/jobs/${companySlug}`}
              target="_blank"
              className="px-4 py-2.5 border border-slate-200/80 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300/80 transition-all text-[14px] font-medium flex items-center gap-2"
            >
              <ExternalLink size={16} strokeWidth={2} />
              Careers Page
            </Link>
          )}
          <Link
            href="/dashboard/jobs/new"
            className="px-5 py-2.5 bg-gradient-to-r from-[#5371FE] to-[#7C3AED] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 text-[14px] font-bold flex items-center gap-2 shadow-lg shadow-[#5371FE]/30"
          >
            <Plus size={16} strokeWidth={2.5} />
            Create Job
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-5">
        <div className="relative bg-gradient-to-br from-white to-emerald-50/50 border border-emerald-100/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-xl"></div>
          <div className="relative">
            <div className="text-[12px] text-emerald-700 mb-2 font-bold uppercase tracking-wide">Published</div>
            <div className="text-[36px] font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent tracking-tight">
              {jobs.filter(j => j.status?.toLowerCase() === 'published').length}
            </div>
          </div>
        </div>
        <div className="relative bg-gradient-to-br from-white to-blue-50/50 border border-blue-100/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-xl"></div>
          <div className="relative">
            <div className="text-[12px] text-blue-700 mb-2 font-bold uppercase tracking-wide">Applications</div>
            <div className="text-[36px] font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent tracking-tight">
              {jobs.reduce((acc, job) => acc + (job.applicants || 0), 0)}
            </div>
          </div>
        </div>
        <div className="relative bg-gradient-to-br from-white to-amber-50/50 border border-amber-100/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-xl"></div>
          <div className="relative">
            <div className="text-[12px] text-amber-700 mb-2 font-bold uppercase tracking-wide">Draft</div>
            <div className="text-[36px] font-bold bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent tracking-tight">
              {jobs.filter(j => j.status?.toLowerCase() === 'draft').length}
            </div>
          </div>
        </div>
        <div className="relative bg-gradient-to-br from-white to-slate-100/50 border border-slate-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-slate-500/10 to-transparent rounded-full blur-xl"></div>
          <div className="relative">
            <div className="text-[12px] text-slate-700 mb-2 font-bold uppercase tracking-wide">Closed</div>
            <div className="text-[36px] font-bold bg-gradient-to-r from-slate-600 to-slate-800 bg-clip-text text-transparent tracking-tight">
              {jobs.filter(j => j.status?.toLowerCase() === 'closed').length}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {(['all', 'published', 'draft', 'closed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-300 ${
              filter === status
                ? 'bg-gradient-to-r from-[#5371FE] to-[#7C3AED] text-white shadow-lg shadow-[#5371FE]/30 scale-105'
                : 'bg-white/80 backdrop-blur-sm border border-slate-200/80 text-slate-700 hover:bg-white hover:border-[#5371FE]/30 hover:shadow-md'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="relative bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 border border-slate-200/60 rounded-3xl p-20 text-center shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full blur-3xl"></div>
          <div className="relative">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="text-slate-400" size={40} strokeWidth={1.5} />
            </div>
            <h2 className="text-[28px] font-semibold text-slate-900 mb-3 tracking-tight">
              {filter === 'all' ? 'No jobs posted yet' : `No ${filter} jobs`}
            </h2>
            <p className="text-[16px] text-slate-600 leading-relaxed mb-8">
              {filter === 'all'
                ? 'Start building your team by creating your first job posting. Attract top talent and manage applications all in one place.'
                : `You don't have any jobs with "${filter}" status. Try a different filter or create a new job.`}
            </p>
            {filter === 'all' && (
              <Link
                href="/dashboard/jobs/new"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-[#5371FE] to-[#7C3AED] text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-[15px] font-bold shadow-lg shadow-[#5371FE]/30"
              >
                <Plus size={18} strokeWidth={2.5} />
                Create Your First Job
              </Link>
            )}
          </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-3">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              companySlug={companySlug}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
