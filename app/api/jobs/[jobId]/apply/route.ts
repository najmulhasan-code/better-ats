/**
 * Job Application Submission API
 * Public API - allows candidates to apply to jobs
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/client';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const body = await request.json();

    // Validate required fields
    const {
      name,
      email,
      phone,
      currentLocation,
      linkedin,
      portfolio,
      coverLetter,
      resumeData,
      knockoutAnswers = {},
      customAnswers = {},
      veteranStatus,
      disability,
      gender,
      race,
    } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get job to verify it exists and get company info
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { company: true },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Only accept applications for published jobs
    if (job.status !== 'published') {
      return NextResponse.json(
        { error: 'This job is not accepting applications' },
        { status: 400 }
      );
    }

    // Check if candidate already applied
    const existingCandidate = await prisma.candidate.findFirst({
      where: {
        jobId: jobId,
        email: email,
      },
    });

    if (existingCandidate) {
      return NextResponse.json(
        { error: 'You have already applied for this position' },
        { status: 400 }
      );
    }

    // AI score will be calculated later when AI ranking is implemented
    const aiScore = 0;

    // Upload resume to Supabase Storage if file data is provided
    let resumeUrl = null;
    if (resumeData?.data) {
      try {
        const supabase = createClient();

        // Convert base64 to buffer
        const buffer = Buffer.from(resumeData.data, 'base64');

        // Create unique filename
        const timestamp = Date.now();
        const fileExt = resumeData.name.split('.').pop();
        const fileName = `${email.replace('@', '_')}-${timestamp}.${fileExt}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, buffer, {
            contentType: resumeData.type || 'application/pdf',
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Resume upload error:', uploadError);
          // Continue with application even if upload fails - store filename only
          resumeUrl = resumeData.name;
        } else {
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('resumes')
            .getPublicUrl(fileName);

          resumeUrl = publicUrl;
        }
      } catch (uploadErr) {
        console.error('Error uploading resume:', uploadErr);
        // Fallback to just filename
        resumeUrl = resumeData.name;
      }
    } else {
      // No file data provided, just use filename
      resumeUrl = resumeData?.name || null;
    }

    // Prepare questionery data
    const questioneryData = {
      coverLetter: coverLetter || null,
      customAnswers: Object.keys(customAnswers).length > 0 ? customAnswers : undefined,
      knockoutAnswers: Object.keys(knockoutAnswers).length > 0 ? knockoutAnswers : undefined,
      portfolio: portfolio || null,
      linkedin: linkedin || null,
      phone: phone || null,
      currentLocation: currentLocation || null,
    };

    // Create candidate
    const candidate = await prisma.candidate.create({
      data: {
        companySlug: job.companySlug,
        jobId: jobId,
        name,
        email,
        phone: phone || null,
        linkedin: linkedin || null,
        portfolio: portfolio || null,
        appliedDate: 'Just now',
        appliedDateTimestamp: BigInt(Date.now()),
        aiScore,
        stage: 'applied',
        jobTitle: job.title,
        matchReasons: [
          'Resume submitted successfully',
          'Application under review',
          'Will be evaluated by hiring team',
        ],
        skillMatch: [],
        experience: 'See resume',
        currentRole: currentLocation || 'See resume',
        education: 'See resume',
        resumeFile: resumeUrl,
        coverLetter: coverLetter || null,
        questioneryData: questioneryData as any, // Store questionery data
      },
    });

    // Store knockout question responses
    if (Object.keys(knockoutAnswers).length > 0) {
      const knockoutResponses = Object.entries(knockoutAnswers).map(([questionId, answer]) => ({
        candidateId: candidate.id,
        questionId,
        answer: { value: answer, type: 'knockout' },
      }));

      // Prisma's generated types are strict for Json inputs; cast to any to
      // satisfy TypeScript here because the data originates from request JSON.
      await prisma.applicationResponse.createMany({
        data: knockoutResponses as any,
      });
    }

    // Store custom question responses
    if (Object.keys(customAnswers).length > 0) {
      const customResponses = Object.entries(customAnswers).map(([questionId, answer]) => ({
        candidateId: candidate.id,
        questionId,
        answer: { value: answer, type: 'custom' },
      }));

      await prisma.applicationResponse.createMany({
        data: customResponses as any,
      });
    }

    // Store EEO responses
    const eeoResponses = [];
    if (veteranStatus) {
      eeoResponses.push({
        candidateId: candidate.id,
        questionId: 'veteranStatus',
        answer: { value: veteranStatus, type: 'eeo' },
      });
    }
    if (disability) {
      eeoResponses.push({
        candidateId: candidate.id,
        questionId: 'disability',
        answer: { value: disability, type: 'eeo' },
      });
    }
    if (gender) {
      eeoResponses.push({
        candidateId: candidate.id,
        questionId: 'gender',
        answer: { value: gender, type: 'eeo' },
      });
    }
    if (race) {
      eeoResponses.push({
        candidateId: candidate.id,
        questionId: 'race',
        answer: { value: race, type: 'eeo' },
      });
    }

    if (eeoResponses.length > 0) {
      await prisma.applicationResponse.createMany({
        data: eeoResponses,
      });
    }

    // Increment applicants count on the job
    await prisma.job.update({
      where: { id: jobId },
      data: {
        applicants: {
          increment: 1,
        },
      },
    });

    // Trigger analysis asynchronously (don't block response)
    if (process.env.ANTHROPIC_API_KEY) {
      // Don't await - let it run in background
      import('@/lib/integration').then(({ analyzeApplication }) => {
        analyzeApplication(candidate.id, true, true).catch((error) => {
          console.error(`Error analyzing application ${candidate.id}:`, error);
        });
      });
    }

    return NextResponse.json({
      success: true,
      candidateId: candidate.id,
    });
  } catch (error: any) {
    console.error('Error submitting application:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit application' },
      { status: 500 }
    );
  }
}
