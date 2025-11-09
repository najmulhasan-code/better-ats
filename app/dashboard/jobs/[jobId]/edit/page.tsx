'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Save,
  Plus,
  X,
  MapPin,
  Briefcase,
  DollarSign,
  Building2,
  GripVertical,
  Check,
  Loader2,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import { COMPANY_SETTINGS } from '@/lib/companySettings';
import { useCurrentCompany } from '@/lib/auth/hooks';
import JobApplicationView from '@/app/components/job/JobApplicationView';

export default function EditJobPage({ params }: { params: Promise<{ jobId: string }> }) {
  const router = useRouter();
  const { company, loading: companyLoading } = useCurrentCompany();
  const [jobId, setJobId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Job basic info
  const [jobData, setJobData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'Full-time',
    salary: '',
    description: '',
    status: 'draft',
  });

  // Job details
  const [responsibilities, setResponsibilities] = useState<string[]>(['']);
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [niceToHave, setNiceToHave] = useState<string[]>(['']);

  useEffect(() => {
    params.then(async (p) => {
      setJobId(p.jobId);
      await fetchJob(p.jobId);
    });
  }, [params]);

  const fetchJob = async (id: string) => {
    try {
      const response = await fetch(`/api/jobs/${id}`);
      if (!response.ok) throw new Error('Failed to fetch job');

      const data = await response.json();
      const job = data.job;

      setJobData({
        title: job.title || '',
        department: job.department || '',
        location: job.location || '',
        type: job.type || 'Full-time',
        salary: job.salary || '',
        description: job.description || '',
        status: job.status || 'draft',
      });

      setResponsibilities(job.responsibilities && job.responsibilities.length > 0 ? job.responsibilities : ['']);
      setRequirements(job.requirements && job.requirements.length > 0 ? job.requirements : ['']);
      setNiceToHave(job.niceToHave && job.niceToHave.length > 0 ? job.niceToHave : ['']);

      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching job:', error);
      alert('Failed to load job details');
      router.push('/dashboard/jobs');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setJobData({ ...jobData, [field]: value });
  };

  const handleListAdd = (
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter([...list, '']);
  };

  const handleListRemove = (
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    if (list.length > 1) {
      setter(list.filter((_, i) => i !== index));
    }
  };

  const handleListChange = (
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    const newList = [...list];
    newList[index] = value;
    setter(newList);
  };

  // Create preview job object
  const previewJob = useMemo(() => ({
    id: jobId,
    title: jobData.title,
    department: jobData.department,
    location: jobData.location,
    type: jobData.type,
    salary: jobData.salary,
    description: jobData.description,
    fullDescription: jobData.description,
    responsibilities: responsibilities.filter((r) => r.trim()),
    requirements: requirements.filter((r) => r.trim()),
    niceToHave: niceToHave.filter((n) => n.trim()),
    company: company,
    status: jobData.status,
  }), [jobData, responsibilities, requirements, niceToHave, company, jobId]);

  const handleSaveJob = async (status?: string) => {
    if (!jobData.title || !jobData.department || !jobData.location) {
      alert('Please fill in all required fields');
      return;
    }

    if (!company) {
      alert('Company information not found');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: jobData.title,
          department: jobData.department,
          location: jobData.location,
          type: jobData.type,
          salary: jobData.salary || null,
          description: jobData.description || null,
          fullDescription: jobData.description || null,
          responsibilities: responsibilities.filter((r) => r.trim()),
          requirements: requirements.filter((r) => r.trim()),
          niceToHave: niceToHave.filter((n) => n.trim()),
          status: status || jobData.status,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update job');
      }

      router.push('/dashboard/jobs');
    } catch (error: any) {
      console.error('Error updating job:', error);
      alert(error.message || 'Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  if (loading || companyLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-3" />
          <p className="text-[15px] text-slate-600 font-medium">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="text-slate-600">Please sign in to edit jobs</div></div>;
  }

  return (
    <div className="-m-8">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 backdrop-blur-sm bg-white/95">
        <div className="px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/jobs"
                className="p-2.5 hover:bg-slate-100 rounded-xl transition-all hover:scale-105"
              >
                <ArrowLeft size={20} className="text-slate-700" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Job Posting</h1>
                <p className="text-sm text-slate-600 mt-0.5">
                  Update your job posting and application form
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2 font-medium text-sm"
              >
                {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                {showPreview ? 'Hide' : 'Show'} Preview
              </button>
              <button
                onClick={() => handleSaveJob('draft')}
                disabled={saving}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2 font-medium text-sm disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save as Draft'}
              </button>
              <button
                onClick={() => handleSaveJob('published')}
                disabled={saving}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2 font-medium text-sm disabled:opacity-50"
              >
                <Check size={16} />
                {saving ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 p-8 min-h-screen">
        <div className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-8 max-w-[1600px] mx-auto`}>
          {/* Form Section */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Building2 size={20} className="text-slate-700" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Job Information</h2>
                  <p className="text-sm text-slate-600">Basic details about the position</p>
                </div>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2.5">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={jobData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2.5">
                      Department *
                    </label>
                    <select
                      value={jobData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-white text-slate-900"
                    >
                      <option value="">Select department</option>
                      {COMPANY_SETTINGS.departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2.5">
                      Location *
                    </label>
                    <select
                      value={jobData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-white text-slate-900"
                    >
                      <option value="">Select location</option>
                      {COMPANY_SETTINGS.locations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2.5">
                      Employment Type *
                    </label>
                    <select
                      value={jobData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-white text-slate-900"
                    >
                      {COMPANY_SETTINGS.jobTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2.5">
                      Salary Range
                    </label>
                    <input
                      type="text"
                      value={jobData.salary}
                      onChange={(e) => handleInputChange('salary', e.target.value)}
                      placeholder="e.g. $120k - $180k"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Job Description *</h2>
                  <p className="text-sm text-slate-600">Describe the role and team</p>
                </div>
              </div>
              <textarea
                value={jobData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                placeholder="Write a compelling description of the role and what makes it exciting..."
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none transition-all"
              />
            </div>

            {/* Responsibilities */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Responsibilities *</h2>
                  <p className="text-sm text-slate-600">What will they be doing?</p>
                </div>
              </div>
              <div className="space-y-3">
                {responsibilities.map((resp, index) => (
                  <div key={index} className="flex items-center gap-3 group">
                    <div className="cursor-move pt-3">
                      <GripVertical size={18} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={resp}
                      onChange={(e) =>
                        handleListChange(responsibilities, setResponsibilities, index, e.target.value)
                      }
                      placeholder="e.g. Design and implement scalable backend services"
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    />
                    {responsibilities.length > 1 && (
                      <button
                        onClick={() =>
                          handleListRemove(responsibilities, setResponsibilities, index)
                        }
                        className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => handleListAdd(responsibilities, setResponsibilities)}
                  className="w-full px-4 py-3 border-2 border-dashed border-slate-300 text-slate-600 rounded-xl hover:border-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <Plus size={18} />
                  Add Responsibility
                </button>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Requirements *</h2>
                  <p className="text-sm text-slate-600">Must-have qualifications</p>
                </div>
              </div>
              <div className="space-y-3">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-3 group">
                    <div className="cursor-move pt-3">
                      <GripVertical size={18} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={req}
                      onChange={(e) =>
                        handleListChange(requirements, setRequirements, index, e.target.value)
                      }
                      placeholder="e.g. 5+ years of professional software engineering experience"
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    />
                    {requirements.length > 1 && (
                      <button
                        onClick={() => handleListRemove(requirements, setRequirements, index)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => handleListAdd(requirements, setRequirements)}
                  className="w-full px-4 py-3 border-2 border-dashed border-slate-300 text-slate-600 rounded-xl hover:border-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <Plus size={18} />
                  Add Requirement
                </button>
              </div>
            </div>

            {/* Nice to Have */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900">Nice to Have</h2>
                <p className="text-sm text-slate-600">Preferred but not required</p>
              </div>
              <div className="space-y-3">
                {niceToHave.map((nice, index) => (
                  <div key={index} className="flex items-center gap-3 group">
                    <div className="cursor-move pt-3">
                      <GripVertical size={18} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={nice}
                      onChange={(e) =>
                        handleListChange(niceToHave, setNiceToHave, index, e.target.value)
                      }
                      placeholder="e.g. Experience with AI/ML technologies"
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    />
                    <button
                      onClick={() => handleListRemove(niceToHave, setNiceToHave, index)}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleListAdd(niceToHave, setNiceToHave)}
                  className="w-full px-4 py-3 border-2 border-dashed border-slate-300 text-slate-600 rounded-xl hover:border-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <Plus size={18} />
                  Add Nice to Have
                </button>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="sticky top-24 h-fit">
              <div className="bg-white rounded-2xl border-2 border-slate-300 overflow-hidden shadow-xl">
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye size={20} />
                      <span className="font-bold">Live Preview</span>
                    </div>
                    <span className="text-sm text-slate-400">Candidate View</span>
                  </div>
                </div>

                <div className="p-6 max-h-[calc(100vh-180px)] overflow-y-auto">
                  {jobData.title ? (
                    <JobApplicationView job={previewJob} isPreview={true} />
                  ) : (
                    <div className="text-center py-20">
                      <Briefcase size={64} className="mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-500 font-semibold text-lg">
                        Start editing your job posting
                      </p>
                      <p className="text-sm text-slate-400 mt-2">
                        Fill in the details on the left to see a live preview
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
