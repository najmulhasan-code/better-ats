'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, DollarSign, Briefcase, Calendar, Users, ChevronDown, ChevronUp, FileText, Mail, Star, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCurrentCompany } from '@/lib/auth/hooks';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { company, loading: authLoading } = useCurrentCompany();
  const jobId = params.jobId as string;
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);
  const [job, setJob] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch job and candidates from API
  useEffect(() => {
    async function fetchData() {
      if (!company?.slug) return;

      setLoading(true);
      try {
        // Fetch job details
        const jobResponse = await fetch(`/api/jobs/${jobId}`);
        if (jobResponse.ok) {
          const jobData = await jobResponse.json();
          setJob(jobData.job);
        }

        // Fetch candidates for this job
        const candidatesResponse = await fetch(`/api/dashboard/jobs/${jobId}/candidates`);
        if (candidatesResponse.ok) {
          const candidatesData = await candidatesResponse.json();
          setCandidates(candidatesData.candidates || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [jobId, company?.slug]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Job not found</h2>
        <p className="text-slate-600 mb-6">The job you're looking for doesn't exist.</p>
        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900"
        >
          <ArrowLeft size={20} />
          Back to Jobs
        </Link>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-700 bg-green-50 border-green-200';
    if (score >= 80) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (score >= 70) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    return 'text-slate-700 bg-slate-50 border-slate-200';
  };

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Jobs
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
              <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
                {job.status}
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin size={16} className="text-slate-400" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Briefcase size={16} className="text-slate-400" />
                <span>{job.type}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <DollarSign size={16} className="text-slate-400" />
                <span>{job.salary}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users size={16} className="text-slate-400" />
                <span>{job.applicants} applicants</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar size={16} className="text-slate-400" />
                <span>Posted {job.posted}</span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h3 className="font-semibold text-slate-900 mb-3">Description</h3>
              <p className="text-sm text-slate-600 mb-6">{job.description}</p>

              <h3 className="font-semibold text-slate-900 mb-3">Requirements</h3>
              <ul className="space-y-2 mb-6">
                {job.requirements.map((req: string, idx: number) => (
                  <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="text-slate-400 mt-1">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>

              <h3 className="font-semibold text-slate-900 mb-3">Responsibilities</h3>
              <ul className="space-y-2">
                {job.responsibilities.map((resp: string, idx: number) => (
                  <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="text-slate-400 mt-1">•</span>
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Candidates ({candidates.length})
            </h2>
            <p className="text-slate-600 text-sm">
              Ranked by AI match score
            </p>
          </div>

          <div className="space-y-4">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {candidate.name}
                        </h3>
                        <div className={`px-3 py-1 rounded-lg border text-sm font-semibold ${getScoreColor(candidate.aiScore)}`}>
                          <div className="flex items-center gap-1">
                            <Star size={14} />
                            {candidate.aiScore}% Match
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-1">{candidate.currentRole}</p>
                      <p className="text-sm text-slate-500">{candidate.education}</p>
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
                        <ExternalLink size={18} />
                      </a>
                      <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                        <FileText size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {candidate.skillMatch.map((skill: string) => (
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
                      <span>{candidate.experience} experience</span>
                      <span>•</span>
                      <span>Applied {candidate.appliedDate}</span>
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
                      AI Match Analysis
                    </h4>
                    <ul className="space-y-2">
                      {candidate.matchReasons.map((reason: string, idx: number) => (
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

          {candidates.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <Users size={48} className="mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No candidates yet
              </h3>
              <p className="text-slate-600">
                Candidates who apply will appear here with AI-powered match scores.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
