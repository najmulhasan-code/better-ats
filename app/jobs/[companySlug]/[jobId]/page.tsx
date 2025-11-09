'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Briefcase, DollarSign, Calendar, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import JobApplicationView from '@/app/components/job/JobApplicationView';

interface JobDetailPageProps {
  params: Promise<{
    companySlug: string;
    jobId: string;
  }>;
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const [companySlug, setCompanySlug] = useState<string>('');
  const [jobId, setJobId] = useState<string>('');
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    params.then(async (p) => {
      setCompanySlug(p.companySlug);
      setJobId(p.jobId);

      try {
        const res = await fetch(`/api/jobs/${p.jobId}`);
        if (!res.ok) {
          setError('Job not found');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setJob(data.job);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching job:', err);
        setError(err.message);
        setLoading(false);
      }
    });
  }, [params]);

  const handleApplicationSubmit = async (data: any) => {
    const { formData, resume, customAnswers, knockoutAnswers } = data;

    if (!resume) {
      alert('Please upload your resume');
      return;
    }

    setIsSubmitting(true);

    try {
      const reader = new FileReader();
      const resumeBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(resume);
      });

      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          currentLocation: formData.currentLocation,
          linkedin: formData.linkedIn,
          portfolio: formData.portfolio,
          coverLetter: formData.coverLetter,
          customAnswers,
          knockoutAnswers,
          veteranStatus: formData.veteranStatus,
          disability: formData.disability,
          gender: formData.gender,
          race: formData.race,
          resumeData: {
            name: resume.name,
            size: resume.size,
            type: resume.type,
            data: resumeBase64,
          },
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const error = await response.json();
        alert(`Failed to submit application: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-3" />
          <p className="text-[15px] text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-[32px] font-semibold text-slate-900 mb-3 tracking-tight">
            Job not found
          </h1>
          <Link href={companySlug ? `/jobs/${companySlug}` : '/'} className="text-[15px] text-slate-600 hover:text-slate-900 transition-colors font-medium">
            {companySlug ? 'Back to all jobs' : 'Go back'}
          </Link>
        </div>
      </div>
    );
  }

  const company = job.company;

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-10 shadow-sm">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-emerald-600" strokeWidth={2} />
            </div>
            <h1 className="text-[28px] font-semibold text-slate-900 mb-3 tracking-tight">
              Application submitted
            </h1>
            <p className="text-[15px] text-slate-600 mb-8 leading-relaxed">
              Thank you for applying. The hiring team will review your application and be in touch soon.
            </p>
            <Link
              href={`/jobs/${companySlug}`}
              className="inline-block bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-all text-[15px] font-semibold"
            >
              Back to all jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200/60 bg-white">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <Link
            href={`/jobs/${company.slug}`}
            className="inline-flex items-center gap-2 text-[14px] text-slate-600 hover:text-slate-900 mb-6 transition-colors font-medium"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Back to all jobs at {company.name}
          </Link>
          <h1 className="text-[42px] font-semibold text-slate-900 mb-6 tracking-tight leading-tight">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-slate-600 text-[15px]">
            <div className="flex items-center gap-2.5">
              <MapPin size={18} className="text-slate-400" strokeWidth={2} />
              <span className="font-medium">{job.location}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Briefcase size={18} className="text-slate-400" strokeWidth={2} />
              <span className="font-medium">{job.type}</span>
            </div>
            {job.salary && (
              <div className="flex items-center gap-2.5">
                <DollarSign size={18} className="text-slate-400" strokeWidth={2} />
                <span className="font-medium">{job.salary}</span>
              </div>
            )}
            {job.posted && (
              <div className="flex items-center gap-2.5">
                <Calendar size={18} className="text-slate-400" strokeWidth={2} />
                <span className="font-medium">Posted {job.posted}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-12">
        <JobApplicationView
          job={job}
          isPreview={false}
          onSubmit={handleApplicationSubmit}
          isSubmitting={isSubmitting}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white mt-20">
        <div className="max-w-7xl mx-auto px-8 py-10">
          <p className="text-[14px] text-slate-600 text-center font-medium">
            © 2025 {company.name}. All rights reserved.
          </p>
          <p className="text-[13px] text-slate-400 mt-2 text-center">
            Powered by <span className="font-semibold text-slate-600">Better ATS</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
