'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, DollarSign, Briefcase, Calendar, Users, ChevronDown, ChevronUp, FileText, Mail, Star, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const mockJobs: Record<string, any> = {
  'job-1': {
    id: 'job-1',
    title: 'Senior Software Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$150k - $200k',
    applicants: 24,
    posted: '3 days ago',
    status: 'Active',
    description: 'We are looking for an experienced software engineer to join our core platform team. You will be responsible for building scalable systems that power our product.',
    requirements: [
      '5+ years of experience in software development',
      'Strong proficiency in React, Node.js, and TypeScript',
      'Experience with distributed systems and microservices',
      'Excellent problem-solving and communication skills',
    ],
    responsibilities: [
      'Design and implement scalable backend services',
      'Collaborate with product and design teams',
      'Mentor junior engineers and conduct code reviews',
      'Optimize application performance and reliability',
    ],
  },
  'job-2': {
    id: 'job-2',
    title: 'Product Manager',
    department: 'Product',
    location: 'Remote',
    type: 'Full-time',
    salary: '$130k - $180k',
    applicants: 18,
    posted: '1 week ago',
    status: 'Active',
    description: 'Seeking a strategic product manager to lead our analytics products and drive product vision.',
    requirements: [
      '3+ years of product management experience',
      'Strong analytical and data-driven mindset',
      'Experience with B2B SaaS products',
      'Excellent stakeholder management skills',
    ],
    responsibilities: [
      'Define product strategy and roadmap',
      'Work closely with engineering and design teams',
      'Conduct user research and gather feedback',
      'Track and analyze product metrics',
    ],
  },
  'job-3': {
    id: 'job-3',
    title: 'Senior Product Designer',
    department: 'Design',
    location: 'New York, NY',
    type: 'Full-time',
    salary: '$120k - $160k',
    applicants: 31,
    posted: '2 weeks ago',
    status: 'Active',
    description: 'Join our design team to create beautiful and intuitive user experiences for our platform.',
    requirements: [
      '4+ years of product design experience',
      'Strong portfolio demonstrating UX/UI skills',
      'Proficiency in Figma and design systems',
      'Experience with user research and testing',
    ],
    responsibilities: [
      'Design end-to-end user experiences',
      'Create and maintain design systems',
      'Collaborate with product and engineering teams',
      'Conduct usability testing and iterate on designs',
    ],
  },
};

const mockCandidates: Record<string, any[]> = {
  'job-1': [
    {
      id: 'candidate-1',
      name: 'Sarah Chen',
      email: 'sarah.chen@email.com',
      linkedin: 'linkedin.com/in/sarahchen',
      appliedDate: '2 days ago',
      aiScore: 94,
      matchReasons: [
        'Strong match: 7 years of experience with React and TypeScript',
        'Previously built distributed systems at scale (10M+ users)',
        'Led engineering team of 8 developers',
        'Open source contributions to popular Node.js libraries',
      ],
      skillMatch: ['React', 'Node.js', 'TypeScript', 'Microservices', 'AWS'],
      experience: '7 years',
      currentRole: 'Senior Engineer at Tech Corp',
      education: 'BS Computer Science, Stanford University',
    },
    {
      id: 'candidate-2',
      name: 'Michael Rodriguez',
      email: 'michael.r@email.com',
      linkedin: 'linkedin.com/in/mrodriguez',
      appliedDate: '3 days ago',
      aiScore: 89,
      matchReasons: [
        'Strong technical background: 6 years full-stack development',
        'Experience with React, Node.js, and TypeScript',
        'Built microservices architecture at previous company',
        'Strong system design skills demonstrated in projects',
      ],
      skillMatch: ['React', 'Node.js', 'TypeScript', 'Docker', 'PostgreSQL'],
      experience: '6 years',
      currentRole: 'Software Engineer at StartupXYZ',
      education: 'MS Computer Science, MIT',
    },
    {
      id: 'candidate-3',
      name: 'Emily Watson',
      email: 'e.watson@email.com',
      linkedin: 'linkedin.com/in/emilywatson',
      appliedDate: '5 days ago',
      aiScore: 86,
      matchReasons: [
        'Relevant experience: 5 years in backend development',
        'Strong Node.js and TypeScript skills',
        'Experience with cloud infrastructure (AWS, GCP)',
        'Good communication skills based on writing samples',
      ],
      skillMatch: ['Node.js', 'TypeScript', 'AWS', 'MongoDB', 'Redis'],
      experience: '5 years',
      currentRole: 'Backend Engineer at CloudTech',
      education: 'BS Software Engineering, UC Berkeley',
    },
    {
      id: 'candidate-4',
      name: 'David Kim',
      email: 'david.kim@email.com',
      linkedin: 'linkedin.com/in/davidkim',
      appliedDate: '1 week ago',
      aiScore: 82,
      matchReasons: [
        'Solid technical skills: 5 years of experience',
        'Experience with React and modern JavaScript',
        'Built scalable APIs serving millions of requests',
        'Active contributor to tech community',
      ],
      skillMatch: ['React', 'JavaScript', 'Python', 'Docker', 'Kubernetes'],
      experience: '5 years',
      currentRole: 'Full Stack Developer at DataCo',
      education: 'BS Computer Engineering, Georgia Tech',
    },
  ],
  'job-2': [
    {
      id: 'candidate-5',
      name: 'Jessica Park',
      email: 'jessica.park@email.com',
      linkedin: 'linkedin.com/in/jessicapark',
      appliedDate: '1 day ago',
      aiScore: 91,
      matchReasons: [
        'Strong PM background: 5 years in B2B SaaS',
        'Led analytics product line generating $20M ARR',
        'Data-driven approach with strong SQL and analytics skills',
        'Excellent stakeholder management experience',
      ],
      skillMatch: ['Product Strategy', 'B2B SaaS', 'Analytics', 'SQL', 'A/B Testing'],
      experience: '5 years',
      currentRole: 'Senior Product Manager at Analytics Inc',
      education: 'MBA, Harvard Business School',
    },
    {
      id: 'candidate-6',
      name: 'Alex Thompson',
      email: 'alex.t@email.com',
      linkedin: 'linkedin.com/in/alexthompson',
      appliedDate: '4 days ago',
      aiScore: 85,
      matchReasons: [
        'Relevant experience: 4 years in product management',
        'Built data products from 0 to 1',
        'Strong analytical background with engineering degree',
        'User research and customer interview experience',
      ],
      skillMatch: ['Product Management', 'Data Products', 'User Research', 'Roadmapping'],
      experience: '4 years',
      currentRole: 'Product Manager at SaaS Startup',
      education: 'BS Computer Science, Carnegie Mellon',
    },
  ],
  'job-3': [
    {
      id: 'candidate-7',
      name: 'Olivia Martinez',
      email: 'olivia.m@email.com',
      linkedin: 'linkedin.com/in/oliviamartinez',
      appliedDate: '2 days ago',
      aiScore: 93,
      matchReasons: [
        'Exceptional portfolio: 6 years of product design',
        'Led design systems for enterprise SaaS products',
        'Strong UX research skills with proven impact',
        'Experience mentoring junior designers',
      ],
      skillMatch: ['Figma', 'Design Systems', 'UX Research', 'Prototyping', 'User Testing'],
      experience: '6 years',
      currentRole: 'Lead Product Designer at DesignCo',
      education: 'BFA Interaction Design, RISD',
    },
    {
      id: 'candidate-8',
      name: 'Chris Anderson',
      email: 'chris.a@email.com',
      linkedin: 'linkedin.com/in/chrisanderson',
      appliedDate: '5 days ago',
      aiScore: 88,
      matchReasons: [
        'Strong design skills: 5 years of experience',
        'Built and maintained design systems at scale',
        'Proficient in Figma with component library expertise',
        'Cross-functional collaboration experience',
      ],
      skillMatch: ['Figma', 'UI/UX Design', 'Design Systems', 'Wireframing'],
      experience: '5 years',
      currentRole: 'Senior Product Designer at CreativeApp',
      education: 'BS Graphic Design, Parsons',
    },
  ],
};

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);

  const job = mockJobs[jobId];
  const candidates = mockCandidates[jobId] || [];

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
