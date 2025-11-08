'use client';

import Link from 'next/link';
import { MapPin, Briefcase, DollarSign, Calendar, ArrowLeft } from 'lucide-react';
import { mockCompanies, mockJobs } from '@/lib/mockData';
import { jobStore } from '@/lib/jobStore';
import { useEffect, useState } from 'react';

interface JobDetailPageProps {
  params: Promise<{
    companySlug: string;
    jobId: string;
  }>;
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const [companySlug, setCompanySlug] = useState<string>('');
  const [jobId, setJobId] = useState<string>('');

  useEffect(() => {
    params.then((p) => {
      setCompanySlug(p.companySlug);
      setJobId(p.jobId);
    });
  }, [params]);

  const company = mockCompanies.find((c) => c.slug === companySlug);

  // Check both localStorage and mock jobs
  const storedJob = jobStore.getById(jobId);
  const mockJob = mockJobs.find((j) => j.id === jobId && j.companySlug === companySlug);
  const job = storedJob || mockJob;

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Company not found</h1>
          <Link href="/" className="text-slate-600 hover:text-slate-900">
            Go back
          </Link>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Job not found</h1>
          <Link href={`/jobs/${companySlug}`} className="text-slate-600 hover:text-slate-900">
            Back to all jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <Link
            href={`/jobs/${companySlug}`}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft size={16} />
            Back to all jobs at {company.name}
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-slate-600">
            <div className="flex items-center gap-1.5">
              <MapPin size={18} className="text-slate-400" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase size={18} className="text-slate-400" />
              <span>{job.type}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign size={18} className="text-slate-400" />
              <span>{job.salary}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={18} className="text-slate-400" />
              <span>Posted {job.posted}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">About the role</h2>
              <p className="text-slate-700 leading-relaxed">{job.fullDescription}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Responsibilities</h2>
              <ul className="space-y-3">
                {job.responsibilities.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-700">
                    <span className="text-slate-400 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Requirements</h2>
              <ul className="space-y-3">
                {job.requirements.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-700">
                    <span className="text-slate-400 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Nice to have</h2>
              <ul className="space-y-3">
                {job.niceToHave.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-700">
                    <span className="text-slate-400 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-6">
              <Link
                href={`/jobs/${companySlug}/${job.id}/apply`}
                className="block w-full bg-slate-900 text-white text-center px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors font-medium mb-4"
              >
                Apply for this position
              </Link>
              <div className="text-sm text-slate-600 space-y-2">
                <p>
                  <span className="font-medium text-slate-900">Company:</span> {company.name}
                </p>
                <p>
                  <span className="font-medium text-slate-900">Department:</span> {job.department}
                </p>
                <p>
                  <span className="font-medium text-slate-900">Location:</span> {job.location}
                </p>
                <p>
                  <span className="font-medium text-slate-900">Employment:</span> {job.type}
                </p>
                <p>
                  <span className="font-medium text-slate-900">Salary:</span> {job.salary}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-20">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <p className="text-sm text-slate-600 text-center">
            © 2025 {company.name}. Powered by Better ATS.
          </p>
        </div>
      </footer>
    </div>
  );
}
