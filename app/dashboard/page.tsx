/**
 * Dashboard Overview
 * Clean, macOS-style dashboard with real-time metrics
 */

'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Users,
  Briefcase,
  Target,
  ArrowRight,
} from 'lucide-react';

const PIPELINE_STAGES = [
  { id: 'applied', name: 'Applied', color: '#64748b' },
  { id: 'screening', name: 'Screening', color: '#3b82f6' },
  { id: 'interview', name: 'Interview', color: '#8b5cf6' },
  { id: 'offer', name: 'Offer', color: '#10b981' },
  { id: 'hired', name: 'Hired', color: '#059669' },
];

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  status: string;
  postedTimestamp: string | null;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  jobId: string;
  jobTitle: string;
  stage: string;
  aiScore: number;
  appliedDateTimestamp: string;
}

export default function DashboardPage() {
  const [companyJobs, setCompanyJobs] = useState<Job[]>([]);
  const [companyCandidates, setCompanyCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('Fetching dashboard stats...');
        const response = await fetch('/api/dashboard/stats');
        console.log('Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Dashboard data:', data);
          setCompanyJobs(data.jobs || []);
          setCompanyCandidates(data.candidates || []);
        } else {
          const error = await response.json();
          console.error('API error:', error);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const metrics = useMemo(() => {
    const activeJobs = companyJobs.filter(j => j.status === 'published').length;
    const totalCandidates = companyCandidates.length;
    const thisWeekCandidates = companyCandidates.filter(c => {
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      return Number(c.appliedDateTimestamp) >= weekAgo;
    }).length;

    const inReview = companyCandidates.filter(c => ['screening', 'interview'].includes(c.stage)).length;
    const offers = companyCandidates.filter(c => c.stage === 'offer').length;
    const hired = companyCandidates.filter(c => c.stage === 'hired').length;

    const avgScore = companyCandidates.length > 0
      ? Math.round(companyCandidates.reduce((sum, c) => sum + c.aiScore, 0) / companyCandidates.length)
      : 0;

    return {
      activeJobs,
      totalJobs: companyJobs.length,
      totalCandidates,
      thisWeekCandidates,
      inReview,
      offers,
      hired,
      avgScore,
    };
  }, [companyJobs, companyCandidates]);

  const pipelineStats = useMemo(() => {
    return PIPELINE_STAGES.map(stage => ({
      ...stage,
      count: companyCandidates.filter(c => c.stage === stage.id).length,
      percentage: companyCandidates.length > 0
        ? Math.round((companyCandidates.filter(c => c.stage === stage.id).length / companyCandidates.length) * 100)
        : 0,
    }));
  }, [companyCandidates]);

  const recentApplications = useMemo(() => {
    return companyCandidates
      .sort((a, b) => Number(b.appliedDateTimestamp) - Number(a.appliedDateTimestamp))
      .slice(0, 10);
  }, [companyCandidates]);

  const topJobs = useMemo(() => {
    const jobCounts = companyJobs.map(job => ({
      ...job,
      applicantCount: companyCandidates.filter(c => c.jobId === job.id).length,
    }));
    return jobCounts.sort((a, b) => b.applicantCount - a.applicantCount).slice(0, 5);
  }, [companyJobs, companyCandidates]);

  // Show dashboard immediately, even while loading
  // This eliminates the annoying loading screen

  return (
    <div className="space-y-1">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-1 py-4">
        <h1 className="text-[28px] font-semibold text-slate-900">Overview</h1>
        <Link
          href="/dashboard/jobs/new"
          className="px-4 py-2 bg-[#5371FE] text-white text-[13px] font-medium rounded-lg hover:bg-[#4461ED] active:bg-[#3551DC] transition-colors"
        >
          Create Job
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="bg-white border-y border-slate-200">
        <div className="grid grid-cols-4 divide-x divide-slate-200">
          <div className="px-6 py-5">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Active Jobs</div>
            <div className="flex items-baseline gap-2">
              <div className="text-[28px] font-semibold text-slate-900">{metrics.activeJobs}</div>
              <div className="text-[13px] text-slate-500">of {metrics.totalJobs}</div>
            </div>
          </div>
          <div className="px-6 py-5">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Total Candidates</div>
            <div className="flex items-baseline gap-2">
              <div className="text-[28px] font-semibold text-slate-900">{metrics.totalCandidates}</div>
              <div className="flex items-center gap-1 text-[13px] text-green-600 font-medium">
                <TrendingUp size={13} />
                {metrics.thisWeekCandidates}
              </div>
            </div>
          </div>
          <div className="px-6 py-5">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">In Review</div>
            <div className="flex items-baseline gap-2">
              <div className="text-[28px] font-semibold text-slate-900">{metrics.inReview}</div>
              <div className="text-[13px] text-slate-500">{metrics.offers} offers</div>
            </div>
          </div>
          <div className="px-6 py-5">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Match Score</div>
            <div className="flex items-baseline gap-2">
              <div className="text-[28px] font-semibold text-slate-900">{metrics.avgScore}%</div>
              <div className="text-[13px] text-slate-500">{metrics.hired} hired</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <div className="bg-white border-y border-slate-200 mt-1">
        <div className="px-6 py-3 border-b border-slate-200">
          <h2 className="text-[13px] font-semibold text-slate-900">Pipeline</h2>
        </div>
        <div className="px-6 py-5">
          <div className="space-y-3.5">
            {pipelineStats.map((stage) => (
              <div key={stage.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                    <span className="text-[13px] font-medium text-slate-900">{stage.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] text-slate-500">{stage.percentage}%</span>
                    <span className="text-[14px] font-semibold text-slate-900 w-10 text-right">{stage.count}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-sm overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{ width: `${stage.percentage}%`, backgroundColor: stage.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-2 gap-1 mt-1">
        {/* Recent Applications */}
        <div className="bg-white border border-slate-200">
          <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-slate-900">Recent Applications</h2>
            <Link
              href="/dashboard/candidates"
              className="text-[12px] font-medium text-[#5371FE] hover:text-[#4461ED] flex items-center gap-1"
            >
              View All
              <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentApplications.length > 0 ? (
              recentApplications.slice(0, 8).map((candidate) => (
                <div key={candidate.id} className="px-6 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-medium text-slate-900 truncate">{candidate.name}</p>
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded">
                          {candidate.aiScore}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{candidate.jobTitle}</p>
                    </div>
                    <div className="text-[11px] text-slate-400 ml-3">
                      {new Date(Number(candidate.appliedDateTimestamp)).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <Users size={28} className="mx-auto text-slate-300 mb-2" />
                <p className="text-[12px] text-slate-500">No applications</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Jobs */}
        <div className="bg-white border border-slate-200">
          <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-slate-900">Top Jobs</h2>
            <Link
              href="/dashboard/jobs"
              className="text-[12px] font-medium text-[#5371FE] hover:text-[#4461ED] flex items-center gap-1"
            >
              View All
              <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {topJobs.length > 0 ? (
              topJobs.slice(0, 8).map((job, index) => (
                <div key={job.id} className="px-6 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="w-6 h-6 bg-slate-100 text-slate-600 rounded flex items-center justify-center text-[11px] font-semibold shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-slate-900 truncate">{job.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-slate-500 truncate">{job.department}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] text-slate-500 truncate">{job.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-[14px] font-semibold text-slate-900 ml-3">
                      {job.applicantCount}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <Briefcase size={28} className="mx-auto text-slate-300 mb-2" />
                <p className="text-[12px] text-slate-500">No jobs posted</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-1 mt-1">
        <Link
          href="/dashboard/jobs"
          className="bg-white border border-slate-200 px-5 py-4 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Briefcase size={18} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-[12px] font-medium text-slate-900">Manage Jobs</div>
              <div className="text-[11px] text-slate-500">{metrics.totalJobs} positions</div>
            </div>
            <ArrowRight size={14} className="text-slate-300" />
          </div>
        </Link>

        <Link
          href="/dashboard/candidates"
          className="bg-white border border-slate-200 px-5 py-4 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users size={18} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="text-[12px] font-medium text-slate-900">All Candidates</div>
              <div className="text-[11px] text-slate-500">{metrics.totalCandidates} applications</div>
            </div>
            <ArrowRight size={14} className="text-slate-300" />
          </div>
        </Link>

        <Link
          href="/dashboard/settings"
          className="bg-white border border-slate-200 px-5 py-4 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Target size={18} className="text-emerald-600" />
            </div>
            <div className="flex-1">
              <div className="text-[12px] font-medium text-slate-900">Settings</div>
              <div className="text-[11px] text-slate-500">Customize ATS</div>
            </div>
            <ArrowRight size={14} className="text-slate-300" />
          </div>
        </Link>
      </div>
    </div>
  );
}
