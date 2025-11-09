'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  ArrowLeft,
  Mail,
  LinkedinIcon,
  Star,
  User,
  MoreVertical,
  Calendar,
  MessageSquare,
  Clock,
  Filter,
  Search,
  Users,
  GripVertical,
} from 'lucide-react';
import Link from 'next/link';
import { useCurrentCompany } from '@/lib/auth/hooks';

// Pipeline stages constant
const PIPELINE_STAGES = [
  { id: 'applied', name: 'New Applicants', color: 'slate' },
  { id: 'screening', name: 'Screening', color: 'blue' },
  { id: 'interview', name: 'Interview', color: 'purple' },
  { id: 'offer', name: 'Offer', color: 'green' },
  { id: 'hired', name: 'Hired', color: 'emerald' },
  { id: 'rejected', name: 'Rejected', color: 'red' },
];

export default function JobPipelinePage() {
  const params = useParams();
  const router = useRouter();
  const { company, loading } = useCurrentCompany();
  const jobId = params.jobId as string;
  const [searchQuery, setSearchQuery] = useState('');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [job, setJob] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch job and candidates from API
  useEffect(() => {
    async function fetchData() {
      if (!company?.slug) return;

      setDataLoading(true);
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
        setDataLoading(false);
      }
    }

    fetchData();
  }, [jobId, company?.slug]);

  if (loading || dataLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="text-slate-600">Loading...</div></div>;
  }

  if (!company) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="text-slate-600">Please sign in to view pipeline</div></div>;
  }

  // Filter candidates by search query
  const filteredCandidates = searchQuery
    ? candidates.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.currentRole.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : candidates;

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Job not found</h2>
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

  // Handle drag and drop
  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Dropped outside list
    if (!destination) return;

    // Dropped in same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Update candidate stage
    setCandidates((prevCandidates) =>
      prevCandidates.map((candidate) =>
        candidate.id === draggableId
          ? { ...candidate, stage: destination.droppableId }
          : candidate
      )
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 80) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (score >= 70) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  const getStageColor = (stageId: string) => {
    switch (stageId) {
      case 'applied':
        return 'bg-slate-50';
      case 'screening':
        return 'bg-blue-50';
      case 'interview':
        return 'bg-purple-50';
      case 'offer':
        return 'bg-emerald-50';
      case 'hired':
        return 'bg-green-50';
      default:
        return 'bg-slate-50';
    }
  };

  // Group candidates by stage
  const candidatesByStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.id] = filteredCandidates
      .filter((c) => c.stage === stage.id)
      .sort((a, b) => b.aiScore - a.aiScore);
    return acc;
  }, {} as Record<string, typeof filteredCandidates>);

  return (
    <div className="h-full flex flex-col">
      {/* Compact Header */}
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-3 transition-colors font-medium text-sm"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
          Back
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">
              {job.title}
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <Users size={14} strokeWidth={2.5} />
                {filteredCandidates.length} candidates
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} strokeWidth={2.5} />
                Posted {job.posted}
              </span>
            </div>
          </div>

          {/* Compact Search */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                strokeWidth={2.5}
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-2 bg-white border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 transition-colors w-48"
              />
            </div>
            <button className="p-2 bg-white border-2 border-slate-200 rounded-lg hover:border-slate-900 transition-colors">
              <Filter size={16} strokeWidth={2.5} className="text-slate-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Drag and Drop Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-3 h-full pb-4">
            {PIPELINE_STAGES.filter((stage) => stage.id !== 'rejected').map((stage) => {
              const stageCandidates = candidatesByStage[stage.id] || [];
              const topScore = stageCandidates[0]?.aiScore;

              return (
                <div key={stage.id} className="w-72 shrink-0 flex flex-col">
                  {/* Stage Header - Compact */}
                  <div
                    className={`${getStageColor(
                      stage.id
                    )} border-2 border-slate-200 px-3 py-2.5 rounded-t-xl`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-sm">{stage.name}</h3>
                      <span className="px-2 py-0.5 bg-white border border-slate-300 text-slate-700 rounded-md text-xs font-bold">
                        {stageCandidates.length}
                      </span>
                    </div>
                    {topScore && (
                      <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
                        <Star size={10} className="text-amber-500" fill="currentColor" />
                        <span className="font-semibold">Top: {topScore}%</span>
                      </div>
                    )}
                  </div>

                  {/* Droppable Area */}
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 bg-slate-50 border-2 border-t-0 ${
                          snapshot.isDraggingOver ? 'border-slate-400 bg-slate-100' : 'border-slate-200'
                        } rounded-b-xl p-2 space-y-2 overflow-y-auto transition-colors`}
                        style={{ minHeight: '400px' }}
                      >
                        {stageCandidates.length === 0 ? (
                          <div className="text-center py-8">
                            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-slate-200 flex items-center justify-center">
                              <User size={20} className="text-slate-400" strokeWidth={2} />
                            </div>
                            <p className="text-xs text-slate-500 font-medium">
                              {snapshot.isDraggingOver ? 'Drop here' : 'No candidates'}
                            </p>
                          </div>
                        ) : (
                          stageCandidates.map((candidate, index) => (
                            <Draggable
                              key={candidate.id}
                              draggableId={candidate.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`group bg-white rounded-lg p-2.5 border-2 ${
                                    snapshot.isDragging
                                      ? 'border-slate-900 shadow-xl rotate-2'
                                      : 'border-slate-200 hover:border-slate-300'
                                  } transition-all cursor-pointer`}
                                >
                                  {/* Drag Handle & Header */}
                                  <div className="flex items-start gap-2 mb-2">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="mt-0.5 text-slate-400 hover:text-slate-700 cursor-grab active:cursor-grabbing"
                                    >
                                      <GripVertical size={16} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-bold text-slate-900 text-sm truncate">
                                        {candidate.name}
                                      </h4>
                                      <p className="text-xs text-slate-600 truncate">
                                        {candidate.currentRole}
                                      </p>
                                    </div>
                                    <button className="p-1 rounded hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <MoreVertical size={14} strokeWidth={2.5} />
                                    </button>
                                  </div>

                                  {/* Score & Date */}
                                  <div className="flex items-center justify-between mb-2">
                                    <div
                                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-xs font-bold ${getScoreColor(
                                        candidate.aiScore
                                      )}`}
                                    >
                                      <Star size={9} fill="currentColor" strokeWidth={2.5} />
                                      {candidate.aiScore}%
                                    </div>
                                    <span className="text-xs text-slate-400">
                                      {candidate.appliedDate}
                                    </span>
                                  </div>

                                  {/* Skills - Compact */}
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {candidate.skillMatch.slice(0, 2).map((skill) => (
                                      <span
                                        key={skill}
                                        className="px-1.5 py-0.5 text-xs bg-slate-100 text-slate-700 rounded"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                    {candidate.skillMatch.length > 2 && (
                                      <span className="px-1.5 py-0.5 text-xs text-slate-500">
                                        +{candidate.skillMatch.length - 2}
                                      </span>
                                    )}
                                  </div>

                                  {/* Quick Actions - Show on hover */}
                                  <div className="flex items-center gap-0.5 pt-2 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a
                                      href={`mailto:${candidate.email}`}
                                      className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                                      onClick={(e) => e.stopPropagation()}
                                      title="Email"
                                    >
                                      <Mail size={13} strokeWidth={2.5} />
                                    </a>
                                    <a
                                      href={`https://${candidate.linkedin}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                                      onClick={(e) => e.stopPropagation()}
                                      title="LinkedIn"
                                    >
                                      <LinkedinIcon size={13} strokeWidth={2.5} />
                                    </a>
                                    <button
                                      className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                                      title="Schedule"
                                    >
                                      <Calendar size={13} strokeWidth={2.5} />
                                    </button>
                                    <button
                                      className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                                      title="Note"
                                    >
                                      <MessageSquare size={13} strokeWidth={2.5} />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
