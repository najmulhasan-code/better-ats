'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Briefcase,
  Target,
  Activity,
  ArrowRight,
  Star,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CURRENT_COMPANY } from '@/lib/auth';
import { mockJobs, mockCandidates, PIPELINE_STAGES } from '@/lib/mockData';

export default function DashboardPage() {
  const companyJobs = mockJobs.filter((job) => job.companySlug === CURRENT_COMPANY.slug);
  const companyCandidates = mockCandidates.filter((c) => c.companySlug === CURRENT_COMPANY.slug);

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalApplications = companyCandidates.length;
    const avgAIScore =
      companyCandidates.reduce((sum, c) => sum + c.aiScore, 0) / companyCandidates.length || 0;
    const offersExtended = companyCandidates.filter((c) => c.stage === 'offer').length;
    const hired = companyCandidates.filter((c) => c.stage === 'hired').length;
    const offerAcceptanceRate = offersExtended > 0 ? (hired / offersExtended) * 100 : 0;

    // Calculate average time-to-hire (mock data for now)
    const avgTimeToHire = 18; // days

    return {
      totalJobs: companyJobs.length,
      totalCandidates: totalApplications,
      avgAIScore: Math.round(avgAIScore),
      avgTimeToHire,
      offerAcceptanceRate: Math.round(offerAcceptanceRate),
      activeApplications: companyCandidates.filter(
        (c) => !['hired', 'rejected'].includes(c.stage)
      ).length,
    };
  }, [companyJobs, companyCandidates]);

  // Applications over time (last 30 days)
  const applicationsOverTime = useMemo(() => {
    // Stable simulated data pattern
    const pattern = [2, 3, 1, 4, 3, 5, 2, 3, 4, 1, 2, 5, 3, 4, 2, 3, 5, 4, 3, 2, 4, 3, 5, 2, 4, 3, 2, 5, 3, 4];
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      data.push({
        date: dayLabel,
        applications: pattern[29 - i],
      });
    }
    return data;
  }, []);

  // Pipeline breakdown
  const pipelineData = useMemo(() => {
    return PIPELINE_STAGES.filter((stage) => stage.id !== 'rejected').map((stage) => ({
      name: stage.name,
      count: companyCandidates.filter((c) => c.stage === stage.id).length,
      color:
        stage.id === 'applied'
          ? '#64748b'
          : stage.id === 'screening'
            ? '#3b82f6'
            : stage.id === 'interview'
              ? '#8b5cf6'
              : stage.id === 'offer'
                ? '#10b981'
                : '#059669',
    }));
  }, [companyCandidates]);

  // Recent activity
  const recentActivity = useMemo(() => {
    return companyCandidates
      .sort((a, b) => b.appliedDateTimestamp - a.appliedDateTimestamp)
      .slice(0, 5)
      .map((candidate) => ({
        type: 'application',
        candidate: candidate.name,
        job: candidate.jobTitle,
        score: candidate.aiScore,
        time: candidate.appliedDate,
      }));
  }, [companyCandidates]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Dashboard</h1>
        <p className="text-sm text-slate-600">
          Overview of your recruiting activity
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Jobs */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Briefcase className="text-blue-600" size={20} />
            </div>
            <h3 className="text-sm font-medium text-slate-600">Active Jobs</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900">{metrics.totalJobs}</p>
        </div>

        {/* Total Candidates */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="text-purple-600" size={20} />
            </div>
            <h3 className="text-sm font-medium text-slate-600">Total Candidates</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900">{metrics.totalCandidates}</p>
        </div>

        {/* Active Applications */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Activity className="text-emerald-600" size={20} />
            </div>
            <h3 className="text-sm font-medium text-slate-600">Active Applications</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900">{metrics.activeApplications}</p>
        </div>

        {/* Avg AI Match Score */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Star className="text-amber-600" size={20} />
            </div>
            <h3 className="text-sm font-medium text-slate-600">Avg AI Match</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900">{metrics.avgAIScore}%</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Applications Over Time */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">Applications Over Time</h2>
            <p className="text-xs text-slate-500">Last 30 days</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={applicationsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="applications"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline Breakdown */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">Pipeline Breakdown</h2>
            <p className="text-xs text-slate-500">Candidates by stage</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={pipelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {pipelineData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Recent Applications</h2>
          <Link
            href="/dashboard/candidates"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, idx) => (
              <div key={idx} className="px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                      <Users className="text-slate-600" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900 text-sm truncate">{activity.candidate}</p>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded">
                          {activity.score}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {activity.job} • {activity.time}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/candidates"
                    className="text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="px-5 py-8 text-center">
              <Activity size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/jobs/new"
          className="bg-white rounded-lg border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Briefcase className="text-blue-600" size={18} />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Create New Job</h3>
            <ArrowRight className="ml-auto text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" size={16} />
          </div>
          <p className="text-xs text-slate-500">
            Post a new position
          </p>
        </Link>

        <Link
          href="/dashboard/candidates"
          className="bg-white rounded-lg border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="text-purple-600" size={18} />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">View Candidates</h3>
            <ArrowRight className="ml-auto text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" size={16} />
          </div>
          <p className="text-xs text-slate-500">Browse {metrics.totalCandidates} applications</p>
        </Link>

        <Link
          href="/dashboard/jobs"
          className="bg-white rounded-lg border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Target className="text-emerald-600" size={18} />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Manage Jobs</h3>
            <ArrowRight className="ml-auto text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" size={16} />
          </div>
          <p className="text-xs text-slate-500">Track job postings</p>
        </Link>
      </div>
    </div>
  );
}
