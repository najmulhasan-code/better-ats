'use client';

import { X, Edit, Trash2, MapPin, Briefcase, DollarSign, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import JobApplicationView from '@/app/components/job/JobApplicationView';

interface JobPreviewModalProps {
  job: any;
  companySlug: string;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export default function JobPreviewModal({ job, companySlug, isOpen, onClose, onDelete }: JobPreviewModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDelete();
        onClose();
      } else {
        alert('Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 modal-overlay-enter"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col modal-content-enter">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-slate-200/60">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-[20px] font-semibold text-slate-900 tracking-tight">
                  {job.title}
                </h2>
                <span className={`px-3 py-1.5 text-[13px] font-semibold rounded-lg ${
                  job.status === 'draft'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {job.status === 'draft' ? 'Draft Preview' : 'Closed Job Preview'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-slate-600 text-[13px]">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-slate-400" strokeWidth={2} />
                  <span className="font-medium">{job.location}</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-2">
                  <Briefcase size={14} className="text-slate-400" strokeWidth={2} />
                  <span className="font-medium">{job.type}</span>
                </div>
                {job.salary && (
                  <>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-2">
                      <DollarSign size={14} className="text-slate-400" strokeWidth={2} />
                      <span className="font-medium">{job.salary}</span>
                    </div>
                  </>
                )}
                {job.posted && (
                  <>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400" strokeWidth={2} />
                      <span className="font-medium">Posted {job.posted}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} strokeWidth={2.5} className="text-slate-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <JobApplicationView job={job} isPreview={true} />
          </div>

          {/* Footer Actions */}
          <div className="border-t border-slate-200/60 p-4 flex items-center gap-2.5 bg-slate-50/50">
            <Link
              href={`/dashboard/jobs/${job.id}/edit`}
              className="px-4 py-2 bg-[#5371FE] text-white rounded-lg hover:bg-[#5371FE]/90 transition-all font-semibold text-[13px] flex items-center gap-2"
              onClick={onClose}
            >
              <Edit size={14} strokeWidth={2.5} />
              Edit Job
            </Link>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all font-semibold text-[13px] flex items-center gap-2"
              >
                <Trash2 size={14} strokeWidth={2.5} />
                Delete
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-[13px] text-slate-700 font-medium">Delete this job?</p>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold text-[12px] disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-medium text-[12px]"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
