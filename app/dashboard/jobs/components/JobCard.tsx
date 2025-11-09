'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, ExternalLink } from 'lucide-react';
import JobPreviewModal from './JobPreviewModal';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    description?: string;
    location?: string;
    type?: string;
    salary?: string;
    applicants?: number;
    posted?: string;
    status?: string;
  };
  companySlug: string;
  onStatusChange: (jobId: string, newStatus: string) => void;
}

export default function JobCard({ job, companySlug, onStatusChange }: JobCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    onStatusChange(job.id, e.target.value);
  };

  const handleDelete = () => {
    window.location.reload();
  };

  const getStatusColors = (status: string) => {
    const colors = {
      published: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      draft: 'bg-amber-50 text-amber-700 border-amber-200/60',
      closed: 'bg-slate-100 text-slate-600 border-slate-200/60',
    };
    return colors[status.toLowerCase() as keyof typeof colors] || colors.draft;
  };

  const handleCardClick = () => {
    // Only open modal if job is draft or closed
    if (job.status !== 'published') {
      setIsModalOpen(true);
    }
  };

  const isPublished = job.status === 'published';

  return (
    <>
    <div
      onClick={handleCardClick}
      className={`group bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl p-3.5 transition-all duration-300 hover:border-[#5371FE]/40 hover:shadow-lg hover:scale-[1.02] ${
        !isPublished ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Title & Metadata */}
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-semibold text-slate-900 mb-1.5 tracking-tight truncate">
            {job.title}
          </h3>
          <div className="flex items-center gap-2 text-[12px] text-slate-600 mb-1.5">
            <span>{job.location}</span>
            <span className="text-slate-300">•</span>
            <span>{job.type}</span>
            <span className="text-slate-300">•</span>
            <span>{job.salary}</span>
          </div>
          {job.description && (
            <p className="text-[12px] text-slate-500 line-clamp-1">
              {job.description}
            </p>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 text-[12px] text-slate-500 px-2.5 py-1 bg-slate-50 rounded-md">
            <Users size={12} strokeWidth={2} />
            <span>{job.applicants || 0}</span>
          </div>

          <select
            value={job.status || 'draft'}
            onChange={handleStatusChange}
            onClick={(e) => e.stopPropagation()}
            className={`px-2 py-1 text-[11px] font-semibold border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5371FE] cursor-pointer transition-all ${getStatusColors(job.status || 'draft')}`}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
          </select>

          <Link
            href={`/dashboard/jobs/${job.id}/candidates`}
            onClick={(e) => e.stopPropagation()}
            className="px-2.5 py-1 text-[12px] font-semibold text-[#5371FE] hover:bg-[#5371FE]/10 rounded-md transition-all"
          >
            Candidates
          </Link>

          {isPublished && (
            <Link
              href={`/jobs/${companySlug}/${job.id}`}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 text-slate-500 hover:text-[#5371FE] hover:bg-slate-100 rounded-md transition-all"
              title="View public page"
            >
              <ExternalLink size={14} strokeWidth={2} />
            </Link>
          )}
        </div>
      </div>
    </div>

    {/* Job Preview Modal for Draft/Closed Jobs */}
    <JobPreviewModal
      job={job}
      companySlug={companySlug}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onDelete={handleDelete}
    />
    </>
  );
}
