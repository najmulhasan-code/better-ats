'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Star, Mail, Linkedin, FileText, Briefcase, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useCurrentCompany } from '@/lib/auth/hooks';

export default function CandidatesPage() {
  const { company, loading } = useCurrentCompany();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'date'>('score');
  const [filterJob, setFilterJob] = useState<string>('all');
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);
  const [companyCandidates, setCompanyCandidates] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch candidates from API
  useEffect(() => {
    async function fetchCandidates() {
      if (!company?.slug) return;

      setDataLoading(true);
      try {
        const response = await fetch('/api/dashboard/candidates');
        if (response.ok) {
          const data = await response.json();
          setCompanyCandidates(data.candidates || []);
        }
      } catch (error) {
        console.error('Error fetching candidates:', error);
      } finally {
        setDataLoading(false);
      }
    }

    fetchCandidates();
  }, [company?.slug]);

  if (loading || dataLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="text-slate-600">Loading...</div></div>;
  }

  if (!company) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="text-slate-600">Please sign in to view candidates</div></div>;
  }

  const uniqueJobs = Array.from(new Set(companyCandidates.map((c) => c.jobTitle)));

  const filteredAndSortedCandidates = companyCandidates
    .filter((candidate) => {
      const matchesSearch =
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.currentRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.skillMatch.some((skill) =>
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesJobFilter =
        filterJob === 'all' || candidate.jobTitle === filterJob;

      return matchesSearch && matchesJobFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'score') {
        return b.aiScore - a.aiScore;
      } else {
        return b.appliedDateTimestamp - a.appliedDateTimestamp;
      }
    });

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-700 bg-green-50 border-green-200';
    if (score >= 80) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (score >= 70) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    return 'text-slate-700 bg-slate-50 border-slate-200';
  };

  return (
    <div className="space-y-7">
      <div className="mb-8">
        <h1 className="text-[40px] font-bold text-slate-900 tracking-tight">Candidates</h1>
        <p className="text-[15px] text-slate-600 mt-3 font-medium">
          {filteredAndSortedCandidates.length} total applications across all jobs
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 p-6 shadow-xl mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300/80 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#5371FE] focus:border-transparent transition-all"
            />
          </div>

          <div className="relative">
            <Filter
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={filterJob}
              onChange={(e) => setFilterJob(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300/80 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#5371FE] focus:border-transparent appearance-none bg-white transition-all"
            >
              <option value="all">All Jobs</option>
              {uniqueJobs.map((job) => (
                <option key={job} value={job}>
                  {job}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'score' | 'date')}
              className="w-full px-4 py-3 border border-slate-300/80 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#5371FE] focus:border-transparent appearance-none bg-white transition-all"
            >
              <option value="score">Sort by: AI Score</option>
              <option value="date">Sort by: Application Date</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredAndSortedCandidates.map((candidate) => (
          <div
            key={candidate.id}
            className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/60 overflow-hidden hover:shadow-2xl hover:scale-[1.01] transition-all duration-300"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {candidate.name}
                    </h3>
                    <div
                      className={`px-3 py-1 rounded-lg border text-sm font-semibold ${getScoreColor(candidate.aiScore)}`}
                    >
                      <div className="flex items-center gap-1">
                        <Star size={14} />
                        {candidate.aiScore}% Match
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">{candidate.currentRole}</p>
                  <p className="text-sm text-slate-500 mb-2">{candidate.education}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Briefcase size={14} className="text-slate-400" />
                    <span>Applied for: {candidate.jobTitle}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${candidate.email}`}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                    title="Email"
                  >
                    <Mail size={18} />
                  </a>
                  <a
                    href={`https://${candidate.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                    title="LinkedIn"
                  >
                    <Linkedin size={18} />
                  </a>
                  <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                    <FileText size={18} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                {candidate.skillMatch.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>Applied {candidate.appliedDate}</span>
                  </div>
                  <span>•</span>
                  <span>{candidate.experience} experience</span>
                </div>
                <button
                  onClick={() =>
                    setExpandedCandidate(
                      expandedCandidate === candidate.id ? null : candidate.id
                    )
                  }
                  className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                >
                  {expandedCandidate === candidate.id ? (
                    <>
                      Hide AI Analysis
                      <ChevronUp size={16} />
                    </>
                  ) : (
                    <>
                      View AI Analysis
                      <ChevronDown size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>

            {expandedCandidate === candidate.id && (
              <div className="border-t border-slate-200 bg-slate-50 p-6">
                <h4 className="font-semibold text-slate-900 mb-3">
                  AI Match Analysis for {candidate.jobTitle}
                </h4>
                <ul className="space-y-2">
                  {candidate.matchReasons.map((reason, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-slate-700 flex items-start gap-2"
                    >
                      <span className="text-green-600 mt-1">✓</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredAndSortedCandidates.length === 0 && (
        <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/60 p-16 text-center shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full blur-3xl"></div>
          <div className="relative">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={40} className="text-slate-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-[24px] font-bold text-slate-900 mb-3 tracking-tight">No candidates found</h3>
            <p className="text-[15px] text-slate-600 font-medium">
              Try adjusting your search or filter criteria
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
