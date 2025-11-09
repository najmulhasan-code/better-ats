'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Save,
  Plus,
  X,
  Sparkles,
  MapPin,
  Briefcase,
  DollarSign,
  Building2,
  GripVertical,
  Upload,
  Info,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { COMPANY_SETTINGS } from '@/lib/companySettings';
import { useCurrentCompany } from '@/lib/auth/hooks';
import { jobStore, generateJobId } from '@/lib/jobStore';

type CustomQuestion = {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'yesno';
  required: boolean;
  options?: string[];
};

type StandardField = {
  id: string;
  label: string;
  fieldType: 'text' | 'email' | 'tel' | 'url' | 'file' | 'textarea';
  enabled: boolean;
  required: boolean;
  canDisable: boolean;
  placeholder?: string;
};

type KnockoutQuestion = {
  id: string;
  question: string;
  enabled: boolean;
  required: boolean;
  editable: boolean;
};

export default function CreateJobPage() {
  const router = useRouter();
  const { company, loading } = useCurrentCompany();
  const [showPreview, setShowPreview] = useState(true);

  // Job basic info
  const [jobData, setJobData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'Full-time',
    salary: '',
    description: '',
  });

  // Job details
  const [responsibilities, setResponsibilities] = useState<string[]>(['']);
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [niceToHave, setNiceToHave] = useState<string[]>(['']);

  // Standard application fields
  const [standardFields, setStandardFields] = useState<StandardField[]>([
    {
      id: 'fullName',
      label: 'Full Name',
      fieldType: 'text',
      enabled: true,
      required: true,
      canDisable: false,
      placeholder: 'John Doe',
    },
    {
      id: 'email',
      label: 'Email Address',
      fieldType: 'email',
      enabled: true,
      required: true,
      canDisable: false,
      placeholder: 'john.doe@email.com',
    },
    {
      id: 'phone',
      label: 'Phone Number',
      fieldType: 'tel',
      enabled: true,
      required: true,
      canDisable: true,
      placeholder: '+1 (555) 123-4567',
    },
    {
      id: 'currentLocation',
      label: 'Current Location',
      fieldType: 'text',
      enabled: true,
      required: false,
      canDisable: true,
      placeholder: 'San Francisco, CA',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn Profile',
      fieldType: 'url',
      enabled: true,
      required: false,
      canDisable: true,
      placeholder: 'linkedin.com/in/johndoe',
    },
    {
      id: 'portfolio',
      label: 'Portfolio / Website',
      fieldType: 'url',
      enabled: true,
      required: false,
      canDisable: true,
      placeholder: 'https://johndoe.com',
    },
    {
      id: 'resume',
      label: 'Resume (PDF)',
      fieldType: 'file',
      enabled: true,
      required: true,
      canDisable: false,
      placeholder: '',
    },
    {
      id: 'coverLetter',
      label: 'Cover Letter',
      fieldType: 'textarea',
      enabled: true,
      required: false,
      canDisable: true,
      placeholder: 'Tell us why you&apos;re interested in this role...',
    },
  ]);

  // Knockout questions
  const [knockoutQuestions, setKnockoutQuestions] = useState<KnockoutQuestion[]>([
    {
      id: 'workAuth',
      question: 'Are you authorized to work in the United States?',
      enabled: true,
      required: true,
      editable: true,
    },
    {
      id: 'relocate',
      question: 'Are you willing to relocate for this position?',
      enabled: true,
      required: false,
      editable: true,
    },
    {
      id: 'sponsorship',
      question: 'Will you now or in the future require sponsorship for employment visa status?',
      enabled: true,
      required: false,
      editable: true,
    },
    {
      id: 'minExperience',
      question: 'Do you have at least 5 years of relevant experience?',
      enabled: false,
      required: false,
      editable: true,
    },
    {
      id: 'degree',
      question: 'Do you have a Bachelor&apos;s degree or higher?',
      enabled: false,
      required: false,
      editable: true,
    },
    {
      id: 'license',
      question: 'Do you have a valid driver&apos;s license?',
      enabled: false,
      required: false,
      editable: true,
    },
    {
      id: 'weekends',
      question: 'Are you available to work weekends if needed?',
      enabled: false,
      required: false,
      editable: true,
    },
    {
      id: 'nights',
      question: 'Are you available to work night shifts if needed?',
      enabled: false,
      required: false,
      editable: true,
    },
  ]);

  // EEO fields
  const [eeoFields, setEEOFields] = useState({
    veteran: { enabled: true, label: 'Veteran Status' },
    disability: { enabled: true, label: 'Disability Status' },
    gender: { enabled: true, label: 'Gender' },
    race: { enabled: true, label: 'Race / Ethnicity' },
  });

  // Custom application questions
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);

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

  const toggleStandardField = (id: string) => {
    setStandardFields(
      standardFields.map((field) =>
        field.id === id && field.canDisable ? { ...field, enabled: !field.enabled } : field
      )
    );
  };

  const toggleStandardFieldRequired = (id: string) => {
    setStandardFields(
      standardFields.map((field) =>
        field.id === id && field.enabled ? { ...field, required: !field.required } : field
      )
    );
  };

  const toggleKnockoutQuestion = (id: string) => {
    setKnockoutQuestions(
      knockoutQuestions.map((q) => (q.id === id ? { ...q, enabled: !q.enabled } : q))
    );
  };

  const toggleKnockoutRequired = (id: string) => {
    setKnockoutQuestions(
      knockoutQuestions.map((q) =>
        q.id === id && q.enabled ? { ...q, required: !q.required } : q
      )
    );
  };

  const updateKnockoutQuestion = (id: string, question: string) => {
    setKnockoutQuestions(
      knockoutQuestions.map((q) => (q.id === id ? { ...q, question } : q))
    );
  };

  const toggleEEOField = (field: keyof typeof eeoFields) => {
    setEEOFields({
      ...eeoFields,
      [field]: { ...eeoFields[field], enabled: !eeoFields[field].enabled },
    });
  };

  const addCustomQuestion = () => {
    const newQuestion: CustomQuestion = {
      id: `custom-${Date.now()}`,
      label: '',
      type: 'text',
      required: false,
    };
    setCustomQuestions([...customQuestions, newQuestion]);
  };

  const removeCustomQuestion = (id: string) => {
    setCustomQuestions(customQuestions.filter((q) => q.id !== id));
  };

  const updateCustomQuestion = (id: string, updates: Partial<CustomQuestion>) => {
    setCustomQuestions(
      customQuestions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const handleSaveJob = async (status: 'draft' | 'published') => {
    // Validate required fields
    if (!jobData.title || !jobData.department || !jobData.location) {
      alert('Please fill in all required fields');
      return;
    }

    if (!company) {
      alert('Company information not found');
      return;
    }

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
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
          status,
          // Application form configuration
          applicationForm: {
            standardFields: standardFields,
            knockoutQuestions: knockoutQuestions.filter((q) => q.enabled),
            eeoFields: eeoFields,
            customQuestions: customQuestions,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create job');
      }

      const data = await response.json();
      console.log('Job created:', data.job);

      // Redirect to jobs page
      router.push('/dashboard/jobs');
    } catch (error: any) {
      console.error('Error creating job:', error);
      alert(error.message || 'Failed to create job');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="text-slate-600">Loading...</div></div>;
  }

  if (!company) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="text-slate-600">Please sign in to create jobs</div></div>;
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
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Job Posting</h1>
                <p className="text-sm text-slate-600 mt-0.5">
                  Design your job posting and application form in one place
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
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2 font-medium text-sm"
              >
                <Save size={16} />
                Save as Draft
              </button>
              <button
                onClick={() => handleSaveJob('published')}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2 font-medium text-sm"
              >
                <Check size={16} />
                Publish
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
                    <button className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all flex items-center gap-2 text-sm font-semibold border border-purple-200">
                      <Sparkles size={16} />
                      AI Assist
                    </button>
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
                    <button className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all flex items-center gap-2 text-sm font-semibold border border-purple-200">
                      <Sparkles size={16} />
                      AI Assist
                    </button>
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
                    <button className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all flex items-center gap-2 text-sm font-semibold border border-purple-200">
                      <Sparkles size={16} />
                      AI Assist
                    </button>
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

            {/* Standard Application Fields */}
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      Standard Application Fields
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                      Select which fields to include in your application form
                    </p>
                  </div>
                  <div className="space-y-2">
                    {standardFields.map((field) => (
                      <div
                        key={field.id}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                          field.enabled
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <button
                            onClick={() => toggleStandardField(field.id)}
                            disabled={!field.canDisable}
                            className={`relative w-12 h-7 rounded-full transition-all ${
                              field.enabled ? 'bg-green-500' : 'bg-slate-300'
                            } ${!field.canDisable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <div
                              className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                                field.enabled ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <div>
                            <p className="font-semibold text-slate-900 flex items-center gap-2">
                              {field.label}
                              {!field.canDisable && (
                                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                                  Required
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-600">{field.placeholder}</p>
                          </div>
                        </div>
                        {field.enabled && field.canDisable && (
                          <label className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg bg-white cursor-pointer hover:bg-slate-50 transition-all">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={() => toggleStandardFieldRequired(field.id)}
                              className="rounded border-slate-300"
                            />
                            <span className="text-sm text-slate-700 font-medium">Required</span>
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Knockout Questions */}
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-900">Screening Questions</h2>
                    <p className="text-sm text-slate-600 mt-1">
                      Yes/No questions to automatically filter candidates
                    </p>
                  </div>
                  <div className="space-y-3">
                    {knockoutQuestions.map((question) => (
                      <div
                        key={question.id}
                        className={`rounded-xl border transition-all ${
                          question.enabled
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-4 p-4">
                          <button
                            onClick={() => toggleKnockoutQuestion(question.id)}
                            className={`relative w-12 h-7 rounded-full transition-all mt-2 ${
                              question.enabled ? 'bg-blue-500' : 'bg-slate-300'
                            }`}
                          >
                            <div
                              className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                                question.enabled ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <div className="flex-1">
                            {question.editable && question.enabled ? (
                              <input
                                type="text"
                                value={question.question}
                                onChange={(e) => updateKnockoutQuestion(question.id, e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium text-slate-900"
                              />
                            ) : (
                              <p
                                className={`font-medium px-4 py-2.5 ${
                                  question.enabled ? 'text-slate-900' : 'text-slate-500'
                                }`}
                              >
                                {question.question}
                              </p>
                            )}
                          </div>
                          {question.enabled && (
                            <label className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg bg-white cursor-pointer hover:bg-slate-50 transition-all">
                              <input
                                type="checkbox"
                                checked={question.required}
                                onChange={() => toggleKnockoutRequired(question.id)}
                                className="rounded border-slate-300"
                              />
                              <span className="text-sm text-slate-700 font-medium">Required</span>
                            </label>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* EEO Fields */}
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-900">
                      Equal Opportunity Questions
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                      Optional diversity and inclusion fields (voluntary disclosure)
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(eeoFields).map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() => toggleEEOField(key as keyof typeof eeoFields)}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                          value.enabled
                            ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="font-semibold text-slate-900">{value.label}</span>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            value.enabled
                              ? 'bg-purple-500 border-purple-500'
                              : 'bg-white border-slate-300'
                          }`}
                        >
                          {value.enabled && <Check size={14} className="text-white" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Application Questions */}
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-900">
                      Custom Questions
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                      Add role-specific questions for applicants
                    </p>
                  </div>
                  <div className="space-y-4">
                    {customQuestions.map((question) => (
                      <div
                        key={question.id}
                        className="p-5 border border-slate-200 rounded-xl space-y-4 bg-gradient-to-r from-slate-50 to-white hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="text"
                            value={question.label}
                            onChange={(e) =>
                              updateCustomQuestion(question.id, { label: e.target.value })
                            }
                            placeholder="Enter your question..."
                            className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                          />
                          <button
                            onClick={() => removeCustomQuestion(question.id)}
                            className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <X size={18} />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <select
                            value={question.type}
                            onChange={(e) =>
                              updateCustomQuestion(question.id, {
                                type: e.target.value as CustomQuestion['type'],
                              })
                            }
                            className="px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                          >
                            <option value="text">Short Text</option>
                            <option value="textarea">Long Text</option>
                            <option value="select">Dropdown</option>
                            <option value="radio">Multiple Choice</option>
                            <option value="checkbox">Checkboxes</option>
                            <option value="yesno">Yes/No</option>
                          </select>
                          <label className="flex items-center gap-2 px-4 py-3 border border-slate-300 rounded-xl bg-white cursor-pointer hover:bg-slate-50 transition-all">
                            <input
                              type="checkbox"
                              checked={question.required}
                              onChange={(e) =>
                                updateCustomQuestion(question.id, { required: e.target.checked })
                              }
                              className="rounded border-slate-300"
                            />
                            <span className="text-sm text-slate-700 font-medium">Required</span>
                          </label>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addCustomQuestion}
                      className="w-full px-4 py-4 border-2 border-dashed border-slate-300 text-slate-600 rounded-xl hover:border-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all flex items-center justify-center gap-2 font-semibold"
                    >
                      <Plus size={20} />
                      Add Custom Question
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
                    <div className="space-y-6">
                      <div className="border-b border-slate-200 pb-6">
                        <h1 className="text-3xl font-bold text-slate-900 mb-3">{jobData.title}</h1>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                          {jobData.department && (
                            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                              <Building2 size={16} className="text-slate-500" />
                              <span className="font-medium">{jobData.department}</span>
                            </div>
                          )}
                          {jobData.location && (
                            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                              <MapPin size={16} className="text-slate-500" />
                              <span className="font-medium">{jobData.location}</span>
                            </div>
                          )}
                          {jobData.type && (
                            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                              <Briefcase size={16} className="text-slate-500" />
                              <span className="font-medium">{jobData.type}</span>
                            </div>
                          )}
                          {jobData.salary && (
                            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                              <DollarSign size={16} className="text-slate-500" />
                              <span className="font-medium">{jobData.salary}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Job Description */}
                      {jobData.description && (
                        <section>
                          <h3 className="text-[18px] font-semibold text-slate-900 mb-3 tracking-tight">
                            About the Role
                          </h3>
                          <p className="text-[15px] text-slate-700 leading-relaxed">
                            {jobData.description}
                          </p>
                        </section>
                      )}

                      {/* Responsibilities */}
                      {responsibilities.filter(r => r.trim()).length > 0 && (
                        <section>
                          <h3 className="text-[18px] font-semibold text-slate-900 mb-3 tracking-tight">
                            Responsibilities
                          </h3>
                          <ul className="space-y-2">
                            {responsibilities.filter(r => r.trim()).map((item: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-3 text-[15px] text-slate-700 leading-relaxed">
                                <span className="text-slate-400 mt-1 text-[18px] leading-none">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      )}

                      {/* Requirements */}
                      {requirements.filter(r => r.trim()).length > 0 && (
                        <section>
                          <h3 className="text-[18px] font-semibold text-slate-900 mb-3 tracking-tight">
                            Requirements
                          </h3>
                          <ul className="space-y-2">
                            {requirements.filter(r => r.trim()).map((item: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-3 text-[15px] text-slate-700 leading-relaxed">
                                <span className="text-slate-400 mt-1 text-[18px] leading-none">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      )}

                      {/* Nice to Have */}
                      {niceToHave.filter(n => n.trim()).length > 0 && (
                        <section>
                          <h3 className="text-[18px] font-semibold text-slate-900 mb-3 tracking-tight">
                            Nice to Have
                          </h3>
                          <ul className="space-y-2">
                            {niceToHave.filter(n => n.trim()).map((item: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-3 text-[15px] text-slate-700 leading-relaxed">
                                <span className="text-slate-400 mt-1 text-[18px] leading-none">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      )}

                      <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-4 mt-8">Apply for this position</h2>

                        <div className="space-y-4 mb-6">
                          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                            Personal Information
                          </h3>
                          {standardFields
                            .filter((f) => f.enabled)
                            .map((field) => (
                              <div key={field.id}>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">
                                  {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>
                                {field.fieldType === 'textarea' ? (
                                  <div className="w-full h-24 px-4 py-3 border border-slate-300 rounded-xl bg-slate-50" />
                                ) : field.fieldType === 'file' ? (
                                  <div className="w-full p-8 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center">
                                    <Upload size={32} className="text-slate-400 mb-2" />
                                    <p className="text-sm text-slate-600 font-medium">Upload PDF resume</p>
                                  </div>
                                ) : (
                                  <div className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50">
                                    <span className="text-sm text-slate-400">{field.placeholder}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>

                        {knockoutQuestions.filter((q) => q.enabled).length > 0 && (
                          <div className="space-y-4 mb-6 pt-6 border-t border-slate-200">
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                              Screening Questions
                            </h3>
                            {knockoutQuestions
                              .filter((q) => q.enabled)
                              .map((question) => (
                                <div key={question.id}>
                                  <label className="block text-sm font-semibold text-slate-900 mb-3">
                                    {question.question}{' '}
                                    {question.required && <span className="text-red-500">*</span>}
                                  </label>
                                  <div className="flex gap-3">
                                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-slate-300 rounded-xl bg-white cursor-pointer hover:bg-slate-50 hover:border-slate-400 transition-all">
                                      <input type="radio" name={question.id} />
                                      <span className="text-sm font-medium">Yes</span>
                                    </label>
                                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-slate-300 rounded-xl bg-white cursor-pointer hover:bg-slate-50 hover:border-slate-400 transition-all">
                                      <input type="radio" name={question.id} />
                                      <span className="text-sm font-medium">No</span>
                                    </label>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}

                        {customQuestions.length > 0 && (
                          <div className="space-y-4 pt-6 border-t border-slate-200">
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                              Additional Questions
                            </h3>
                            {customQuestions.map((question) => (
                              <div key={question.id}>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">
                                  {question.label || 'Custom Question'}{' '}
                                  {question.required && <span className="text-red-500">*</span>}
                                </label>
                                <div className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50">
                                  <span className="text-sm text-slate-400 capitalize">{question.type} field</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {Object.values(eeoFields).some((f) => f.enabled) && (
                          <div className="space-y-4 mt-6 pt-6 border-t border-slate-200">
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                              Equal Opportunity (Optional)
                            </h3>
                            <p className="text-xs text-slate-600 bg-slate-100 p-3 rounded-lg">
                              <Info size={14} className="inline mr-1" />
                              We are an equal opportunity employer. This information is optional and voluntary.
                            </p>
                            {Object.entries(eeoFields)
                              .filter(([_, value]) => value.enabled)
                              .map(([key, value]) => (
                                <div key={key}>
                                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                                    {value.label}
                                  </label>
                                  <div className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50">
                                    <span className="text-sm text-slate-400">Select one</span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}

                        <button className="w-full bg-gradient-to-r from-slate-900 to-slate-700 text-white px-6 py-4 rounded-xl hover:from-slate-800 hover:to-slate-600 transition-all font-bold mt-6 shadow-lg">
                          Submit Application
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <Briefcase size={64} className="mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-500 font-semibold text-lg">
                        Start creating your job posting
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
