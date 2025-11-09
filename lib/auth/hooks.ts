/**
 * Client-Side Auth Hooks
 * For use in Client Components only
 */

'use client';

import { useEffect, useState } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface UserWithCompany {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  companySlug: string;
  role: string;
  company: {
    slug: string;
    name: string;
  };
}

/**
 * Hook to get current user with company information
 * Fetches from /api/auth/user endpoint
 */
export function useCurrentUser() {
  const [user, setUser] = useState<UserWithCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/auth/user');

        if (!response.ok) {
          if (response.status === 401) {
            // Not authenticated
            setUser(null);
            setLoading(false);
            return;
          }
          throw new Error('Failed to fetch user');
        }

        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { user, loading, error, company: user?.company };
}

/**
 * Hook to get current company
 * Convenience wrapper around useCurrentUser
 */
export function useCurrentCompany() {
  const { company, loading, error } = useCurrentUser();
  return { company, loading, error };
}
