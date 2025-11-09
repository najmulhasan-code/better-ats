/**
 * Company Settings API
 * Update company information for authenticated user
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !supabaseUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: supabaseUser.email! },
      include: { company: true },
    });

    if (!user || !user.company) {
      return NextResponse.json(
        { error: 'User not found or not associated with a company' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, description, departments, locations, jobTypes } = body;

    // Update company
    const updatedCompany = await prisma.company.update({
      where: { id: user.company.id },
      data: {
        name: name || user.company.name,
        description: description || user.company.description,
        departments: departments || user.company.departments,
        locations: locations || user.company.locations,
        jobTypes: jobTypes || user.company.jobTypes,
      },
    });

    return NextResponse.json({ company: updatedCompany }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating company settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update company settings' },
      { status: 500 }
    );
  }
}
