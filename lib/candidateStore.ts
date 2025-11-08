// Client-side candidate storage (temporary solution before Supabase)
// This allows new applications to persist and show up in the dashboard

export interface NewCandidate {
  id: string;
  companySlug: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  portfolio?: string;
  appliedDate: string;
  appliedDateTimestamp: number;
  aiScore: number;
  stage: string;
  jobTitle: string;
  matchReasons: string[];
  skillMatch: string[];
  experience: string;
  currentRole: string;
  education: string;
  resumeFile?: string; // Base64 or file name
  coverLetter?: string;
}

const STORAGE_KEY = 'better-ats-candidates';

export const candidateStore = {
  // Get all new candidates from localStorage
  getAll: (): NewCandidate[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  // Get candidates for a specific job
  getByJob: (jobId: string, companySlug: string): NewCandidate[] => {
    return candidateStore.getAll().filter(
      (c) => c.jobId === jobId && c.companySlug === companySlug
    );
  },

  // Get a single candidate by ID
  getById: (id: string): NewCandidate | undefined => {
    return candidateStore.getAll().find((c) => c.id === id);
  },

  // Add a new candidate
  add: (candidate: NewCandidate): void => {
    if (typeof window === 'undefined') return;
    try {
      const candidates = candidateStore.getAll();
      candidates.push(candidate);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
    } catch (error) {
      console.error('Failed to save candidate:', error);
    }
  },

  // Update candidate stage
  updateStage: (id: string, newStage: string): void => {
    if (typeof window === 'undefined') return;
    try {
      const candidates = candidateStore.getAll();
      const candidate = candidates.find((c) => c.id === id);
      if (candidate) {
        candidate.stage = newStage;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
      }
    } catch (error) {
      console.error('Failed to update candidate:', error);
    }
  },

  // Clear all (for testing)
  clear: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  },
};

// Generate a simple candidate ID
export function generateCandidateId(): string {
  return `candidate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
