'use client';

import Link from 'next/link';
import { MapPin, Briefcase, Search, Loader2, DollarSign } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';

interface CompanyJobsPageProps {
  params: Promise<{
    companySlug: string;
  }>;
}

export default function CompanyJobsPage({ params }: CompanyJobsPageProps) {
  const [companySlug, setCompanySlug] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(async (p) => {
      setCompanySlug(p.companySlug);

      try {
        const companyRes = await fetch(`/api/companies/${p.companySlug}`);
        if (!companyRes.ok) {
          setError('Company not found');
          setLoading(false);
          return;
        }
        const companyData = await companyRes.json();
        setCompany(companyData.company);

        const jobsRes = await fetch(`/api/companies/${p.companySlug}/jobs`);
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          setJobs(jobsData.jobs);
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    });
  }, [params]);

  const filteredJobs = useMemo(() => {
    if (!searchQuery) return jobs;
    return jobs.filter((job) =>
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [jobs, searchQuery]);

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

  if (error || !company) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-[32px] font-semibold text-slate-900 mb-2 tracking-tight">Company not found</h1>
          <p className="text-[15px] text-slate-600">This career page does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto px-8 py-12">
          <h1 className="text-[48px] font-semibold text-slate-900 mb-4 tracking-tight leading-tight">{company.name}</h1>
          {company.description && (
            <p className="text-[17px] text-slate-600 mb-6 leading-relaxed max-w-3xl">{company.description}</p>
          )}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-slate-100 rounded-lg">
              <span className="text-[14px] font-semibold text-slate-700">
                {jobs.length} {jobs.length === 1 ? 'Open Position' : 'Open Positions'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-10">
        {/* Search */}
        {jobs.length > 0 && (
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} strokeWidth={2.5} />
              <input
                type="text"
                placeholder="Search positions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200/80 rounded-xl text-[15px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all shadow-sm"
              />
            </div>
          </div>
        )}

        {/* Job Listings */}
        <div className="space-y-3">
          {filteredJobs.map((job: any) => (
            <Link
              key={job.id}
              href={`/jobs/${companySlug}/${job.id}`}
              className="block bg-white border border-slate-200/80 rounded-xl p-5 hover:border-slate-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <h3 className="text-[17px] font-semibold text-slate-900 mb-2 tracking-tight group-hover:text-slate-700 transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-4 text-[13px] text-slate-600 flex-wrap">
                    <span className="flex items-center gap-1.5 font-medium">
                      <MapPin size={14} strokeWidth={2.5} className="text-slate-400" />
                      {job.location}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Briefcase size={14} strokeWidth={2.5} className="text-slate-400" />
                      {job.type}
                    </span>
                    {job.salary && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <DollarSign size={14} strokeWidth={2.5} className="text-slate-400" />
                          {job.salary}
                        </span>
                      </>
                    )}
                    {job.department && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="font-semibold text-slate-700">{job.department}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="shrink-0">
                  <div className="px-5 py-2 bg-slate-900 text-white rounded-lg text-[14px] font-semibold group-hover:bg-slate-800 transition-colors shadow-sm">
                    Apply
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredJobs.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/60 p-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Briefcase className="text-slate-400" size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-[24px] font-semibold text-slate-900 mb-2 tracking-tight">
              {searchQuery ? 'No matching positions' : 'No open positions'}
            </h3>
            <p className="text-[15px] text-slate-600 leading-relaxed">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Check back soon for new opportunities'}
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/60 mt-16">
        <div className="max-w-5xl mx-auto px-8 py-10 text-center">
          <p className="text-[14px] text-slate-600 font-medium">
            © 2025 {company.name}. All rights reserved.
          </p>
          <p className="text-[13px] text-slate-400 mt-2">
            Powered by <span className="font-semibold text-slate-600">Better ATS</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
