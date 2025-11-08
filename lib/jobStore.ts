// Client-side job storage (temporary solution before Supabase)
// This allows created jobs to persist and show up in the dashboard

export interface NewJob {
  id: string;
  companySlug: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  fullDescription?: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  applicants: number;
  posted: string;
  postedTimestamp: number;
  status: 'active' | 'draft' | 'closed';
}

const STORAGE_KEY = 'better-ats-jobs';

export const jobStore = {
  // Get all jobs from localStorage
  getAll: (): NewJob[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  // Get jobs for a specific company
  getByCompany: (companySlug: string): NewJob[] => {
    return jobStore.getAll().filter((j) => j.companySlug === companySlug);
  },

  // Get a single job by ID
  getById: (id: string): NewJob | undefined => {
    return jobStore.getAll().find((j) => j.id === id);
  },

  // Add a new job
  add: (job: NewJob): void => {
    if (typeof window === 'undefined') return;
    try {
      const jobs = jobStore.getAll();
      jobs.push(job);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    } catch (error) {
      console.error('Failed to save job:', error);
    }
  },

  // Update job status
  updateStatus: (id: string, newStatus: 'active' | 'draft' | 'closed'): void => {
    if (typeof window === 'undefined') return;
    try {
      const jobs = jobStore.getAll();
      const job = jobs.find((j) => j.id === id);
      if (job) {
        job.status = newStatus;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
      }
    } catch (error) {
      console.error('Failed to update job:', error);
    }
  },

  // Delete a job
  delete: (id: string): void => {
    if (typeof window === 'undefined') return;
    try {
      const jobs = jobStore.getAll().filter((j) => j.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    } catch (error) {
      console.error('Failed to delete job:', error);
    }
  },

  // Clear all (for testing)
  clear: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  },
};

// Generate a simple job ID
export function generateJobId(): string {
  return `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get time ago string
export function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return `${Math.floor(seconds / 604800)} weeks ago`;
}
