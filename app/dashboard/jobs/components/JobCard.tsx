'use client';

import Link from 'next/link';
import { Users, ExternalLink } from 'lucide-react';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    location: string;
    type: string;
    salary: string;
    applicants?: number;
    posted: string;
    status?: string;
  };
  companySlug: string;
  onStatusChange: (jobId: string, newStatus: string) => void;
}

export default function JobCard({ job, companySlug, onStatusChange }: JobCardProps) {
  const handleStatusChange = (newStatus: string) => {
    onStatusChange(job.id, newStatus);
  };

  const getStatusColors = (status: string) => {
    const colors = {
      active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      draft: 'bg-amber-50 text-amber-700 border-amber-200',
      closed: 'bg-slate-100 text-slate-500 border-slate-200',
    };
    return colors[status.toLowerCase() as keyof typeof colors] || colors.active;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-slate-900 truncate">
              {job.title}
            </h3>
            <select
              value={job.status || 'active'}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`px-2 py-1 text-xs font-medium border rounded focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer ${getStatusColors(job.status || 'active')}`}
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
            <span>{job.location}</span>
            <span>•</span>
            <span>{job.type}</span>
            <span>•</span>
            <span>{job.salary}</span>
            <span>•</span>
            <span>{job.applicants || 0} applicants</span>
          </div>

          <p className="text-sm text-slate-600 line-clamp-2">
            {job.description}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/dashboard/jobs/${job.id}/candidates`}
            className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <Users size={16} />
            Candidates
          </Link>
          <Link
            href={`/jobs/${companySlug}/${job.id}`}
            target="_blank"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            title="View public page"
          >
            <ExternalLink size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
