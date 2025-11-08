'use client';

import Link from 'next/link';
import { MapPin, Briefcase, Search } from 'lucide-react';
import { mockCompanies, mockJobs } from '@/lib/mockData';
import { useState, useMemo, useEffect } from 'react';
import { jobStore } from '@/lib/jobStore';

interface CompanyJobsPageProps {
  params: Promise<{
    companySlug: string;
  }>;
}

export default function CompanyJobsPage({ params }: CompanyJobsPageProps) {
  const [companySlug, setCompanySlug] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newJobs, setNewJobs] = useState<any[]>([]);

  useEffect(() => {
    params.then((p) => {
      setCompanySlug(p.companySlug);
      // Load jobs from localStorage
      const stored = jobStore.getByCompany(p.companySlug);
      setNewJobs(stored);
    });
  }, [params]);

  const company = mockCompanies.find((c) => c.slug === companySlug);

  // Merge mock jobs with localStorage jobs - only show active jobs
  const mockActiveJobs = mockJobs.filter((j) => j.companySlug === companySlug && j.status?.toLowerCase() === 'active');
  const newActiveJobs = newJobs.filter((j) => j.status?.toLowerCase() === 'active');
  const allJobs = [...newActiveJobs, ...mockActiveJobs];

  const jobs = useMemo(() => {
    if (!searchQuery) return allJobs;
    return allJobs.filter((job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allJobs, searchQuery]);

  if (!company) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Company not found</h1>
          <p className="text-slate-600">This career page does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">{company.name}</h1>
          <p className="text-lg text-slate-600 mb-6">{company.description}</p>
          <div className="text-sm text-slate-500">
            {allJobs.length} open {allJobs.length === 1 ? 'position' : 'positions'}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Search */}
        {allJobs.length > 0 && (
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search positions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Job Listings */}
        <div className="space-y-3">
          {jobs.map((job: any) => (
            <div
              key={job.id}
              className="border border-slate-200 rounded-lg p-5 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin size={16} />
                      {job.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Briefcase size={16} />
                      {job.type}
                    </span>
                    {job.department && (
                      <>
                        <span>•</span>
                        <span>{job.department}</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {job.description}
                  </p>
                </div>
                <Link
                  href={`/jobs/${companySlug}/${job.id}`}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium shrink-0"
                >
                  Apply
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {jobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {searchQuery ? 'No matching positions' : 'No open positions'}
            </h3>
            <p className="text-slate-600">
              {searchQuery
                ? 'Try adjusting your search'
                : 'Check back later for new opportunities'}
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-20">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center">
          <p className="text-sm text-slate-500">
            © 2025 {company.name}. All rights reserved.
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Powered by <span className="font-semibold text-slate-600">Better ATS</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
