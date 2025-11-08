'use client';

import { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Archive,
  XCircle,
  RotateCcw,
  Trash2,
  Lock,
  Unlock,
} from 'lucide-react';

interface JobActionsMenuProps {
  jobId: string;
  jobTitle: string;
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
}

export default function JobActionsMenu({
  jobId,
  jobTitle,
  currentStatus,
  onStatusChange,
}: JobActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: string;
    title: string;
    message: string;
    actionLabel: string;
    newStatus?: string;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (action: {
    type: string;
    title: string;
    message: string;
    actionLabel: string;
    newStatus?: string;
  }) => {
    setConfirmAction(action);
    setShowConfirmModal(true);
    setIsOpen(false);
  };

  const confirmStatusChange = () => {
    if (confirmAction?.newStatus) {
      onStatusChange(confirmAction.newStatus);
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group/btn p-3.5 border-2 border-slate-300 bg-white text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <MoreVertical
            size={18}
            className={`transition-transform duration-200 ${
              isOpen ? 'rotate-90' : 'group-hover/btn:rotate-90'
            }`}
            strokeWidth={2.5}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
            {/* Close Job */}
            {currentStatus === 'active' && (
              <button
                onClick={() =>
                  handleAction({
                    type: 'close',
                    title: 'Close Job Posting',
                    message: 'This will stop accepting new applications. You can reopen it later.',
                    actionLabel: 'Close Job',
                    newStatus: 'closed',
                  })
                }
                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100"
              >
                <Lock size={16} strokeWidth={2.5} className="text-slate-600" />
                <div>
                  <div className="font-semibold text-slate-900 text-sm">Close Job</div>
                  <div className="text-xs text-slate-500">Stop accepting applications</div>
                </div>
              </button>
            )}

            {/* Reopen Job */}
            {currentStatus === 'closed' && (
              <button
                onClick={() =>
                  handleAction({
                    type: 'reopen',
                    title: 'Reopen Job Posting',
                    message: 'This will make the job active and start accepting applications again.',
                    actionLabel: 'Reopen Job',
                    newStatus: 'active',
                  })
                }
                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100"
              >
                <Unlock size={16} strokeWidth={2.5} className="text-emerald-600" />
                <div>
                  <div className="font-semibold text-slate-900 text-sm">Reopen Job</div>
                  <div className="text-xs text-slate-500">Start accepting applications</div>
                </div>
              </button>
            )}

            {/* Archive Job */}
            {currentStatus !== 'archived' && (
              <button
                onClick={() =>
                  handleAction({
                    type: 'archive',
                    title: 'Archive Job Posting',
                    message:
                      'This will move the job to archived. All candidate data will be preserved.',
                    actionLabel: 'Archive Job',
                    newStatus: 'archived',
                  })
                }
                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100"
              >
                <Archive size={16} strokeWidth={2.5} className="text-slate-600" />
                <div>
                  <div className="font-semibold text-slate-900 text-sm">Archive Job</div>
                  <div className="text-xs text-slate-500">Move to archived</div>
                </div>
              </button>
            )}

            {/* Unarchive Job */}
            {currentStatus === 'archived' && (
              <button
                onClick={() =>
                  handleAction({
                    type: 'unarchive',
                    title: 'Unarchive Job Posting',
                    message: 'This will restore the job to closed status.',
                    actionLabel: 'Unarchive Job',
                    newStatus: 'closed',
                  })
                }
                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100"
              >
                <RotateCcw size={16} strokeWidth={2.5} className="text-emerald-600" />
                <div>
                  <div className="font-semibold text-slate-900 text-sm">Unarchive Job</div>
                  <div className="text-xs text-slate-500">Restore from archive</div>
                </div>
              </button>
            )}

            {/* Delete Job */}
            <button
              onClick={() =>
                handleAction({
                  type: 'delete',
                  title: 'Delete Job Posting',
                  message:
                    'This action cannot be undone. All candidate data will be permanently deleted.',
                  actionLabel: 'Delete Forever',
                  newStatus: 'deleted',
                })
              }
              className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-red-50 transition-colors"
            >
              <Trash2 size={16} strokeWidth={2.5} className="text-red-600" />
              <div>
                <div className="font-semibold text-red-600 text-sm">Delete Job</div>
                <div className="text-xs text-red-500">Permanent deletion</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-slate-200">
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`p-3 rounded-xl ${
                  confirmAction.type === 'delete'
                    ? 'bg-red-100'
                    : confirmAction.type === 'archive'
                    ? 'bg-slate-100'
                    : 'bg-blue-100'
                }`}
              >
                {confirmAction.type === 'delete' ? (
                  <Trash2
                    size={24}
                    strokeWidth={2.5}
                    className="text-red-600"
                  />
                ) : confirmAction.type === 'archive' ? (
                  <Archive
                    size={24}
                    strokeWidth={2.5}
                    className="text-slate-600"
                  />
                ) : confirmAction.type === 'close' ? (
                  <Lock
                    size={24}
                    strokeWidth={2.5}
                    className="text-blue-600"
                  />
                ) : (
                  <Unlock
                    size={24}
                    strokeWidth={2.5}
                    className="text-emerald-600"
                  />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {confirmAction.title}
                </h3>
                <p className="text-slate-600 text-sm">{confirmAction.message}</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-6 border-2 border-slate-200">
              <p className="text-sm font-semibold text-slate-900">{jobTitle}</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                }}
                className="flex-1 px-4 py-2.5 border-2 border-slate-300 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className={`flex-1 px-4 py-2.5 rounded-xl transition-colors font-semibold ${
                  confirmAction.type === 'delete'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {confirmAction.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
