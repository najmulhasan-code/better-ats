'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, FileText, Loader2, CheckCircle } from 'lucide-react';
import { useParams } from 'next/navigation';
import { mockCompanies, mockJobs } from '@/lib/mockData';
import { candidateStore, generateCandidateId } from '@/lib/candidateStore';
import { jobStore } from '@/lib/jobStore';

export default function ApplyPage() {
  const params = useParams();
  const companySlug = params.companySlug as string;
  const jobId = params.jobId as string;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    linkedIn: '',
    portfolio: '',
    coverLetter: '',
  });

  const [resume, setResume] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const company = mockCompanies.find((c) => c.slug === companySlug);

  // Check both localStorage and mock jobs
  const storedJob = jobStore.getById(jobId);
  const mockJob = mockJobs.find((j) => j.id === jobId && j.companySlug === companySlug);
  const job = storedJob || mockJob;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.pdf'))) {
      setResume(file);
    } else {
      alert('Please upload a PDF file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResume(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resume) {
      alert('Please upload your resume');
      return;
    }

    setIsSubmitting(true);

    // Simulate processing time
    setTimeout(() => {
      // Create new candidate
      const newCandidate = {
        id: generateCandidateId(),
        companySlug,
        jobId,
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        linkedin: formData.linkedIn,
        portfolio: formData.portfolio,
        appliedDate: 'Just now',
        appliedDateTimestamp: Date.now(),
        aiScore: Math.floor(Math.random() * 15) + 75, // Random score between 75-90
        stage: 'applied',
        jobTitle: job?.title || '',
        matchReasons: [
          'Resume submitted successfully',
          'Application under review',
          'Will be evaluated by hiring team',
        ],
        skillMatch: [],
        experience: 'See resume',
        currentRole: 'See resume',
        education: 'See resume',
        resumeFile: resume.name,
        coverLetter: formData.coverLetter,
      };

      // Save to localStorage
      candidateStore.add(newCandidate);

      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  if (!company || !job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Job not found</h1>
          <Link href="/" className="text-slate-600 hover:text-slate-900">
            Go back
          </Link>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={24} className="text-emerald-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">
              Application submitted
            </h1>
            <p className="text-sm text-slate-600 mb-6">
              Thank you for applying. The hiring team will review your application and be in touch soon.
            </p>
            <Link
              href={`/jobs/${companySlug}`}
              className="inline-block bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              Back to all jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <Link
            href={`/jobs/${companySlug}/${jobId}`}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-3"
          >
            <ArrowLeft size={16} />
            Back to job details
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Apply for this position</h1>
          <p className="text-slate-600">{job.title} at {company.name}</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
                  placeholder="john.doe@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label htmlFor="linkedIn" className="block text-sm font-medium text-slate-700 mb-2">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  id="linkedIn"
                  name="linkedIn"
                  value={formData.linkedIn}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
                  placeholder="linkedin.com/in/johndoe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="portfolio" className="block text-sm font-medium text-slate-700 mb-2">
                Portfolio / Website
              </label>
              <input
                type="url"
                id="portfolio"
                name="portfolio"
                value={formData.portfolio}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
                placeholder="https://johndoe.com"
              />
            </div>

            <div>
              <label htmlFor="resume" className="block text-sm font-medium text-slate-700 mb-2">
                Resume (PDF) *
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isSubmitting && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-slate-400 bg-slate-50'
                    : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  disabled={isSubmitting}
                  className="hidden"
                />

                {resume ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText size={32} className="text-slate-600" />
                    <div className="text-left">
                      <p className="font-medium text-slate-900">{resume.name}</p>
                      <p className="text-sm text-slate-500">
                        {(resume.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload size={48} className="mx-auto text-slate-400 mb-4" />
                    <p className="text-slate-700 font-medium mb-1">
                      Drop your resume here, or click to browse
                    </p>
                    <p className="text-sm text-slate-500">PDF files only, max 10MB</p>
                  </div>
                )}
              </div>

              {resume && !isSubmitting && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setResume(null);
                  }}
                  className="mt-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Remove file
                </button>
              )}
            </div>

            <div>
              <label htmlFor="coverLetter" className="block text-sm font-medium text-slate-700 mb-2">
                Cover Letter (Optional)
              </label>
              <textarea
                id="coverLetter"
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleInputChange}
                disabled={isSubmitting}
                rows={6}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50 resize-none"
                placeholder="Tell us why you're interested in this role..."
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-4">
            <Link
              href={`/jobs/${companySlug}/${jobId}`}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !resume}
              className="bg-slate-900 text-white px-8 py-3 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-20">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <p className="text-sm text-slate-600 text-center">
            © 2025 {company.name}. Powered by Better ATS.
          </p>
        </div>
      </footer>
    </div>
  );
}
