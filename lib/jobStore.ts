// Minimal jobStore utilities used by the new job page

export function generateJobId() {
  // Generate a simple unique id for client-side previews
  return 'job_' + Math.random().toString(36).slice(2, 9);
}

// jobStore is a lightweight in-memory store used only on the client for temporary state
export const jobStore = {
  _store: new Map<string, any>(),
  set(key: string, value: any) {
    this._store.set(key, value);
  },
  get(key: string) {
    return this._store.get(key);
  },
  delete(key: string) {
    this._store.delete(key);
  },
};
