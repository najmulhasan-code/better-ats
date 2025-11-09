/**
 * Onboarding API Route
 * Creates company and user profile for first-time users
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createUserWithCompany } from '@/lib/auth/user';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !supabaseUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { companyName, companySlug } = body;

    if (!companyName || !companySlug) {
      return NextResponse.json(
        { error: 'Company name and slug are required' },
        { status: 400 }
      );
    }

    // Create user with company
    const user = await createUserWithCompany({
      email: supabaseUser.email!,
      name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email!.split('@')[0],
      avatarUrl: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
      companyName,
      companySlug,
      role: 'admin', // First user is always admin
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Onboarding error:', error);

    // Handle duplicate company slug
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Company slug already exists. Please choose a different name.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create company' },
      { status: 500 }
    );
  }
}
